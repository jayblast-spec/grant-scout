import { ArrowRight, ShieldCheck, Link2, Search } from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const assurances = [
  { icon: Search, label: "Live Google result snippets, not training-data recall" },
  { icon: Link2, label: "Every mentioned program links to its search result" },
  { icon: ShieldCheck, label: "No incorporation required to start looking" },
];

const pipelinePreview = [
  { label: "Query received", detail: "solo founder, no LLC yet" },
  { label: "Live search running", detail: "google.com via SerpApi" },
  { label: "Gemini reasoning", detail: "reviewing result snippets" },
  { label: "Cited answer ready", detail: "sources attached" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-hairline grain">
      <div className="rule-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-secondary/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-primary animate-pulse-dot" aria-hidden="true" />
                <span className="relative size-1.5 rounded-full bg-primary" aria-hidden="true" />
              </span>
              Search-grounded funding research
            </p>
          </Reveal>

          <Reveal delayMs={80}>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-[3.4rem]">
              Find funding leads worth verifying - before you incorporate.
            </h1>
          </Reveal>

          <Reveal delayMs={140}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Grant Scout is a research agent for solo founders without a legal entity. It runs a
              live Google Search through SerpApi, then Gemini reviews the returned result snippets and explains
              which grants, non-dilutive programs, and fellowships plausibly fit your situation -
              with a result link attached to every program it mentions so you can verify the details.
            </p>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#try-it"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px"
                style={{ boxShadow: "var(--glow-accent)" }}
              >
                Try the agent
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-hairline bg-secondary/50 px-5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                How it works
              </a>
            </div>
          </Reveal>

          <Reveal delayMs={260}>
            <ul className="mt-12 grid gap-3 sm:grid-cols-3">
              {assurances.map(({ icon: Icon, label }) => (
                <Spotlight key={label} className="rounded-lg">
                  <li className="flex h-full items-start gap-3 rounded-lg border border-hairline bg-card/40 px-4 py-3.5 transition-colors duration-200 hover:border-primary/30">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm leading-snug text-muted-foreground">{label}</span>
                  </li>
                </Spotlight>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delayMs={160} className="lg:justify-self-end lg:w-full">
          <div
            className="panel w-full max-w-sm overflow-hidden lg:max-w-none"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Live pipeline
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
                real-time
              </span>
            </div>
            <ol className="divide-y divide-hairline">
              {pipelinePreview.map((step, index) => (
                <li key={step.label} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="tabular font-mono text-[11px] text-muted-foreground/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground/70">{step.detail}</p>
                  </div>
                  {index === pipelinePreview.length - 1 ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
                  )}
                </li>
              ))}
            </ol>
            <div className="border-t border-hairline px-4 py-3">
              <p className="font-mono text-[11px] text-muted-foreground/70">
                This is what happens when you press send below.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
