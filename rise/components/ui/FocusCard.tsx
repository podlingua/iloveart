import { HTMLAttributes, forwardRef } from "react";

interface FocusCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: string;
}

export const FocusCard = forwardRef<HTMLDivElement, FocusCardProps>(
  ({ className = "", accent, style, ...props }, ref) => (
    <div
      ref={ref}
      tabIndex={0}
      data-tv-focusable
      style={{
        ...style,
        // @ts-expect-error custom property for focus-ring color
        "--accent": accent ?? "#ffffff",
      }}
      className={`group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.04] outline-none transition-all duration-200 focus:scale-[1.06] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent),0_0_40px_-4px_var(--accent)] ${className}`}
      {...props}
    />
  )
);

FocusCard.displayName = "FocusCard";
