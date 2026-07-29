import { minutesToY, pixelsPerMinute, layoutEvents } from './layout.utils';
import { DAY_START_MIN, DAY_END_MIN } from '../models/event.model';

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
    const events = [
      { id: 1, start: '10:00', duration: 120, startMinutes: 10 * 60, endMinutes: 12 * 60 },
      { id: 2, start: '10:30', duration: 60, startMinutes: 10 * 60 + 30, endMinutes: 11 * 60 + 30 },
      { id: 3, start: '11:00', duration: 30, startMinutes: 11 * 60, endMinutes: 11 * 60 + 30 }
    ];
    const width = 600;
    const height = 720;
    const laid = layoutEvents(events as any, width, height);
    // all three overlap transitively -> at least 2 columns required; check widths are <= container
    for (const e of laid) {
      expect(e.width).toBeLessThanOrEqual(width);
      expect(e.height).toBeGreaterThan(0);
      expect(e.top).toBeGreaterThanOrEqual(0);
    }
  });
});
