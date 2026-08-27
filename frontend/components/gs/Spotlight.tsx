"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a card in a cursor-tracked border glow. Pure presentation -
 * sets CSS custom properties consumed by the `spotlight` utility in globals.css.
 */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    node.style.setProperty("--spot-opacity", "1");
  }

  function handlePointerLeave() {
    ref.current?.style.setProperty("--spot-opacity", "0");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("spotlight", className)}
    >
      {children}
    </div>
  );
}
