import asyncio
import json
import logging
import os
import sys
import time
from http.server import BaseHTTPRequestHandler

_T_MODULE_START = time.time()

sys.path.insert(0, os.path.dirname(__file__))

from google.adk.runners import InMemoryRunner

_T_ADK_IMPORTED = time.time()

from _lib import grant_scout_agent
from _ratelimit import check_rate_limit, get_client_ip

_T_MODULE_READY = time.time()

logger = logging.getLogger("grant_scout.chat")
logging.basicConfig(level=logging.INFO, stream=sys.stderr)

MAX_BODY_BYTES = 16_384
MAX_QUESTION_CHARS = 1_000


def _perf_log(label: str, seconds: float) -> None:
    # Lightweight perf instrumentation, printed to stderr so `vercel logs`
    # captures it. Added 2026-08-25 to diagnose real 7-26s /api/chat latency
    # ahead of DevNetwork judging; kept in place (cheap, no user-facing
    # effect) for ongoing visibility. Real findings from this instrumentation
    # (production, 2026-08-25): cold start ~1.6-1.9s one-time per worker;
    # SerpApi call itself varies 1.1-10.8s; and critically, the agent
    # sometimes called tool_search_funding_programs TWICE for one question,
    # which is what actually produced the worst observed latencies (13.0s
    # and 19.4s in a 5-request sample, vs 5.2-8.5s for single-search
    # requests). That double-search behavior is the fix applied below via
    # the agent's instruction in _lib.py.
    print(f"[grant_scout.perf] {label}: {seconds:.3f}s", file=sys.stderr, flush=True)


# This fires once per cold worker, at module import time.
_perf_log("cold_start.import_adk_runners", _T_ADK_IMPORTED - _T_MODULE_START)
_perf_log("cold_start.import_lib_and_ratelimit", _T_MODULE_READY - _T_ADK_IMPORTED)
_perf_log("cold_start.total_module_import", _T_MODULE_READY - _T_MODULE_START)


class UpstreamError(Exception):
    """Raised when SerpApi/grants.gov/Gemini fail in a way we can't recover from."""


# Both of the agent's live-search tools (see _lib.py). Recognizing both here
# is what actually wires grants.gov results into the response -- ADK's event
# stream identifies a tool call by name, and this used to only look for
# "tool_search_funding_programs".
SEARCH_TOOL_NAMES = {"tool_search_funding_programs", "tool_search_grants_gov"}


def _ask_grant_scout(question: str) -> dict:
    async def _run():
        t_runner_start = time.time()
        runner = InMemoryRunner(agent=grant_scout_agent)
        t_runner_built = time.time()
        _perf_log("request.build_runner", t_runner_built - t_runner_start)
        try:
            events = await runner.run_debug(question, quiet=True)
        except Exception as exc:
            logger.error("Agent run failed: %s", exc)
            raise UpstreamError("The agent backend (Gemini) failed to respond.") from exc
        finally:
            _perf_log("request.run_debug_total", time.time() - t_runner_built)

        answer = "No response from Grant Scout."
        searched = False
        search_query = None
        sources: list = []
        tool_call_count = 0
        per_tool_call_counts: dict[str, int] = {}
        tool_errors: list[str] = []

        for event in events:
            if not event.content or not event.content.parts:
                continue
            for part in event.content.parts:
                fc = part.function_call
                if fc and fc.name in SEARCH_TOOL_NAMES:
                    searched = True
                    tool_call_count += 1
                    per_tool_call_counts[fc.name] = per_tool_call_counts.get(fc.name, 0) + 1
                    args = fc.args
                    if args is None:
                        logger.warning("function_call.args was None for %s; no query extracted", fc.name)
                    elif search_query is None:
                        search_query = args.get("query")
                fr = part.function_response
                if fr and isinstance(fr.response, dict):
                    resp = fr.response
                    if "results" in resp and isinstance(resp["results"], list):
                        sources.extend(resp["results"])
                    err = resp.get("error")
                    if err:
                        tool_errors.append(err)
                if part.text:
                    answer = part.text

        for tool_name, count in per_tool_call_counts.items():
            if count > 1:
                logger.warning(
                    "%s was called %d times in one request (prompt instructs at most once "
                    "per tool) -- this is a known driver of worst-case latency; investigate "
                    "if this recurs.",
                    tool_name,
                    count,
                )
        _perf_log("request.tool_call_count", tool_call_count)

        # Cap the combined result list (SerpApi caps at 10 itself; grants.gov at 5) so a
        # fallback second tool call can never blow up the UI's source list unbounded.
        sources = sources[:10]

        searched_successfully = searched and tool_call_count > 0 and len(sources) > 0
        if not searched_successfully:
            message = (
                tool_errors[0]
                if tool_errors
                else "Live search returned no usable sources. Please refine your question and try again."
            )
            raise UpstreamError(message)

        return {
            "answer": answer,
            "searched_live": True,
            "search_query": search_query,
            "sources": sources,
        }

    return asyncio.run(_run())


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        t_request_start = time.time()
        client_ip = get_client_ip(self.headers)
        allowed, retry_after = check_rate_limit(client_ip)
        if not allowed:
            self.send_response(429)
            self.send_header("Content-Type", "application/json")
            self.send_header("Retry-After", str(retry_after))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            body = json.dumps(
                {
                    "error": "Grant Scout is getting a lot of requests right now to protect a shared "
                    "free search budget. Please try again in a little while.",
                }
            ).encode("utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
        except (TypeError, ValueError):
            self._send_json(400, {"error": "Invalid Content-Length header."})
            return
        if length < 0 or length > MAX_BODY_BYTES:
            self._send_json(413, {"error": "Request body is too large."})
            return
        body = self.rfile.read(length) if length else b"{}"
        try:
            try:
                data = json.loads(body)
            except json.JSONDecodeError as exc:
                logger.warning("Malformed JSON body: %s", exc)
                self._send_json(400, {"error": "Malformed JSON request body."})
                return

            if not isinstance(data, dict):
                self._send_json(400, {"error": "Request body must be a JSON object."})
                return

            question = str(data.get("question", "")).strip()
            if not question:
                self._send_json(400, {"error": "Missing question"})
                return
            if len(question) > MAX_QUESTION_CHARS:
                self._send_json(400, {"error": f"Question must be {MAX_QUESTION_CHARS} characters or fewer."})
                return

            result = _ask_grant_scout(question)
            self._send_json(200, result)
        except UpstreamError as exc:
            self._send_json(503, {"error": str(exc)})
        except Exception as exc:
            logger.error("Unexpected error handling /api/chat request: %s", exc)
            self._send_json(500, {"error": "An unexpected server error occurred."})
        finally:
            _perf_log("request.do_POST_total", time.time() - t_request_start)

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(body)
