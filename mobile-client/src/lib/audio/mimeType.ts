// Maps a recorded/uploaded audio blob's MIME type to the file extension that
// should be used when uploading it, so the extension always matches what the
// browser actually encoded (Chrome/Android typically produce audio/webm,
// Safari/iOS produce audio/mp4 - MediaRecorder on WebKit has never supported
// webm). This must stay in sync with the OpenAI transcription API's accepted
// formats: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm.
export function extensionForMimeType(mimeType: string): string {
  const type = mimeType.toLowerCase();
  if (type.includes("webm")) return "webm";
  if (type.includes("mp4") || type.includes("m4a")) return "mp4";
  if (type.includes("wav")) return "wav";
  if (type.includes("ogg") || type.includes("oga")) return "ogg";
  if (type.includes("mpeg") || type.includes("mp3") || type.includes("mpga")) return "mp3";
  if (type.includes("flac")) return "flac";
  // Unknown/empty type: fall back to the most common MediaRecorder default.
  return "webm";
}
