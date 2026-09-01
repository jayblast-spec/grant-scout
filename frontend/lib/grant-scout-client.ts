export type GrantSource = {
  title: string;
  url: string;
  snippet?: string;
};

export type DossierEntry = {
  title: string;
  url: string;
  snippet?: string;
  evidenceStrength: string;
  eligibilitySignal: string;
  nextAction: string;
};

/**
 * Shape returned by askGrantScout, after mapping the raw API response below.
 */
export type ChatResponse = {
  answer: string;
  sources: GrantSource[];
  searchQuery?: string;
  dossier: DossierEntry[];
  route: string[];
};

/**
 * CONTRACT: this must match the exact JSON shape returned by the Python
 * handler in `frontend/api/chat.py` (`_ask_grant_scout`'s return dict) and
 * by `tool_search_funding_programs` in `frontend/api/_lib.py` for each
 * source entry. The Python side is snake_case; this type documents the
 * exact wire shape before askGrantScout() below maps it to ChatResponse
 * (camelCase). If you rename a field on either side, update both and this
 * type, or the mapping below will silently drop data instead of erroring.
 *
 * Python source of truth:
 *   - frontend/api/chat.py: { answer, searched_live, search_query, sources, dossier, route }
 *   - frontend/api/_lib.py: each source item is { title, link, snippet };
 *     build_opportunity_dossier() adds { evidence_strength, eligibility_signal, next_action }
 *     per source (evidence quality only, never an eligibility verdict - see its docstring).
 *
 * NOTE: a request can also be intercepted before it ever reaches chat.py -
 * Vercel's edge firewall (the /api/chat rate limit) returns its own error
 * shape, { error: { code, message, id } }, where `error` is an object, not
 * our API's plain string. extractErrorMessage() below handles both.
 */
export type RawChatApiResponse = {
  answer: string;
  searched_live: boolean;
  search_query: string | null;
  sources: Array<{ title?: string; link?: string; snippet?: string }>;
  dossier?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    evidence_strength?: string;
    eligibility_signal?: string;
    next_action?: string;
  }>;
  route?: string[];
  error?: string | { code?: string; message?: string; id?: string };
};

function extractErrorMessage(rawError: RawChatApiResponse["error"], status: number): string {
  if (typeof rawError === "string" && rawError) return rawError;
  if (rawError && typeof rawError === "object") {
    if (rawError.message) {
      return status === 403
        ? "Grant Scout is getting a lot of requests right now to protect a shared free search budget. Please try again in a little while."
        : rawError.message;
    }
  }
  return `The agent returned ${status}.`;
}

export const EXAMPLE_PROMPTS = [
  "Grants for a solo, non-incorporated founder building developer tools in the US",
  "Non-dilutive funding I can apply for as an individual, no company registered",
  "Fellowships open to independent builders working on AI infrastructure",
];

export async function askGrantScout(message: string): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: message }),
  });
  let data: RawChatApiResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error(`The agent returned ${res.status} with no readable response.`);
  }
  if (!res.ok || data.error) {
    throw new Error(extractErrorMessage(data.error, res.status));
  }
  const sources: GrantSource[] = (data.sources ?? []).map((s) => ({
    title: s.title ?? s.link ?? "Source",
    url: s.link ?? "#",
    snippet: s.snippet,
  }));
  const dossier: DossierEntry[] = (data.dossier ?? []).map((d) => ({
    title: d.title ?? d.link ?? "Source",
    url: d.link ?? "#",
    snippet: d.snippet,
    evidenceStrength: d.evidence_strength ?? "search discovery",
    eligibilitySignal: d.eligibility_signal ?? "not visible in returned evidence",
    nextAction: d.next_action ?? "Open the cited source and verify applicant type, geography, deadline, and exclusions.",
  }));
  return {
    answer: data.answer,
    sources,
    searchQuery: data.search_query ?? undefined,
    dossier,
    route: data.route ?? [],
  };
}
