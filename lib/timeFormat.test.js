import { describe, test, expect, afterEach } from 'vitest';
import { formatDuration, getLocalDateString } from './timeFormat.js';

describe('formatDuration', () => {
  test('formats minutes and hours', () => {
    expect(formatDuration(90 * 60_000)).toBe('1h 30m');
  });

  test('formats days when the duration exceeds 24h', () => {
    expect(formatDuration(25 * 3600_000)).toBe('1d 1h 0m');
  });

  test('formats zero as 0h 0m', () => {
    expect(formatDuration(0)).toBe('0h 0m');
  });

  test('clamps negative durations to 0 instead of producing negative parts', () => {
    // Pre-fix this produced "-1h -30m" for -30 minutes: a genuinely
    // impossible connection/duration shouldn't render a made-up negative
    // time, just the floor.
    expect(formatDuration(-30 * 60_000)).toBe('0h 0m');
    expect(formatDuration(-25 * 3600_000)).toBe('0h 0m');
  });
});

describe('getLocalDateString', () => {
  const originalTZ = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTZ;
  });

  test('uses the local calendar date, not the UTC one', () => {
    // 23:00 UTC on the 15th is already the 16th in UTC+14.
    process.env.TZ = 'Pacific/Kiritimati';
    const instant = new Date('2024-01-15T23:00:00Z');
    expect(instant.toISOString().slice(0, 10)).toBe('2024-01-15');
    expect(getLocalDateString(instant)).toBe('2024-01-16');
  });

  test('uses the local calendar date on the other side too', () => {
    // 01:00 UTC on the 15th is still the 14th in UTC-12.
    process.env.TZ = 'Etc/GMT+12';
    const instant = new Date('2024-01-15T01:00:00Z');
    expect(instant.toISOString().slice(0, 10)).toBe('2024-01-15');
    expect(getLocalDateString(instant)).toBe('2024-01-14');
  });

  test('pads single-digit months and days', () => {
    process.env.TZ = 'UTC';
    expect(getLocalDateString(new Date('2024-03-05T12:00:00Z'))).toBe('2024-03-05');
  });
});
