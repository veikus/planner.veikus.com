import { getScheduleDateRange } from './db.js';

export function isValidDate(value) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

// Buffered by a day on each side since `date` is a calendar day in the
// origin/destination airport's local timezone, not UTC.
export async function isWithinScheduleRange(value) {
  const { minUTC, maxUTC } = await getScheduleDateRange();
  const requestedUTC = new Date(`${value}T00:00:00Z`).getTime();
  const bufferMs = 24 * 60 * 60 * 1000;
  return requestedUTC >= minUTC - bufferMs && requestedUTC <= maxUTC + bufferMs;
}
