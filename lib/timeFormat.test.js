import { describe, test, expect } from 'vitest';
import { formatDuration } from './timeFormat.js';

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
