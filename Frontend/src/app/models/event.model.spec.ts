import {
  parseTimeToMinutes,
  toDateKey,
  fromDateKey,
  isSameDate,
  DAY_START_MIN,
  DAY_END_MIN,
} from './event.model';

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

  it('formats a Date to a YYYY-MM-DD key', () => {
    expect(toDateKey(new Date(2026, 7, 26))).toBe('2026-08-26');
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('parses a YYYY-MM-DD key back to a Date', () => {
    expect(toDateKey(fromDateKey('2026-08-26'))).toBe('2026-08-26');
    expect(fromDateKey('2026-01-05')).toEqual(new Date(2026, 0, 5));
  });

  it('compares an event date string against a Date', () => {
    expect(isSameDate('2026-08-26', new Date(2026, 7, 26))).toBeTrue();
    expect(isSameDate('2026-08-25', new Date(2026, 7, 26))).toBeFalse();
  });
});
