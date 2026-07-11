interface TranscriptViewProps {
  status: "transcribing" | "done" | "error";
  text?: string;
  error?: string;
}

export function TranscriptView({ status, text, error }: TranscriptViewProps) {
  if (status === "transcribing") {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Transcribing your recording&hellip;
      </p>
    );
  }

  if (status === "error") {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
      {text}
    </p>
  );
}
