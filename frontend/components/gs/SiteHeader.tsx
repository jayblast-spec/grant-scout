"use client";

import { useEffect, useState } from "react";
import { Compass, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${
        scrolled ? "border-hairline shadow-[0_1px_0_0_var(--hairline)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="group flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
            <Compass className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            Grant Scout
          </span>
        </a>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <a
            href="#how-it-works"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
          >
            How it works
          </a>
          <a
            href="https://github.com/jayblast-spec/grant-scout"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            GitHub
            <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
          </a>
          <a
            href="https://devpost.com/software/grant-scout"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Devpost
            <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
