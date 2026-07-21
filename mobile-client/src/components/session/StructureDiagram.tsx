interface StructureDiagramProps {
  label: string;
  beats: string[];
  tone?: "detected" | "suggested";
}

export function StructureDiagram({ label, beats, tone = "detected" }: StructureDiagramProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {beats.map((beat, index) => (
          <span key={`${beat}-${index}`} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                tone === "suggested"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {beat}
            </span>
            {index < beats.length - 1 && (
              <span className="text-zinc-300 dark:text-zinc-700">&rarr;</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
