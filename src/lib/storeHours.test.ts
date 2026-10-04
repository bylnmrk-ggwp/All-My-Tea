import { describe, it, expect } from 'vitest';
import { getStoreStatus, parseClock, parseHours, type DaySchedule } from './storeHours';

const DAILY: DaySchedule[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .map((day) => ({ day, hours: '4:00 PM - 1:00 AM' }));

// 2026-10-05 is a Monday. Manila = UTC+8, no DST.
const manila = (hhmm: string, dayOffset = 0) => {
  const [h, m] = hhmm.split(':').map(Number);
  const utcHour = h - 8;
  return new Date(Date.UTC(2026, 9, 5 + dayOffset, utcHour, m, 0));
};

describe('parseClock', () => {
  it('parses 12-hour clock text to minutes since midnight', () => {
    expect(parseClock('4:00 PM')).toBe(16 * 60);
    expect(parseClock('1:00 AM')).toBe(60);
    expect(parseClock('12:00 AM')).toBe(0);
    expect(parseClock('12:30 PM')).toBe(12 * 60 + 30);
  });

  it('returns null for garbage', () => {
    expect(parseClock('4PM')).toBeNull();
    expect(parseClock('Closed')).toBeNull();
  });
});

describe('parseHours', () => {
  it('splits an opening range', () => {
    expect(parseHours('4:00 PM - 1:00 AM')).toEqual({ opens: 960, closes: 60 });
  });
  it('returns null when either side is unreadable', () => {
    expect(parseHours('Closed')).toBeNull();
    expect(parseHours('4PM-1AM')).toBeNull();
  });
});

describe('getStoreStatus with a 4:00 PM to 1:00 AM day', () => {
  it('is closed at 3:59 PM and opens at 4:00 PM', () => {
    expect(getStoreStatus(manila('15:59'), DAILY)).toEqual({ open: false, label: 'Closed, opens 4:00 PM' });
    expect(getStoreStatus(manila('16:00'), DAILY)).toEqual({ open: true, label: 'Open now, closes 1:00 AM' });
  });

  it('stays open late in the evening', () => {
    expect(getStoreStatus(manila('23:30'), DAILY).open).toBe(true);
  });

  it("is still open after midnight on the previous day's service", () => {
    expect(getStoreStatus(manila('00:30', 1), DAILY)).toEqual({ open: true, label: 'Open now, closes 1:00 AM' });
  });

  it('closes at exactly 1:00 AM', () => {
    expect(getStoreStatus(manila('01:00', 1), DAILY).open).toBe(false);
    expect(getStoreStatus(manila('01:01', 1), DAILY)).toEqual({ open: false, label: 'Closed, opens 4:00 PM' });
  });

  it('reports unavailable hours instead of throwing on a malformed entry', () => {
    const broken = DAILY.map((d) => ({ ...d, hours: 'Closed' }));
    expect(getStoreStatus(manila('18:00'), broken)).toEqual({ open: false, label: 'Hours unavailable' });
  });

  it('respects the time zone argument', () => {
    // 16:00 Manila is 08:00 UTC; evaluated in UTC the store is closed.
    expect(getStoreStatus(manila('16:00'), DAILY, 'UTC').open).toBe(false);
  });
});
