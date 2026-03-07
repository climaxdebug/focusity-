import { ClassEvent, FreeSlot } from "../types";

export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function findFreeSlots(
  daySchedule: ClassEvent[],
  startOfDay = "08:00",
  endOfDay = "22:00"
): FreeSlot[] {
  const freeSlots: FreeSlot[] = [];
  const dayStart = parseTime(startOfDay);
  const dayEnd = parseTime(endOfDay);
  let currentTime = dayStart;

  const sortedSchedule = [...daySchedule].sort((a, b) => 
    parseTime(a.start_time) - parseTime(b.start_time)
  );

  for (const event of sortedSchedule) {
    const eventStart = parseTime(event.start_time);
    if (currentTime < eventStart) {
      const gap = eventStart - currentTime;
      if (gap >= 30) {
        freeSlots.push({
          start: formatTime(currentTime),
          end: formatTime(eventStart),
          duration: gap,
          suggestion: "" // Will be populated by App.tsx
        });
      }
    }
    currentTime = Math.max(currentTime, parseTime(event.end_time));
  }

  if (currentTime < dayEnd) {
    const gap = dayEnd - currentTime;
    if (gap >= 30) {
      freeSlots.push({
        start: formatTime(currentTime),
        end: formatTime(dayEnd),
        duration: gap,
        suggestion: "" // Will be populated by App.tsx
      });
    }
  }

  return freeSlots;
}
