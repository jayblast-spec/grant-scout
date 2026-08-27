"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Loader2, ExternalLink, AlertCircle, Quote, Check } from "lucide-react";
import { askGrantScout, EXAMPLE_PROMPTS, type ChatResponse } from "@/lib/grant-scout-client";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const PIPELINE_STEPS = [
  "Query received",
  "Live search running",
  "Gemini reasoning over results",
  "Cited answer ready",
] as const;

// Heuristic timings (ms) for when the ticket advances to the next step while the
// real request is still in flight. These only ever move the indicator *forward*
// toward "reasoning" - the final "cited answer ready" step is set exclusively by
// the real fetch actually resolving, never by a timer.
const STEP_SCHEDULE_MS = [0, 350, 1500];

export function TryIt() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = query.trim();
    if (!message || status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    setStepIndex(0);
    setElapsedMs(0);

    startRef.current = performance.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      setElapsedMs(elapsed);
      const nextStep = STEP_SCHEDULE_MS.reduce(
        (acc, threshold, index) => (elapsed >= threshold ? index : acc),
        0,
      );
      setStepIndex((current) => Math.max(current, nextStep));
    }, 90);

    try {
      const data = await askGrantScout(message);
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedMs(performance.now() - startRef.current);
      setStepIndex(PIPELINE_STEPS.length - 1);
      setResult(data);
      setStatus("done");
    } catch (error) {
      if (timerRef.current) clearInterval(timerRef.current);
      setErrorMessage(error instanceof Error ? error.message : "The request could not be completed.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <section id="try-it" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">Try it</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ask Grant Scout a funding question.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Answers are generated from a live search performed when you press send. Sources appear
              below the answer so you can verify every program yourself.
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
              Search history is off by default. This demo does not save or publish your question.
              Private history may be offered later only with an account and your explicit opt-in.
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={80}>
          <form onSubmit={handleSubmit} className="panel mt-10 p-4 sm:p-5">
            <label htmlFor="grant-query" className="sr-only">
              Your funding question
            </label>
            <textarea
              id="grant-query"
              name="grant-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={3}
              placeholder="e.g. What grants can I apply for as a solo founder without a registered company?"
              className="w-full resize-none bg-transparent px-1 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />

            <div className="mt-3 flex items-center justify-between gap-4 border-t border-hairline pt-3">
              <p className="font-mono text-[11px] text-muted-foreground/70">SerpApi &rarr; Gemini &middot; cited sources</p>
              <button
                type="submit"
                disabled={isLoading || query.trim().length === 0}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Searching
                  </>
                ) : (
                  <>
                    Send
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        </Reveal>

        {status === "idle" && (
          <Reveal delayMs={140}>
            <div className="mt-5 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="rounded-full border border-hairline bg-secondary/40 px-3.5 py-2 text-left text-xs leading-snug text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <div aria-live="polite" className="mt-8 space-y-6">
          {isLoading && (
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Pipeline status
                </span>
                <span className="tabular font-mono text-[11px] text-primary">
                  {(elapsedMs / 1000).toFixed(1)}s
                </span>
              </div>
              <ol className="ticket-rail grid grid-cols-2 divide-x divide-hairline sm:grid-cols-4">
                {PIPELINE_STEPS.map((label, index) => {
                  const isActive = index === stepIndex;
                  const isDone = index < stepIndex;
                  // Real depth, not a color swap: the active step lifts toward
                  // the viewer in Z-space, done steps settle flat, pending
                  // steps recede slightly -- so the ticket reads as a physical
                  // rail advancing rather than a flat progress bar. Values are
                  // inline (vs. Tailwind arbitrary classes) since they're
                  // computed per-state at runtime.
                  const stepTransform = isActive
                    ? "translateZ(22px) translateY(-3px) scale(1.06)"
                    : isDone
                      ? "translateZ(0px) scale(1)"
                      : "translateZ(-10px) scale(0.95)";
                  return (
                    <li
                      key={label}
                      className={`pipeline-step flex flex-col gap-2 px-4 py-4 ${isActive ? "pipeline-step-active" : ""}`}
                      style={{ transform: stepTransform }}
                    >
                      <span
                        className={`flex size-2 items-center justify-center rounded-full ${
                          isDone
                            ? "bg-primary"
                            : isActive
                              ? "bg-primary animate-pulse-dot"
                              : "bg-muted-foreground/25"
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-xs leading-snug ${
                          isActive || isDone ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="border-t border-hairline px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  Running a live Google Search and reviewing the results&hellip;
                </p>
                <div className="mt-3 space-y-2.5">
                  <div className="h-3 w-11/12 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-9/12 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-7/12 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">Couldn&apos;t reach the agent</p>
                <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
          )}

          {status === "done" && result && (
            <>
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/70">
                <Check className="size-3.5 text-primary" aria-hidden="true" />
                Answered in {(elapsedMs / 1000).toFixed(1)}s from a live search
              </div>

              <Reveal>
                <article className="panel p-6">
                  <div className="flex items-center gap-2 border-b border-hairline pb-3">
                    <Quote className="size-3.5 text-primary" aria-hidden="true" />
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Agent answer</h3>
                  </div>
                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">
                    {result.answer
                      .split(/\n{2,}/)
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index} className="whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </article>
              </Reveal>

              {result.sources.length > 0 && (
                <Reveal delayMs={90}>
                  <section aria-label="Cited sources">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      Sources ({result.sources.length})
                    </h3>
                    <ul className="mt-4 grid gap-3">
                      {result.sources.map((source, index) => (
                        <Reveal key={source.url} delayMs={index * 60}>
                          <Spotlight className="rounded-lg">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="group block rounded-lg border border-hairline bg-card/40 p-4 transition-colors hover:border-primary/40 hover:bg-card/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <span className="flex items-start gap-2">
                                  <span className="tabular mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground/60">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <span className="text-sm font-medium text-foreground group-hover:text-primary">
                                    {source.title}
                                  </span>
                                </span>
                                <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                              </div>
                              {source.snippet && (
                                <p className="mt-2 pl-6 text-sm leading-relaxed text-muted-foreground">{source.snippet}</p>
                              )}
                              <p className="mt-2 truncate pl-6 font-mono text-[11px] text-muted-foreground/70">{source.url}</p>
                            </a>
                          </Spotlight>
                        </Reveal>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
