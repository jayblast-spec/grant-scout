"""Per-IP + global token-bucket rate limiting for /api/chat.

Why in-process rather than an external store: this project's Vercel account
has no free Edge Config slot available (its one free-tier Edge Config is
already used by an unrelated live project and its write quota is exhausted
for the current 30-day cycle), and provisioning a new Upstash/KV database
requires interactive marketplace terms acceptance that isn't available in
an unattended session. A Vercel Firewall rate-limit rule (10 req/hour/IP on
/api/chat) has been staged as a draft in the dashboard for Joy to publish --
that gives a real edge-level, cross-instance counter for free if the plan
allows it. Until then, this module is the active enforcement layer.

This bucket lives in module-level memory, so it is authoritative within a
warm Vercel Python worker (the common case for a low-traffic hackathon demo)
but resets on cold start. That's an acceptable, documented limitation, not a
silent gap: the real budget backstop is the SerpApi account-quota circuit
breaker in _lib.py, which checks SerpApi's own authoritative usage counter
(a real shared store that already exists for this exact resource) before
ever spending a search.
"""

import threading
import time

_LOCK = threading.Lock()

# {ip: [timestamps within the current window]}
_ip_hits: dict[str, list[float]] = {}
# timestamps for all requests, regardless of IP
_global_hits: list[float] = []

IP_LIMIT = 10
IP_WINDOW_SECONDS = 3600

GLOBAL_LIMIT = 25
GLOBAL_WINDOW_SECONDS = 3600


def _prune(hits: list[float], now: float, window: float) -> list[float]:
    return [t for t in hits if now - t < window]


def check_rate_limit(client_ip: str) -> tuple[bool, int]:
    """Returns (allowed, retry_after_seconds).

    Records the hit immediately if allowed, so this must be called at most
    once per incoming request.
    """
    now = time.time()
    client_ip = client_ip or "unknown"

    with _LOCK:
        global _global_hits
        _global_hits = _prune(_global_hits, now, GLOBAL_WINDOW_SECONDS)
        if len(_global_hits) >= GLOBAL_LIMIT:
            oldest = min(_global_hits)
            retry_after = max(1, int(GLOBAL_WINDOW_SECONDS - (now - oldest)))
            return False, retry_after

        ip_hits = _prune(_ip_hits.get(client_ip, []), now, IP_WINDOW_SECONDS)
        if len(ip_hits) >= IP_LIMIT:
            oldest = min(ip_hits)
            retry_after = max(1, int(IP_WINDOW_SECONDS - (now - oldest)))
            _ip_hits[client_ip] = ip_hits
            return False, retry_after

        ip_hits.append(now)
        _global_hits.append(now)
        _ip_hits[client_ip] = ip_hits
        return True, 0


def get_client_ip(headers) -> str:
    """Best-effort client IP extraction behind Vercel's proxy."""
    forwarded = headers.get("x-forwarded-for") or headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = headers.get("x-real-ip") or headers.get("X-Real-Ip")
    if real_ip:
        return real_ip.strip()
    return "unknown"
