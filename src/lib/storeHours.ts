export interface DaySchedule {
  day: string;
  hours: string;
}

export interface StoreStatus {
  open: boolean;
  label: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "4:00 PM" → 960 (minutes since midnight). null when unreadable. */
export function parseClock(text: string): number | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i.exec(text);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (hours === 12) hours = 0;
  if (meridiem === 'PM') hours += 12;
  return hours * 60 + minutes;
}

/** "4:00 PM - 1:00 AM" → { opens: 960, closes: 60 }. null when unreadable. */
export function parseHours(text: string): { opens: number; closes: number } | null {
  const parts = text.split('-');
  if (parts.length !== 2) return null;
  const opens = parseClock(parts[0]);
  const closes = parseClock(parts[1]);
  if (opens === null || closes === null) return null;
  return { opens, closes };
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${meridiem}`;
}

function localParts(now: Date, timeZone: string): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { weekday: get('weekday'), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

function scheduleFor(schedule: DaySchedule[], weekday: string) {
  const entry = schedule.find((d) => d.day === weekday);
  return entry ? parseHours(entry.hours) : null;
}

/**
 * Open/closed status at `now`, evaluated in the store's time zone.
 * A range whose close is at or before its open (4:00 PM - 1:00 AM) runs past midnight,
 * so the early hours of a day belong to the previous day's service.
 */
export function getStoreStatus(
  now: Date,
  schedule: DaySchedule[],
  timeZone = 'Asia/Manila',
): StoreStatus {
  const { weekday, minutes } = localParts(now, timeZone);
  const today = scheduleFor(schedule, weekday);
  if (!today) return { open: false, label: 'Hours unavailable' };

  const overnight = today.closes <= today.opens;

  // Still inside yesterday's overnight window?
  const yesterdayName = WEEKDAYS[(WEEKDAYS.indexOf(weekday) + 6) % 7];
  const yesterday = scheduleFor(schedule, yesterdayName);
  if (yesterday && yesterday.closes <= yesterday.opens && minutes < yesterday.closes) {
    return { open: true, label: `Open now, closes ${formatClock(yesterday.closes)}` };
  }

  const openNow = overnight
    ? minutes >= today.opens
    : minutes >= today.opens && minutes < today.closes;

  return openNow
    ? { open: true, label: `Open now, closes ${formatClock(today.closes)}` }
    : { open: false, label: `Closed, opens ${formatClock(today.opens)}` };
}
