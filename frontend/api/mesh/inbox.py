"""/api/mesh/inbox -- agent-mesh inbox. Read-only by design.

Reports this agent's real SerpApi quota remaining and its real recent
search history from Supabase. It never calls tool_search_funding_programs,
so receiving a mesh message never spends live SerpApi search quota.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from _lib import _serpapi_searches_remaining
from _history import fetch_recent_searches

ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
        except (TypeError, ValueError):
            length = 0
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            payload = None

        api_key = os.environ.get("SERPAPI_KEY")
        remaining = _serpapi_searches_remaining(api_key) if api_key else None
        try:
            recent = fetch_recent_searches(limit=5)
        except Exception:
            recent = []

        self._send_json(
            200,
            {
                "agent": "grant-scout",
                "received": True,
                "received_payload": payload,
                "real_status": {
                    "serpapi_searches_remaining": remaining,
                    "recent_real_searches_cached": len(recent),
                },
            },
        )

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Vary", "Origin")

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self._cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
