interface ProgressStepsProps {
  steps: string[];
  currentIndex: number;
}

export function ProgressSteps({ steps, currentIndex }: ProgressStepsProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                isCurrent
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : isDone
                    ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={
                isCurrent
                  ? "font-medium text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-500"
              }
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 text-zinc-300 dark:text-zinc-700">&rarr;</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
