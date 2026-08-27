import json
import logging
import sys
from http.server import BaseHTTPRequestHandler

logger = logging.getLogger("grant_scout.history_api")
logging.basicConfig(level=logging.INFO, stream=sys.stderr)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Public history is intentionally unavailable. A future private
            # history API must authenticate the caller and scope rows by user.
            self._send_json(200, {"items": []})
        except Exception as exc:
            # This section is a genuine addition, not a critical path -- if
            # anything goes wrong, degrade to an empty list rather than a
            # 500 the frontend has to specially handle.
            logger.error("Unexpected error handling /api/history request: %s", exc)
            self._send_json(200, {"items": []})

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        # Never cache privacy-sensitive API decisions at a shared layer.
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(body)
