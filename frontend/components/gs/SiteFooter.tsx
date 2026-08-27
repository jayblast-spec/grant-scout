import { Compass } from "lucide-react";

const stack = ["Google ADK", "Gemini", "SerpApi", "Next.js", "Vercel"];

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                <Compass className="size-3.5" aria-hidden="true" />
              </span>
              <span className="font-display text-sm font-semibold tracking-tight text-foreground">Grant Scout</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A funding-discovery agent for founders who don&apos;t have a legal entity yet.
            </p>
          </div>

          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Built with
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {stack.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-hairline bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 max-w-3xl border-t border-hairline pt-6 text-sm leading-relaxed text-muted-foreground">
          This demo uses a fictional solo-founder scenario. Search-result snippets are leads, not
          proof of eligibility; always confirm requirements on the linked program website.
        </p>
      </div>
    </footer>
  );
}
