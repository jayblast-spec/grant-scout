import { Landmark, Globe2, BadgeCheck } from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const sources = [
  {
    icon: Landmark,
    label: "SOURCE: GRANTS.GOV",
    title: "Federal opportunity search API",
    body: "Every US federal question hits grants.gov's own Search API directly - the same opportunity data agencies publish, not a cached summary of it.",
  },
  {
    icon: Globe2,
    label: "SOURCE: LIVE WEB SEARCH",
    title: "SerpApi-backed Google Search",
    body: "Non-federal and program-specific questions run a live Google Search through SerpApi. Tracking-redirect links are filtered out - every citation is the real destination URL.",
  },
];

export function TrustSources() {
  return (
    <section id="sources" className="border-b border-hairline bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--amber-live)" }}>
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Verified authority
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Two live sources. No footnotes pretending to be facts.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A cited source is only worth trusting if it was fetched when you asked, not recalled
              from training data. Every answer traces back to one of these two calls.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {sources.map(({ icon: Icon, label, title, body }, index) => (
            <Reveal key={label} delayMs={index * 90}>
              <Spotlight className="h-full rounded-xl">
                <div className="panel relative flex h-full flex-col p-6" style={{ boxShadow: "var(--glow-accent)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span
                      className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--amber-live)" }}
                    >
                      {label}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold tracking-tight text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <p
                    className="mt-5 flex items-center gap-1.5 font-mono text-[11px]"
                    style={{ color: "var(--live-cyan)" }}
                  >
                    <span
                      className="size-1.5 rounded-full animate-pulse-dot"
                      style={{ backgroundColor: "var(--live-cyan)" }}
                      aria-hidden="true"
                    />
                    queried live, at request time - not cached
                  </p>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
