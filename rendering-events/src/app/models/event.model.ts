export interface EventRaw {
  id: number;
  start: string; // 'HH:MM'
  duration: number; // minutes
}

export interface ParsedEvent extends EventRaw {
  startMinutes: number; // minutes since midnight
  endMinutes: number; // minutes since midnight
}

export const DAY_START_MIN = 9 * 60; // 09:00
export const DAY_END_MIN = 21 * 60; // 21:00

export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
