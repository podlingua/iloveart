import { TvButton } from "@/components/ui/TvButton";

interface StepperProps {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function Stepper({ label, value, onDecrease, onIncrease }: StepperProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-white/40">{label}</span>
      <div className="flex items-center gap-3">
        <TvButton
          variant="secondary"
          className="!px-0 h-12 w-12 rounded-full text-2xl"
          onClick={onDecrease}
          aria-label={`Decrease ${label}`}
        >
          −
        </TvButton>
        <span className="w-24 text-center text-2xl font-semibold tabular-nums">{value}</span>
        <TvButton
          variant="secondary"
          className="!px-0 h-12 w-12 rounded-full text-2xl"
          onClick={onIncrease}
          aria-label={`Increase ${label}`}
        >
          +
        </TvButton>
      </div>
    </div>
  );
}
