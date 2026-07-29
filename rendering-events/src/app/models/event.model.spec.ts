import { parseTimeToMinutes, DAY_START_MIN, DAY_END_MIN } from './event.model';

describe('event.model', () => {
  it('parses HH:MM to minutes since midnight', () => {
    expect(parseTimeToMinutes('09:00')).toBe(9 * 60);
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('23:59')).toBe(23 * 60 + 59);
    expect(parseTimeToMinutes('12:30')).toBe(12 * 60 + 30);
  });

  it('defines day bounds correctly', () => {
    expect(DAY_START_MIN).toBe(9 * 60);
    expect(DAY_END_MIN).toBe(21 * 60);
    expect(DAY_END_MIN - DAY_START_MIN).toBe(12 * 60);
  });
});
