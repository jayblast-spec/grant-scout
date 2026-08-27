"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-triggered fade-up reveal. Renders content immediately (no layout shift
 * for non-JS/crawlers) and only animates for users who haven't asked for
 * reduced motion.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
  variant = "fade",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  /** "fade" is the original flat fade-up. "card" is a dimensional drop-in
   * (perspective + rotateX) used where a new item should feel like it's
   * physically landing, e.g. Recent Searches. */
  variant?: "fade" | "card";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const reveal = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(reveal);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    // Safety net: never let content stay hidden indefinitely (e.g. tall
    // sections, quirky observer support, or automated full-page capture).
    const fallback = setTimeout(() => setVisible(true), 900);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        visible
          ? {
              animation:
                variant === "card"
                  ? `card-land 640ms cubic-bezier(0.22,1,0.36,1) both`
                  : `fade-up 560ms cubic-bezier(0.16,1,0.3,1) both`,
              animationDelay: `${delayMs}ms`,
            }
          : { opacity: 0 }
      }
    >
      {children}
    </div>
  );
}
