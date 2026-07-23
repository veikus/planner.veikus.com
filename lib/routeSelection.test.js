import { describe, test, expect } from 'vitest';
import { filterConnectingOptions, selectLeg, deriveSelectedLegs } from './routeSelection.js';

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

describe('deriveSelectedLegs', () => {
  const L1_EARLY = flight('L1_EARLY', 0, 100 * 60_000);
  const L1_LATE = flight('L1_LATE', 0, 500 * 60_000);
  const L2_OPT = flight('L2_OPT', 150 * 60_000, 250 * 60_000); // 50min after L1_EARLY's arrival
  const L3_OPT = flight('L3_OPT', 300 * 60_000, 400 * 60_000); // 50min after L2_OPT's arrival

  const legOptions = [[L1_EARLY, L1_LATE], [L2_OPT], [L3_OPT]];

  test('derives every leg when the whole chain connects', () => {
    const { selectedLegs, availableOptionsPerLeg } = deriveSelectedLegs(
      legOptions,
      [L1_EARLY.id, L2_OPT.id, L3_OPT.id],
      0
    );

    expect(selectedLegs).toEqual([L1_EARLY, L2_OPT, L3_OPT]);
    expect(availableOptionsPerLeg[0]).toEqual([L1_EARLY, L1_LATE]);
    expect(availableOptionsPerLeg[1]).toEqual([L2_OPT]);
    expect(availableOptionsPerLeg[2]).toEqual([L3_OPT]);
  });

  test('a broken connection cascades: every leg after it is undefined too', () => {
    // L1_LATE arrives (500min) long after L2_OPT departs (150min) -- nothing
    // connects, and nothing can connect onward from an unselected leg 2
    // either. This is the exact chain that used to crash Route.jsx.
    const { selectedLegs, availableOptionsPerLeg } = deriveSelectedLegs(
      legOptions,
      [L1_LATE.id, undefined, undefined],
      0
    );

    expect(selectedLegs).toEqual([L1_LATE, undefined, undefined]);
    expect(availableOptionsPerLeg[1]).toEqual([]);
    expect(availableOptionsPerLeg[2]).toEqual([]);
  });

  test('raising minTransferTime can itself trigger the same cascade', () => {
    // L1_EARLY -> L2_OPT is only a 50min gap. Fine at minTransferHours=0,
    // broken at minTransferHours=1 (60min) -- and leg 3 breaks along with it
    // even though nothing about leg 3's own options changed.
    const loose = deriveSelectedLegs(legOptions, [L1_EARLY.id, undefined, undefined], 0);
    expect(loose.selectedLegs).toEqual([L1_EARLY, L2_OPT, L3_OPT]);

    const strict = deriveSelectedLegs(legOptions, [L1_EARLY.id, undefined, undefined], 1);
    expect(strict.selectedLegs).toEqual([L1_EARLY, undefined, undefined]);
  });

  test('an id that no longer resolves anywhere still leaves earlier legs untouched', () => {
    const { selectedLegs } = deriveSelectedLegs(
      legOptions,
      [L1_EARLY.id, L2_OPT.id, 'stale-id-not-in-options'],
      0
    );

    // Leg 3's selectedId doesn't match anything, so it falls back to the
    // first available option -- same as an explicit choice never having
    // been made at all.
    expect(selectedLegs).toEqual([L1_EARLY, L2_OPT, L3_OPT]);
  });
});
