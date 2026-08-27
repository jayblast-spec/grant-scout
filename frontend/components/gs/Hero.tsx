import { ArrowRight, ShieldCheck, Link2, Search } from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const assurances = [
  { icon: Search, label: "Live SerpApi and grants.gov results, not training-data recall" },
  { icon: Link2, label: "Every mentioned program links to its real search result" },
  { icon: ShieldCheck, label: "No incorporation required to start looking" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-hairline bg-background grain">
      <div className="rule-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.14] blur-[140px]"
        aria-hidden="true"
      />

      {/* On-theme hero visual: a document stack being scanned and verified -
          the actual mechanic of the product (live search -> cited, checked
          source) rather than a generic AI/tech stock photo. Original SVG art. */}
      <div
        className="pointer-events-none absolute -right-10 top-1/2 hidden h-[30rem] w-[30rem] -translate-y-1/2 opacity-70 lg:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" fill="none" className="size-full">
          <defs>
            <linearGradient id="docGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--live-cyan)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="scanBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--live-cyan)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--live-cyan)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--live-cyan)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* stacked document cards */}
          <rect x="150" y="150" width="150" height="190" rx="10" fill="var(--card)" stroke="var(--hairline)" opacity="0.7" transform="rotate(-6 225 245)" />
          <rect x="130" y="130" width="150" height="190" rx="10" fill="var(--card)" stroke="var(--hairline)" opacity="0.85" transform="rotate(-2 205 225)" />
          <rect x="110" y="110" width="150" height="190" rx="10" fill="var(--card)" stroke="url(#docGlow)" strokeWidth="1.5" />

          {/* text lines on the front document */}
          <rect x="130" y="140" width="90" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.5" />
          <rect x="130" y="158" width="110" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.35" />
          <rect x="130" y="176" width="70" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.35" />
          <rect x="130" y="204" width="110" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.25" />
          <rect x="130" y="222" width="95" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.25" />

          {/* diagonal scan beam sweeping the stack */}
          <rect x="80" y="60" width="18" height="320" fill="url(#scanBeam)" transform="rotate(20 185 220)" />

          {/* radiating source-link nodes */}
          <g opacity="0.6">
            <circle cx="300" cy="90" r="3" fill="var(--amber-live)" />
            <path d="M260 130 L300 90" stroke="var(--amber-live)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="330" cy="170" r="3" fill="var(--live-cyan)" />
            <path d="M265 175 L330 170" stroke="var(--live-cyan)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="310" cy="260" r="3" fill="var(--primary)" />
            <path d="M260 250 L310 260" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* verified badge glowing over the top-left corner of the front card */}
          <circle cx="110" cy="110" r="22" fill="var(--background)" stroke="var(--primary)" strokeWidth="1.5" />
          <path d="M100 110 L107 117 L121 101" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="lg:max-w-2xl">
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
            <h1 className="mt-6 max-w-2xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-white text-balance sm:text-6xl lg:text-[4.2rem]">
              Grant Scout finds the <span className="text-primary">right funding</span> for your mission.
            </h1>
          </Reveal>

          <Reveal delayMs={140}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
              Live search over SerpApi and grants.gov, reasoned by Gemini - every program linked to
              its real source.
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
      </div>
    </section>
  );
}
