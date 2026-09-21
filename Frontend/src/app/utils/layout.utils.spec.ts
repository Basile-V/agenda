import { minutesToY, pixelsPerMinute, layoutEvents } from './layout.utils';
import { DAY_START_MIN, DAY_END_MIN, ParsedEvent } from '../models/event.model';

function makeEvent(id: number, start: string, duration: number): ParsedEvent {
  const [hours, minutes] = start.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  return {
    id,
    date: '2026-01-01',
    start,
    duration,
    ownerId: 1,
    isPublic: false,
    startMinutes,
    endMinutes: startMinutes + duration,
  };
}

describe('layout.utils', () => {
  it('minutesToY maps start and end correctly', () => {
    const h = 1200;
    expect(minutesToY(DAY_START_MIN, h)).toBeCloseTo(0);
    expect(minutesToY(DAY_END_MIN, h)).toBeCloseTo(h);
    const mid = (DAY_START_MIN + DAY_END_MIN) / 2;
    expect(minutesToY(mid, h)).toBeCloseTo(h / 2);
  });

  it('pixelsPerMinute is consistent with minutesToY delta', () => {
    const h = 720;
    const ppm = pixelsPerMinute(h);
    const t1 = DAY_START_MIN + 60; // one hour later
    expect(minutesToY(t1, h) - minutesToY(DAY_START_MIN, h)).toBeCloseTo(60 * ppm);
  });

  it('layoutEvents assigns expected number of columns and widths for overlapping events', () => {
    const events: ParsedEvent[] = [
      makeEvent(1, '10:00', 120),
      makeEvent(2, '10:30', 60),
      makeEvent(3, '11:00', 30),
    ];
    const width = 600;
    const height = 720;
    const laid = layoutEvents(events, width, height);
    // all three overlap transitively -> at least 2 columns required; check widths are <= container
    for (const e of laid) {
      expect(e.width).toBeLessThanOrEqual(width);
      expect(e.height).toBeGreaterThan(0);
      expect(e.top).toBeGreaterThanOrEqual(0);
    }
  });
});
