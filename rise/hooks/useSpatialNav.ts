"use client";

import { useEffect } from "react";

const SELECTOR = "[data-tv-focusable]";
const KEY_TO_DIR: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

/**
 * Fire TV / remote-style focus movement: arrow keys move focus to the nearest
 * focusable element in the pressed direction, computed from screen position
 * rather than DOM order, so grids and mixed layouts both work.
 */
export function useSpatialNav(containerRef?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;

      const root = containerRef?.current ?? document;
      const candidates = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled")
      );
      if (candidates.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const current = active && candidates.includes(active) ? active : null;

      if (!current) {
        candidates[0].focus();
        e.preventDefault();
        return;
      }

      const currentRect = current.getBoundingClientRect();
      const cx = currentRect.left + currentRect.width / 2;
      const cy = currentRect.top + currentRect.height / 2;
      const [dx, dy] = dir;

      let best: HTMLElement | null = null;
      let bestScore = Infinity;

      for (const el of candidates) {
        if (el === current) continue;
        const rect = el.getBoundingClientRect();
        const ex = rect.left + rect.width / 2;
        const ey = rect.top + rect.height / 2;
        const vx = ex - cx;
        const vy = ey - cy;

        // Must be roughly in the pressed direction.
        const forward = vx * dx + vy * dy;
        if (forward <= 0) continue;

        const lateral = Math.abs(vx * dy - vy * dx);
        const distance = Math.hypot(vx, vy);
        const score = distance + lateral * 2.5;

        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
      }

      if (best) {
        best.focus();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);
}
