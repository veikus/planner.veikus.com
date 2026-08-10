import { describe, test, expect, vi } from 'vitest';

let scheduleRange = { minUTC: 0, maxUTC: 0 };

vi.mock('./db.js', () => ({
  getScheduleDateRange: async () => scheduleRange,
}));

const { isValidDate, isWithinScheduleRange } = await import('./dateRange.js');

describe('isValidDate', () => {
  test('accepts a well-formed ISO date', () => {
    expect(isValidDate('2024-03-10')).toBe(true);
  });

  test('rejects an invalid calendar date', () => {
    expect(isValidDate('2024-02-30')).toBe(false);
  });

  test('rejects non-date strings', () => {
    expect(isValidDate('not-a-date')).toBe(false);
  });
});

describe('isWithinScheduleRange', () => {
  test('accepts a date inside the schedule window', async () => {
    scheduleRange = {
      minUTC: new Date('2024-03-01T00:00:00Z').getTime(),
      maxUTC: new Date('2024-03-31T00:00:00Z').getTime(),
    };
    expect(await isWithinScheduleRange('2024-03-15')).toBe(true);
  });

  test('accepts a date exactly one buffer day outside either bound', async () => {
    scheduleRange = {
      minUTC: new Date('2024-03-01T00:00:00Z').getTime(),
      maxUTC: new Date('2024-03-31T00:00:00Z').getTime(),
    };
    expect(await isWithinScheduleRange('2024-02-29')).toBe(true);
    expect(await isWithinScheduleRange('2024-04-01')).toBe(true);
  });

  test('rejects a date beyond the buffered window', async () => {
    scheduleRange = {
      minUTC: new Date('2024-03-01T00:00:00Z').getTime(),
      maxUTC: new Date('2024-03-31T00:00:00Z').getTime(),
    };
    expect(await isWithinScheduleRange('2024-02-28')).toBe(false);
    expect(await isWithinScheduleRange('2024-04-02')).toBe(false);
  });
});
