interface AudioPlaybackProps {
  audioUrl: string;
}

export function AudioPlayback({ audioUrl }: AudioPlaybackProps) {
  return (
    <audio
      controls
      src={audioUrl}
      className="w-full"
      aria-label="Your recording"
    />
  );
}
