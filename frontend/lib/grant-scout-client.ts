export type GrantSource = {
  title: string;
  url: string;
  snippet?: string;
};

/**
 * Shape returned by askGrantScout, after mapping the raw API response below.
 */
export type ChatResponse = {
  answer: string;
  sources: GrantSource[];
  searchQuery?: string;
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
 *   - frontend/api/chat.py: { answer, searched_live, search_query, sources }
 *   - frontend/api/_lib.py: each source item is { title, link, snippet }
 */
export type RawChatApiResponse = {
  answer: string;
  searched_live: boolean;
  search_query: string | null;
  sources: Array<{ title?: string; link?: string; snippet?: string }>;
  error?: string;
};

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
  const data: RawChatApiResponse = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error ?? `The agent returned ${res.status}.`);
  }
  const sources: GrantSource[] = (data.sources ?? []).map((s) => ({
    title: s.title ?? s.link ?? "Source",
    url: s.link ?? "#",
    snippet: s.snippet,
  }));
  return { answer: data.answer, sources, searchQuery: data.search_query ?? undefined };
}
