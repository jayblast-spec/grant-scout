import {
  Sparkles,
  HeartHandshake,
  GraduationCap,
  Building2,
  ShieldCheck,
  FileSearch,
  ArrowUpRight,
  BookOpenText,
} from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const extensions = [
  {
    icon: HeartHandshake,
    title: "Public benefits eligibility",
    body: "Same sort: retrieve a live benefits-program page for SNAP, housing, or utility assistance, then reason over the actual eligibility text instead of the stale advice on a forum thread.",
  },
  {
    icon: GraduationCap,
    title: "Scholarships for the institution-less",
    body: "Grant Scout sorts \"needs an LLC\" vs \"doesn't.\" The identical filter works for a student with no university affiliation searching fellowships that assume one.",
  },
  {
    icon: Building2,
    title: "Business license & permit lookups",
    body: "Swap grants.gov's search2 endpoint for a city or state permitting API. Same shape: live query, structured hits, a link to the actual ordinance page - not a remembered rule that changed last year.",
  },
  {
    icon: ShieldCheck,
    title: "Vendor & certification checks",
    body: "Is this supplier still on the exclusion list? Still licensed? A retrieve-then-cite agent answers from the live registry at request time, where a cached answer is already wrong the day it's stale.",
  },
  {
    icon: FileSearch,
    title: "Public procurement discovery",
    body: "The same routing logic that sends a federal question to grants.gov instead of SerpApi extends cleanly to RFPs and government contract postings - a different live source, the identical pipeline.",
  },
];

const roadmap = [
  {
    today: "One question, one answer - no memory of what you asked before",
    next: "Multi-turn refinement that keeps prior sources in context without re-searching",
  },
  {
    today: "The tool fires exactly once per request, by hard rule, to protect latency",
    next: "The agent decides when a second, narrower search is actually worth the wait",
  },
  {
    today: "You have to come back and ask again to see what's new",
    next: "A saved query re-runs on a schedule and flags newly posted matches",
  },
  {
    today: "grants.gov vs. SerpApi is a fixed keyword list, not a model decision",
    next: "The model routes itself, once its two-tool judgment holds up under real testing",
  },
  {
    today: "Eligibility is reasoned from the snippet alone - the linked page is never opened",
    next: "A verification pass fetches the real page before the final answer ships",
  },
];

export function AgentPattern() {
  return (
    <>
      <section id="agent-pattern" className="border-b border-hairline bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Beyond the demo
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                The agent pattern
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Grant Scout is the narrowest possible slice of a general pattern: retrieve real
                results at request time, reason over only what came back, cite the exact source
                for every claim, and refuse to answer when nothing verifiable turned up. Swap the
                domain and the source APIs, and the pipeline in{" "}
                <code className="rounded border border-hairline bg-background/60 px-1.5 py-0.5 font-mono text-[12.5px] text-foreground/80">
                  _lib.py
                </code>{" "}
                doesn&apos;t change shape.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {extensions.map(({ icon: Icon, title, body }, index) => (
              <Reveal key={title} delayMs={index * 70}>
                <Spotlight className="h-full rounded-xl">
                  <div className="panel flex h-full flex-col p-6">
                    <span className="flex size-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-display text-base font-semibold tracking-tight text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={360}>
            <div className="mt-14">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Now / next - what&apos;s honestly not built yet
              </h3>
              <div className="mt-5 overflow-x-auto rounded-xl border border-hairline">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline bg-surface-raised">
                      <th className="px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Today
                      </th>
                      <th
                        className="px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: "var(--live-cyan)" }}
                      >
                        Next
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roadmap.map((row, index) => (
                      <tr
                        key={row.today}
                        className={index !== roadmap.length - 1 ? "border-b border-hairline" : ""}
                      >
                        <td className="px-5 py-4 align-top leading-relaxed text-muted-foreground">
                          {row.today}
                        </td>
                        <td className="px-5 py-4 align-top leading-relaxed text-foreground/90">
                          {row.next}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="fork-it" className="border-b border-hairline">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <Spotlight className="rounded-2xl">
              <div
                className="panel flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
                style={{ boxShadow: "var(--glow-accent)" }}
              >
                <div className="max-w-xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                    This is just the beginning
                  </p>
                  <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    See the code. Fork it. Make it yours.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Two tools, one agent, a hard rule against answering without a live source.
                    Everything above traces to real code, not a pitch deck - go read it.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <a
                    href="https://github.com/jayblast-spec/grant-scout"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    View on GitHub
                    <ArrowUpRight className="size-3.5 opacity-80" aria-hidden="true" />
                  </a>
                  <a
                    href="https://github.com/jayblast-spec/grant-scout#readme"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline px-5 py-2.5 font-display text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <BookOpenText className="size-4" aria-hidden="true" />
                    Read the README
                    <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </Spotlight>
          </Reveal>
        </div>
      </section>
    </>
  );
}
