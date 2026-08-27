import logging
import os
import sys
import time
from urllib.parse import urlparse

import requests
from google.adk.agents import Agent


def _perf_log(label: str, seconds: float) -> None:
    # Lightweight perf instrumentation kept for ongoing latency visibility;
    # see api/chat.py's _perf_log docstring for the real findings this
    # produced on 2026-08-25.
    print(f"[grant_scout.perf] {label}: {seconds:.3f}s", file=sys.stderr, flush=True)

os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "False")

logger = logging.getLogger("grant_scout")

SERPAPI_URL = "https://serpapi.com/search"
SERPAPI_ACCOUNT_URL = "https://serpapi.com/account.json"

# SerpApi's free tier is 250 searches/month. Below this many searches
# remaining for the month, refuse new live searches rather than risk running
# the account fully dry before a judge/user gets to try the demo. This reads
# SerpApi's own authoritative usage counter (a real, already-existing shared
# store for the exact resource being protected) and costs nothing against
# the search quota to check.
SERPAPI_MIN_SEARCHES_BUFFER = 15


def _safe_http_url(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = urlparse(value.strip())
    except ValueError:
        return None
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    return value.strip()


def _serpapi_searches_remaining(api_key: str) -> int | None:
    """Returns remaining searches this month, or None if the check itself failed."""
    t0 = time.time()
    try:
        resp = requests.get(SERPAPI_ACCOUNT_URL, params={"api_key": api_key}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.warning("SerpApi account-quota check failed: %s", exc)
        return None
    finally:
        _perf_log("serpapi.quota_check", time.time() - t0)

    remaining = data.get("total_searches_left")
    if remaining is None:
        remaining = data.get("plan_searches_left")
    return remaining if isinstance(remaining, int) else None


def tool_search_funding_programs(query: str) -> dict:
    """Run a live Google Search via SerpApi for funding/grant programs matching the query.

    Args:
        query: A search query describing the funding need, e.g.
            "grants for non-incorporated solo founders in AI".

    Returns:
        A dict with the real organic search results (title, link, snippet) returned
        by SerpApi for this exact query, plus the query that was run. This is the
        only source of grant/program information the agent is allowed to cite -
        it must never invent a program that isn't present in these results.
    """
    api_key = os.environ.get("SERPAPI_KEY")
    if not api_key:
        return {"error": "SERPAPI_KEY is not configured on the server.", "query": query, "results": []}

    remaining = _serpapi_searches_remaining(api_key)
    if remaining is not None and remaining <= SERPAPI_MIN_SEARCHES_BUFFER:
        logger.warning("SerpApi quota guard tripped: %s searches left this month", remaining)
        return {
            "error": "Live search is temporarily paused to protect this demo's shared monthly search "
            "budget. Please try again later.",
            "query": query,
            "results": [],
        }

    params = {
        "engine": "google",
        "q": query,
        "api_key": api_key,
        "num": 6,
    }
    # Measured against production (2026-08-25): real SerpApi call latency for this
    # endpoint ranged 1.1s-10.8s across 5 live requests, never approaching the
    # previous 20s timeout. 12s gives real headroom above the observed worst case
    # while capping how long a single request can be held hostage by an outlier
    # SerpApi response, instead of silently absorbing up to 20s of dead time.
    t0 = time.time()
    try:
        resp = requests.get(SERPAPI_URL, params=params, timeout=12)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.Timeout:
        logger.error("SerpApi request timed out after 12s")
        return {
            "error": "Live search took too long and was skipped for this response. "
            "Please try again.",
            "query": query,
            "results": [],
        }
    except Exception as exc:
        logger.error("SerpApi request failed: %s", exc)
        return {"error": "SerpApi request failed.", "query": query, "results": []}
    finally:
        _perf_log("serpapi.search_call", time.time() - t0)

    if "error" in data:
        logger.error("SerpApi returned an error: %s", data["error"])
        return {"error": data["error"], "query": query, "results": []}

    organic = data.get("organic_results", [])
    if not isinstance(organic, list):
        organic = []
    results = [
        {
            "title": r.get("title"),
            "link": _safe_http_url(r.get("link")),
            "snippet": r.get("snippet"),
        }
        for r in organic[:10]
        if isinstance(r, dict) and _safe_http_url(r.get("link"))
    ]
    return {"query": query, "results": results, "result_count": len(results)}


grant_scout_agent = Agent(
    name="grant_scout_agent",
    model="gemini-flash-lite-latest",
    instruction=(
        "You are Grant Scout, an agent that helps solo and non-incorporated founders find "
        "funding programs (grants, non-dilutive funding, accelerators, fellowships) they might "
        "actually qualify for. "
        "\n\n"
        "For every user question, you MUST call tool_search_funding_programs with a well-formed "
        "search query derived from the user's question before answering. Never answer from prior "
        "knowledge alone - the search results are your only source of truth about what programs "
        "exist. "
        "\n\n"
        "Call tool_search_funding_programs EXACTLY ONCE per question, no matter what the results "
        "look like. Do not call it a second time to refine the query, fetch more results, or double-"
        "check anything - a second live search roughly doubles response time for the person waiting "
        "on this answer, which is not an acceptable trade for marginally better results. Answer from "
        "the single set of results you already have, being honest about their limits if they're thin "
        "or ambiguous, rather than searching again. "
        "\n\n"
        "After the tool returns real search-result titles, URLs, and snippets, review each one and: "
        "(1) summarize which listed programs plausibly do NOT require legal incorporation to apply "
        "or to receive funds, explaining your reasoning from the title/snippet; "
        "(2) flag which ones likely DO require an incorporated entity (LLC, C-corp, nonprofit) or "
        "where you cannot tell from the snippet alone. Never imply that you opened or read the linked page; "
        "(3) always cite the real URL for every program you mention. "
        "If the search results don't clearly answer the question, say so honestly instead of "
        "guessing - never fabricate a grant, deadline, or amount that isn't in the search results. "
        "Keep the answer concise and scannable, using short bullet points."
    ),
    tools=[tool_search_funding_programs],
)

# NOTE on streaming (2026-08-25): a real token-by-token streaming path was
# built and tested against this project's live Vercel deployment, using
# google-adk's InMemoryRunner.run_async(run_config=RunConfig(streaming_mode=
# StreamingMode.SSE)) combined with manual HTTP chunked-transfer-encoding
# writes from the BaseHTTPRequestHandler in chat.py (headers sent without
# Content-Length, body written incrementally via self.wfile.write()+flush()).
# Result: the request's internal access log showed status 200 being sent,
# but the client received a platform-level 500 (Next.js's generic error
# page) instead of the streamed body, reproduced across multiple real
# deployed requests. This matches the exact risk called out for this fix:
# Vercel's Python serverless runtime does not reliably support this
# low-level streaming pattern in production, even though it can look fine
# locally. Given the 2026-09-03 deadline and the non-negotiable requirement
# not to jeopardize the working live demo, this was reverted in favor of the
# verified-safe fix actually shipped: the "search exactly once" instruction
# above (which directly targets the confirmed real cause of the worst-case
# latencies) plus the tightened SerpApi timeout. If a future session revisits
# streaming, the honest path is either a Vercel Node/Edge runtime function
# (which does support real ReadableStream responses) fronting this same
# agent logic, or confirming with Vercel support whether/how chunked Python
# responses are supported before re-attempting the raw socket approach.
