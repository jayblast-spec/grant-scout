import importlib
import sys
import types
import unittest
from pathlib import Path

API_DIR = Path(__file__).resolve().parents[1] / "frontend" / "api"
sys.path.insert(0, str(API_DIR))

google = types.ModuleType("google")
adk = types.ModuleType("google.adk")
agents = types.ModuleType("google.adk.agents")
agents.Agent = lambda **kwargs: kwargs
sys.modules.setdefault("google", google)
sys.modules.setdefault("google.adk", adk)
sys.modules.setdefault("google.adk.agents", agents)

grant_lib = importlib.import_module("_lib")
history = importlib.import_module("_history")


class SafeUrlTests(unittest.TestCase):
    def test_accepts_only_http_urls_with_hosts(self):
        self.assertEqual(grant_lib._safe_http_url("https://example.com/grant"), "https://example.com/grant")
        self.assertEqual(grant_lib._safe_http_url("http://example.com"), "http://example.com")
        for value in ("javascript:alert(1)", "data:text/html,x", "/relative", "https:///missing-host", None):
            self.assertIsNone(grant_lib._safe_http_url(value))


class PrivateHistoryTests(unittest.TestCase):
    def test_public_history_is_always_disabled(self):
        self.assertIsNone(history.record_search_async("question", "answer", []))
        self.assertEqual(history.fetch_recent_searches(), [])

    def test_chat_does_not_persist_public_questions(self):
        chat_source = (API_DIR / "chat.py").read_text(encoding="utf-8")
        self.assertNotIn("record_search_async", chat_source)

    def test_future_history_schema_is_owner_scoped(self):
        migrations = list(
            (Path(__file__).resolve().parents[1] / "supabase" / "migrations").glob(
                "*_private_grant_history.sql"
            )
        )
        self.assertEqual(len(migrations), 1)
        migration = migrations[0].read_text(encoding="utf-8")
        self.assertIn("enable row level security", migration)
        self.assertIn("force row level security", migration)
        self.assertIn("auth.uid()) = user_id", migration)
        self.assertIn("revoke all on table public.grant_scout_searches from anon", migration)
        self.assertIn("expires_at", migration)


if __name__ == "__main__":
    unittest.main()
