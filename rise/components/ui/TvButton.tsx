import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-white text-zinc-950 focus:bg-white disabled:bg-zinc-600 disabled:text-zinc-400",
  secondary:
    "bg-white/10 text-white border border-white/20 focus:bg-white/20 disabled:opacity-40",
  ghost: "bg-transparent text-white/70 focus:text-white",
};

interface TvButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const TvButton = forwardRef<HTMLButtonElement, TvButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      data-tv-focusable
      className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-medium outline-none transition-all duration-150 focus:scale-105 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.9),0_0_30px_rgba(255,255,255,0.35)] disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
);

TvButton.displayName = "TvButton";
