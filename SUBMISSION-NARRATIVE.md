# Grant Scout — Winning Submission Narrative

Grant Scout is an evidence-first funding copilot for solo, non-incorporated founders. A **Discovery agent** deterministically routes each question to live Grants.gov data or SerpApi; an **Eligibility agent** uses Gemini only over returned evidence; and a new **Readiness agent** converts every cited result into an evidence-strength label and verification queue. The product never upgrades a search snippet into a claim of verified eligibility.

The problem is painfully specific: most grant discovery assumes the applicant already has an LLC, corporation, nonprofit, or university affiliation. Founders lose hours reading programs that exclude them. Grant Scout searches live sources, separates plausible individual-access programs from likely entity-gated programs, cites every claim, and says when the evidence is insufficient.

This is stronger than generic AI search because the workflow is auditable: source routing happens in code, the live query is shown, every program links to its real source, and the readiness dossier tells the founder exactly what still needs human verification. The SerpApi integration is central, quota-aware, live at request time, and protected by a fallback to the authoritative Grants.gov API for federal questions.

Judge path: ask for “AI grants for a non-incorporated solo founder in the US,” inspect the live sources, then compare the Discovery → Eligibility → Readiness trace and verification actions.

