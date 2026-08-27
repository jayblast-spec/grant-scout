"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const MAX_TILT_DEG = 5;

/**
 * Pointer-tracked 3D tilt (rotateX/rotateY), independent of Spotlight's
 * cursor glow so the two can be composed on the same card. Gives Recent
 * Searches entries real dimensional presence -- picking one up feels like
 * lifting a card off a stack, not just a hover-color change.
 *
 * No-ops under prefers-reduced-motion (checked per-move rather than cached,
 * since the setting can change without a remount).
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * MAX_TILT_DEG * 2;
    const rotateX = (0.5 - py) * MAX_TILT_DEG * 2;
    node.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    node.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
  }

  function handlePointerLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("tilt-card", className)}
    >
      {children}
    </div>
  );
}
