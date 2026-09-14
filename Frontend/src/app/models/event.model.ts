export interface EventRaw {
  id: number;
  title?: string;
  date: string; // 'YYYY-MM-DD'
  start: string; // 'HH:MM'
  duration: number; // minutes
  ownerId: number;
  isPublic: boolean;
}

export interface ParsedEvent extends EventRaw {
  startMinutes: number; // minutes since midnight
  endMinutes: number; // minutes since midnight
}

export const DAY_START_HOUR = 9; // 00:00
export const DAY_END_HOUR = 21; // 24:00
export const DAY_START_MIN = DAY_START_HOUR * 60; // 09:00
export const DAY_END_MIN = DAY_END_HOUR * 60; // 21:00

export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDate(eventDate: string, date: Date): boolean {
  return eventDate === toDateKey(date);
}
