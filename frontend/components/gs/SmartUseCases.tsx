import { Layers, ShieldQuestion, CalendarClock, Lightbulb, ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/gs/Spotlight";
import { Reveal } from "@/components/gs/Reveal";

const moves = [
  {
    icon: Layers,
    label: "Stack two programs in one ask",
    body: "Don't run two searches. Name both programs in a single question and Scout tells you where they overlap - and where they conflict.",
    example: "Compare NSF SBIR Phase I eligibility to California's state matching-grant programs for the same project.",
  },
  {
    icon: ShieldQuestion,
    label: "Audit a lead you found elsewhere",
    body: "Saw a program mentioned on a forum, in a newsletter, by a friend? Paste the name back to Scout and get it verified against a live source, not vibes.",
    example: "Is the program someone called the \"Rural Innovation Fund\" still accepting applications right now?",
  },
  {
    icon: CalendarClock,
    label: "Hunt by deadline, not by name",
    body: "You don't need to know what a program is called to find it. Ask what's closing soon and let the live search surface it.",
    example: "What federal grants for a solo AI founder close in the next 30 days?",
  },
  {
    icon: Lightbulb,
    label: "Describe the problem, not the program",
    body: "Skip the grant-speak entirely. Describe what you actually built and let Scout map it to categories you didn't know you qualified for.",
    example: "I built a free curriculum app for rural schools with zero budget - what funding categories should I even be looking at?",
  },
];

export function SmartUseCases() {
  return (
    <section id="go-further" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              Go beyond the basics
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              You&apos;re not just asking a question. You&apos;re commanding a research analyst.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Typing a plain search is the entry point, not the ceiling. Here&apos;s how people who
              actually push this thing get more out of every question.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {moves.map(({ icon: Icon, label, body, example }, index) => (
            <Reveal key={label} delayMs={index * 80}>
              <Spotlight className="h-full rounded-xl">
                <div className="panel flex h-full flex-col p-6">
                  <span className="flex size-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold tracking-tight text-foreground">
                    {label}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <p className="mt-5 rounded-lg border border-hairline bg-background/60 px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-foreground/80">
                    &ldquo;{example}&rdquo;
                  </p>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={340}>
          <a
            href="#try-it"
            className="group mt-10 inline-flex items-center gap-2 font-display text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
Try one of these on the agent up top
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
