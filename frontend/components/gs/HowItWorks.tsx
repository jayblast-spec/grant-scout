import { MessageSquareText, Globe2, ListChecks } from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const steps = [
  {
    icon: MessageSquareText,
    step: "01",
    title: "Ask in plain language",
    body: "Describe the money you need and the shape you're in - solo, unincorporated, pre-revenue, side project. No forms, no eligibility quiz, no jargon required.",
  },
  {
    icon: Globe2,
    step: "02",
    title: "A live search runs, not a memory lookup",
    body: "For US federal questions, Grant Scout calls grants.gov's own Search API for real opportunity data; otherwise it calls Google Search through SerpApi. Either way, the call happens at request time, so closed rounds and stale deadlines don't get repeated back as fact.",
  },
  {
    icon: ListChecks,
    step: "03",
    title: "Gemini flags potential eligibility",
    body: "The reasoning agent reviews the returned titles and snippets, flags programs that may require an incorporated entity, and links each mentioned program to its search result for your verification.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">How it works</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Three steps, and none of them involve guessing.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The agent is deliberately narrow: retrieve real results, reason over them, show its
              work. If a program can&apos;t be traced to a live page, it doesn&apos;t make the list.
            </p>
          </div>
        </Reveal>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
            aria-hidden="true"
          />
          {steps.map(({ icon: Icon, step, title, body }, index) => (
            <Reveal key={step} delayMs={index * 90} className="h-full">
              <Spotlight className="h-full rounded-xl">
                <li
                  className="panel relative flex h-full flex-col p-7 transition-colors duration-200"
                  style={{ boxShadow: "var(--glow-accent)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="tabular font-display text-lg font-extrabold" style={{ color: "var(--live-cyan)" }}>
                      {step}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              </Spotlight>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
