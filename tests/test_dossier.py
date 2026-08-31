import importlib.util
from pathlib import Path


SPEC = importlib.util.spec_from_file_location("grant_lib", Path(__file__).parents[1] / "frontend" / "api" / "_lib.py")
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


def test_dossier_never_promotes_snippet_to_verified_eligibility():
    rows = module.build_opportunity_dossier([
        {"title": "Example", "link": "https://www.grants.gov/search-results-detail/1", "snippet": "Eligible individuals may apply"}
    ])
    assert rows[0]["evidence_strength"] == "primary registry"
    assert rows[0]["eligibility_signal"] == "present"
    assert rows[0]["next_action"].startswith("Open the cited source")
