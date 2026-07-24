export function RemoteHintBar({ hints }: { hints: string[] }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-8 px-12 py-6 text-sm text-white/40">
      {hints.map((hint) => (
        <span key={hint}>{hint}</span>
      ))}
    </div>
  );
}
