import { describe, test, expect, vi } from 'vitest';

// Mocks lib/db.js entirely so pathFinder is exercised against a small,
// deterministic in-memory schedule instead of a live database. The
// factory dynamic-imports the fixture module to sidestep vi.mock's
// hoisting (which runs before this file's own top-level imports).
vi.mock('./db.js', async () => {
  const { findFlightsFromWithinRange, findFlightsWithinRange, findAirport } = await import(
    './__fixtures__/flightSchedule.js'
  );
  return {
    default: {
      execute: async (_sql, params) => {
        const [from, after, before] = params;
        return [findFlightsFromWithinRange(from, after, before)];
      },
    },
    getAirportByIata: async (iata) => findAirport(iata),
    getFlightsInWindow: async (after, before) => findFlightsWithinRange(after, before),
    endPool: async () => {},
  };
});

const { pathFinder } = await import('./susanin.js');

function ids(legs) {
  return legs.map((f) => f.id);
}

function findGroup(groups, key) {
  return groups.find((g) => g.key === key);
}

describe('pathFinder', () => {
  test('finds a direct flight and multi-leg groups, fastest-first', async () => {
    const groups = await pathFinder('ORG', 'DST', '2024-03-10', 0);

    expect(groups.map((g) => g.key)).toEqual(['ORG-DST', 'ORG-HUB-DST', 'ORG-HUB-HUB2-DST']);

    const direct = findGroup(groups, 'ORG-DST');
    expect(direct.fastestRouteDuration).toBe(2.5 * 3600_000);
    expect(ids(direct.fastestRouteLegs)).toEqual(['DIR1']);

    const viaHub = findGroup(groups, 'ORG-HUB-DST');
    expect(viaHub.fastestRouteDuration).toBe(3 * 3600_000);
    expect(ids(viaHub.fastestRouteLegs)).toEqual(['OH_B', 'HD_A']);

    const viaHubs = findGroup(groups, 'ORG-HUB-HUB2-DST');
    expect(viaHubs.fastestRouteDuration).toBe(4 * 3600_000);
    expect(ids(viaHubs.fastestRouteLegs)).toEqual(['OH_A', 'HH2', 'H2D']);
  });

  test("sorts each leg's options ascending by departure time", async () => {
    const groups = await pathFinder('ORG', 'DST', '2024-03-10', 0);
    const viaHub = findGroup(groups, 'ORG-HUB-DST');

    // OH_C departs 05:00, OH_A 06:00, OH_B 06:30 -- deliberately out of
    // that order in fixture declaration order to catch a non-sorting
    // regression (this exact bug shipped once: comparing formatted
    // datetime strings instead of the numeric stdUTC).
    expect(ids(viaHub.legs[0])).toEqual(['OH_C', 'OH_A', 'OH_B']);
    expect(ids(viaHub.legs[1])).toEqual(['HD_A', 'HD_B']);
  });

  test('never includes a leg that revisits an already-visited airport', async () => {
    const groups = await pathFinder('ORG', 'DST', '2024-03-10', 0);

    for (const group of groups) {
      for (const legOptions of group.legs) {
        expect(ids(legOptions)).not.toContain('LOOP1');
      }
      expect(ids(group.fastestRouteLegs)).not.toContain('LOOP1');
    }
  });

  test('excludes connections shorter than minTransferTime', async () => {
    const groupsLoose = await pathFinder('ORG', 'DST', '2024-03-10', 0);
    const groupsStrict = await pathFinder('ORG', 'DST', '2024-03-10', 1);

    // OH_B -> HD_A is a 30min connection: the fastest combo at
    // minTransferTime=0, but invalid once a 1h minimum is required.
    expect(ids(findGroup(groupsLoose, 'ORG-HUB-DST').fastestRouteLegs)).toEqual(['OH_B', 'HD_A']);
    expect(ids(findGroup(groupsStrict, 'ORG-HUB-DST').fastestRouteLegs)).toEqual(['OH_A', 'HD_A']);

    // The 3-leg chain's connection at HUB (OH_A -> HH2) is exactly 0min:
    // valid at minTransferTime=0 (two feeder options) but not at 1h
    // (only OH_C's 1h gap survives).
    expect(ids(findGroup(groupsLoose, 'ORG-HUB-HUB2-DST').legs[0])).toEqual(['OH_C', 'OH_A']);
    expect(ids(findGroup(groupsStrict, 'ORG-HUB-HUB2-DST').legs[0])).toEqual(['OH_C']);
  });

  test('returns no groups when the destination is unreachable', async () => {
    const groups = await pathFinder('ORG', 'ISO', '2024-03-10', 0);
    expect(groups).toEqual([]);
  });

  test("resolves the search day in the origin airport's local timezone", async () => {
    // TZ1 departs America/New_York at local 23:30 on 2024-06-15, which is
    // 2024-06-16T03:30:00Z -- a different UTC calendar date. A naive
    // UTC-day window would miss it entirely.
    const groups = await pathFinder('TZA', 'TZD', '2024-06-15', 0);

    expect(groups.map((g) => g.key)).toEqual(['TZA-TZD']);
    expect(ids(groups[0].fastestRouteLegs)).toEqual(['TZ1']);
    expect(groups[0].fastestRouteDuration).toBe(1.5 * 3600_000);
  });
});
