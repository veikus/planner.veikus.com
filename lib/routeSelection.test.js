import { describe, test, expect } from 'vitest';
import { filterConnectingOptions, selectLeg } from './routeSelection.js';

function flight(id, stdUTC, staUTC) {
  return { id, stdUTC, staUTC };
}

describe('filterConnectingOptions', () => {
  test('returns no options when there is no previous leg', () => {
    // This is the guard that stops the old crash: Route.jsx used to chain
    // options3.filter(leg => leg.stdUTC > newLeg2.staUTC) straight off a
    // possibly-undefined newLeg2. Returning [] here instead of touching
    // previousLeg makes that chain safe by construction.
    const options = [flight('A', 100, 200)];
    expect(filterConnectingOptions(options, undefined, 0)).toEqual([]);
  });

  test('keeps only options departing at least minTransferHours after the previous arrival', () => {
    const previousLeg = flight('P', 0, 1_000);
    const options = [
      flight('too-soon', 1_000 + 59 * 60_000, 0), // 59min gap
      flight('exact', 1_000 + 60 * 60_000, 0), // exactly 60min gap
      flight('later', 1_000 + 120 * 60_000, 0), // 2h gap
    ];

    const result = filterConnectingOptions(options, previousLeg, 1);
    expect(result.map(o => o.id)).toEqual(['exact', 'later']);
  });

  test('returns an empty array when nothing connects', () => {
    const previousLeg = flight('P', 0, 1_000);
    const options = [flight('too-soon', 1_000, 0)];
    expect(filterConnectingOptions(options, previousLeg, 5)).toEqual([]);
  });
});

describe('selectLeg', () => {
  const options = [flight('A', 0, 0), flight('B', 0, 0)];

  test('returns the option matching the selected id', () => {
    expect(selectLeg(options, 'B')).toEqual(flight('B', 0, 0));
  });

  test('falls back to the first option when no id is selected', () => {
    expect(selectLeg(options, undefined)).toEqual(flight('A', 0, 0));
  });

  test('falls back to the first option when the selected id is not present', () => {
    expect(selectLeg(options, 'missing')).toEqual(flight('A', 0, 0));
  });

  test('returns undefined for an empty options list, regardless of id', () => {
    expect(selectLeg([], undefined)).toBeUndefined();
    expect(selectLeg([], 'anything')).toBeUndefined();
  });
});
