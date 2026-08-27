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

# grants.gov's real public Search API (search2). POST, JSON body, no API key.
# Verified live 2026-08-27 with a real request (POST keyword="artificial
# intelligence") against the exact endpoint below; response shape confirmed
# as { errorcode, msg, data: { hitCount, oppHits: [{ id, number, title,
# agencyCode, agency, openDate, closeDate, oppStatus, docType, cfdaList }] } }.
# The real opportunity detail page for a given oppHit lives at
# https://www.grants.gov/search-results-detail/{id} (confirmed by fetching
# that exact URL for a real id returned by the live search above).
GRANTS_GOV_SEARCH_URL = "https://api.grants.gov/v1/api/search2"
GRANTS_GOV_DETAIL_URL_TEMPLATE = "https://www.grants.gov/search-results-detail/{opp_id}"

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


def tool_search_grants_gov(query: str) -> dict:
    """Run a live search against grants.gov's public Search API for real US federal grant opportunities.

    Calls https://api.grants.gov/v1/api/search2 (POST, no API key required) - this
    is grants.gov's own public search endpoint, the same one grants.gov's website
    search uses. Use this instead of tool_search_funding_programs specifically when
    the user's question is about US federal grant opportunities (mentions "federal",
    "grants.gov", a specific US federal agency, SBIR/STTR, or similar).

    Args:
        query: A plain-language funding topic to search for, e.g. "AI research
            grants for individuals" - sent as grants.gov's `keyword` parameter.

    Returns:
        A dict with real, structured grants.gov opportunities - title, the
        opportunity's real grants.gov detail-page link (https://www.grants.gov/
        search-results-detail/{oppId}), and a snippet built only from that
        opportunity's real agency, status, and close date. This is the only
        source of grants.gov-specific program information the agent is allowed
        to cite; it must never invent an opportunity, deadline, or agency that
        isn't in this data.
    """
    payload = {"keyword": query, "rows": 5, "oppStatuses": "posted|forecasted"}
    t0 = time.time()
    try:
        resp = requests.post(GRANTS_GOV_SEARCH_URL, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.Timeout:
        logger.error("grants.gov search2 request timed out after 10s")
        return {
            "error": "Live grants.gov search took too long and was skipped for this response. "
            "Please try again.",
            "query": query,
            "results": [],
        }
    except Exception as exc:
        logger.error("grants.gov search2 request failed: %s", exc)
        return {"error": "grants.gov search request failed.", "query": query, "results": []}
    finally:
        _perf_log("grants_gov.search_call", time.time() - t0)

    if not isinstance(data, dict) or data.get("errorcode") not in (0, "0"):
        msg = data.get("msg") if isinstance(data, dict) else None
        logger.error("grants.gov search2 returned an error: %s", msg)
        return {"error": msg or "grants.gov search returned an error.", "query": query, "results": []}

    opp_hits = ((data.get("data") or {}).get("oppHits")) or []
    if not isinstance(opp_hits, list):
        opp_hits = []

    results = []
    for hit in opp_hits[:5]:
        if not isinstance(hit, dict):
            continue
        opp_id = hit.get("id")
        title = hit.get("title")
        link = _safe_http_url(GRANTS_GOV_DETAIL_URL_TEMPLATE.format(opp_id=opp_id)) if opp_id else None
        if not title or not link:
            continue
        agency = hit.get("agency") or hit.get("agencyCode") or "Agency not specified"
        close_date = hit.get("closeDate") or "not listed (forecasted opportunity)"
        status = hit.get("oppStatus") or "unknown"
        opp_number = hit.get("number") or "n/a"
        results.append(
            {
                "title": title,
                "link": link,
                "snippet": f"{agency} · Opportunity #{opp_number} · Status: {status} · Closes: {close_date}",
            }
        )

    return {"query": query, "results": results, "result_count": len(results)}


# Which tool actually fires is decided in code (see route_question below), not left to
# gemini-flash-lite-latest's judgment. Measured against production (2026-08-27): with both
# tools offered and a soft instruction telling the model when to prefer grants.gov, it chose
# tool_search_funding_programs (SerpApi) on every single tested request, including questions
# that said "grants.gov" outright - confirmed via the absence of any grants_gov.search_call
# perf log across multiple live production requests. A small, fast model reliably following a
# nuanced two-tool routing instruction turned out not to hold up under test, so routing is now
# a deterministic keyword check before the agent is even built, and each request's agent is
# given exactly one tool - there is no wrong tool for the model to pick because there is only
# one available.
FEDERAL_SIGNAL_TERMS = (
    "federal",
    "grants.gov",
    "grants gov",
    "sbir",
    "sttr",
    "nih",
    "nsf",
    "nasa",
    "darpa",
    "doe grant",
    "department of energy",
    "usda grant",
    "epa grant",
    "cfda",
    "assistance listing",
)


def route_question(question: str) -> str:
    """Returns 'grants_gov' or 'serpapi' - the one tool this question's agent will get."""
    lowered = question.lower()
    if any(term in lowered for term in FEDERAL_SIGNAL_TERMS):
        return "grants_gov"
    return "serpapi"


_SHARED_INSTRUCTION = (
    "You are Grant Scout, an agent that helps solo and non-incorporated founders find "
    "funding programs (grants, non-dilutive funding, accelerators, fellowships) they might "
    "actually qualify for. "
    "\n\n"
    "You have exactly one live search tool. Call it once with a well-formed search query "
    "derived from the user's question before answering - never answer from prior knowledge "
    "alone, the search results are your only source of truth about what programs exist. Call "
    "the tool only once; do not call it again for the same question even if the results seem "
    "thin, since a second live search roughly doubles response time for the person waiting on "
    "this answer. "
    "\n\n"
    "After the tool returns real results, review each one and: "
    "(1) summarize which listed programs plausibly do NOT require legal incorporation to apply "
    "or to receive funds, explaining your reasoning from the title/snippet; "
    "(2) flag which ones likely DO require an incorporated entity (LLC, C-corp, nonprofit) or "
    "where you cannot tell from the snippet alone. Never imply that you opened or read the linked page; "
    "(3) always cite the real URL for every program you mention. "
    "If the search results don't clearly answer the question, say so honestly instead of "
    "guessing - never fabricate a grant, deadline, or amount that isn't in the search results. "
    "Keep the answer concise and scannable, using short bullet points."
)


def build_grant_scout_agent(route: str) -> Agent:
    """route is 'grants_gov' or 'serpapi', from route_question(). Builds a fresh Agent scoped
    to exactly that one tool - see the FEDERAL_SIGNAL_TERMS comment above for why."""
    if route == "grants_gov":
        tool = tool_search_grants_gov
    else:
        tool = tool_search_funding_programs
    return Agent(
        name="grant_scout_agent",
        model="gemini-flash-lite-latest",
        instruction=_SHARED_INSTRUCTION,
        tools=[tool],
    )


# Kept for any external code/tests that still import a module-level agent directly; routes
# like the pre-fix behavior's default (SerpApi) rather than being used by chat.py at request
# time, which now always calls build_grant_scout_agent(route_question(question)) instead.
grant_scout_agent = build_grant_scout_agent("serpapi")

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
