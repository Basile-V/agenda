export interface EventRaw {
  id: number;
  title?: string;
  start: string; // 'HH:MM'
  duration: number; // minutes
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
