"""Privacy-safe history boundary.

Grant Scout currently has no accounts, so it never persists or returns user
questions. The private, owner-scoped schema in ``supabase/migrations`` is for a
future authenticated opt-in flow; it must not be wired to this public demo.
"""

RECENT_LIMIT_DEFAULT = 10


def record_search_async(question: str, answer: str, sources: list) -> None:
    """Deliberate no-op until authenticated, explicit opt-in exists."""
    return None


def fetch_recent_searches(limit: int = RECENT_LIMIT_DEFAULT) -> list:
    """Public callers never receive search history."""
    return []
