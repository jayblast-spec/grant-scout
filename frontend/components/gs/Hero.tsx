import { ArrowRight, ShieldCheck, Link2, Search } from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const assurances = [
  { icon: Search, label: "Live SerpApi and grants.gov results, not training-data recall" },
  { icon: Link2, label: "Every mentioned program links to its real search result" },
  { icon: ShieldCheck, label: "No incorporation required to start looking" },
];

const pipelinePreview = [
  { label: "Query received", detail: "solo founder, no LLC yet" },
  { label: "Live search running", detail: "SerpApi or grants.gov" },
  { label: "Gemini reasoning", detail: "reviewing result snippets" },
  { label: "Cited answer ready", detail: "sources attached" },
];

export function Hero() {
  return (
    <section id="top" className="hero-gradient relative overflow-hidden border-b border-hairline grain">
      <div className="rule-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/90">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-primary animate-pulse-dot" aria-hidden="true" />
                <span className="relative size-1.5 rounded-full bg-primary" aria-hidden="true" />
              </span>
              Search-grounded funding research
            </p>
          </Reveal>

          <Reveal delayMs={80}>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.4rem]">
              Find funding leads worth verifying <span className="text-primary">before you incorporate</span>.
            </h1>
          </Reveal>

          <Reveal delayMs={140}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Grant Scout is a research agent for solo founders without a legal entity. It runs a
              live Google Search through SerpApi and a live grants.gov federal-opportunity search, then Gemini
              reviews the returned results and explains which grants, non-dilutive programs, and
              fellowships plausibly fit your situation - with a real source link attached to every
              program it mentions so you can verify the details.
            </p>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#try-it"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-0"
              >
                Try the agent
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                How it works
              </a>
            </div>
          </Reveal>

          <Reveal delayMs={260}>
            <ul className="mt-12 grid gap-3 sm:grid-cols-3">
              {assurances.map(({ icon: Icon, label }) => (
                <Spotlight key={label} className="rounded-xl">
                  <li className="flex h-full items-start gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 transition-colors duration-200 hover:border-primary/40 hover:bg-white/10">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm leading-snug text-white/75">{label}</span>
                  </li>
                </Spotlight>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delayMs={160} className="lg:justify-self-end lg:w-full">
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-hero-card shadow-2xl lg:max-w-none"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between border-b border-hero-card-foreground/10 px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-hero-card-muted">
                Live pipeline
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
                real-time
              </span>
            </div>
            <ol className="divide-y divide-hero-card-foreground/10">
              {pipelinePreview.map((step, index) => (
                <li key={step.label} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="tabular font-mono text-[11px] text-hero-card-muted/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-hero-card-foreground">{step.label}</p>
                    <p className="truncate font-mono text-[11px] text-hero-card-muted">{step.detail}</p>
                  </div>
                  {index === pipelinePreview.length - 1 ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <span className="size-1.5 shrink-0 rounded-full bg-hero-card-muted/30" />
                  )}
                </li>
              ))}
            </ol>
            <div className="border-t border-hero-card-foreground/10 px-4 py-3">
              <p className="font-mono text-[11px] text-hero-card-muted">
                This is what happens when you press send below.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
