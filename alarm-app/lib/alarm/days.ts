export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function formatRepeat(repeatDays: number[]): string {
  if (repeatDays.length === 0) return "Once";
  if (repeatDays.length === 7) return "Every day";

  const weekdays = [1, 2, 3, 4, 5];
  const weekend = [0, 6];
  const sorted = [...repeatDays].sort();
  if (sorted.length === 5 && sorted.every((d) => weekdays.includes(d))) return "Weekdays";
  if (sorted.length === 2 && sorted.every((d) => weekend.includes(d))) return "Weekends";

  return sorted.map((d) => WEEKDAY_LABELS[d]).join(" ");
}
