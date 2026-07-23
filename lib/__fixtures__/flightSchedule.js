// Shared fixture "flight schedule" for lib/susanin.test.js. Kept separate
// from the test file so the same data can be inspected/reused if the mock
// setup needs to change shape later without touching expected values.

export const AIRPORTS = [
  { iata: 'ORG', name: 'Origin', timezone: 'UTC' },
  { iata: 'HUB', name: 'Hub', timezone: 'UTC' },
  { iata: 'HUB2', name: 'Hub Two', timezone: 'UTC' },
  { iata: 'DST', name: 'Destination', timezone: 'UTC' },
  { iata: 'ISO', name: 'Isolated', timezone: 'UTC' },
  // Local day (2024-06-15) starts at 04:00 UTC (EDT, UTC-4) -- flights near
  // local midnight fall on a different UTC calendar date.
  { iata: 'TZA', name: 'Timezone Origin', timezone: 'America/New_York' },
  { iata: 'TZD', name: 'Timezone Destination', timezone: 'America/New_York' },
];

function utc(iso) {
  return new Date(iso).getTime();
}

function flight({ id, from, to, fromCity, toCity, depISO, arrISO }) {
  const stdUTC = utc(depISO);
  const staUTC = utc(arrISO);
  return {
    id,
    flightNumber: id,
    // Real SELECT formats std/sta as local-time strings via DATE_FORMAT;
    // not exercised by these tests since nothing here asserts on display
    // strings, but populated for shape-fidelity with the real row.
    std: depISO,
    stdOffset: 0,
    sta: arrISO,
    staOffset: 0,
    flightTime: Math.round((staUTC - stdUTC) / 60000),
    fromAirport: from,
    toAirport: to,
    fromCity,
    toCity,
    stdUTC,
    staUTC,
  };
}

export const FLIGHTS = [
  // Direct ORG -> DST, deliberately the fastest of all groups (2.5h).
  flight({ id: 'DIR1', from: 'ORG', to: 'DST', fromCity: 'Origin City', toCity: 'Dest City', depISO: '2024-03-10T08:00:00Z', arrISO: '2024-03-10T10:30:00Z' }),

  // ORG -> HUB, two options (for sort-order + minTransferTime coverage).
  flight({ id: 'OH_A', from: 'ORG', to: 'HUB', fromCity: 'Origin City', toCity: 'Hub City', depISO: '2024-03-10T06:00:00Z', arrISO: '2024-03-10T07:00:00Z' }),
  flight({ id: 'OH_B', from: 'ORG', to: 'HUB', fromCity: 'Origin City', toCity: 'Hub City', depISO: '2024-03-10T06:30:00Z', arrISO: '2024-03-10T07:30:00Z' }),
  // Dedicated early feeder for the 3-leg chain below.
  flight({ id: 'OH_C', from: 'ORG', to: 'HUB', fromCity: 'Origin City', toCity: 'Hub City', depISO: '2024-03-10T05:00:00Z', arrISO: '2024-03-10T06:00:00Z' }),

  // HUB -> DST, two options.
  flight({ id: 'HD_A', from: 'HUB', to: 'DST', fromCity: 'Hub City', toCity: 'Dest City', depISO: '2024-03-10T08:00:00Z', arrISO: '2024-03-10T09:30:00Z' }),
  flight({ id: 'HD_B', from: 'HUB', to: 'DST', fromCity: 'Hub City', toCity: 'Dest City', depISO: '2024-03-10T09:00:00Z', arrISO: '2024-03-10T10:30:00Z' }),

  // Loop trap: goes back to ORG. Must never survive into any result.
  flight({ id: 'LOOP1', from: 'HUB', to: 'ORG', fromCity: 'Hub City', toCity: 'Origin City', depISO: '2024-03-10T08:00:00Z', arrISO: '2024-03-10T09:00:00Z' }),

  // HUB -> HUB2 -> DST, completing a 3-leg chain from OH_C (and, at
  // minTransferTime=0 only, from OH_A too).
  flight({ id: 'HH2', from: 'HUB', to: 'HUB2', fromCity: 'Hub City', toCity: 'Hub Two City', depISO: '2024-03-10T07:00:00Z', arrISO: '2024-03-10T07:45:00Z' }),
  flight({ id: 'H2D', from: 'HUB2', to: 'DST', fromCity: 'Hub Two City', toCity: 'Dest City', depISO: '2024-03-10T08:45:00Z', arrISO: '2024-03-10T10:00:00Z' }),

  // Timezone boundary: local departure 23:30 on 2024-06-15 in New York
  // (EDT, UTC-4) is 2024-06-16T03:30:00Z -- a different UTC calendar date
  // than the queried local date.
  flight({ id: 'TZ1', from: 'TZA', to: 'TZD', fromCity: 'TZ Origin City', toCity: 'TZ Dest City', depISO: '2024-06-16T03:30:00Z', arrISO: '2024-06-16T05:00:00Z' }),
];

export function findFlightsWithinRange(afterUtcString, beforeUtcString) {
  const afterMs = Date.parse(`${afterUtcString.replace(' ', 'T')}Z`);
  const beforeMs = Date.parse(`${beforeUtcString.replace(' ', 'T')}Z`);
  return FLIGHTS.filter((f) => f.stdUTC >= afterMs && f.stdUTC <= beforeMs);
}

export function findFlightsFromWithinRange(fromIata, afterUtcString, beforeUtcString) {
  return findFlightsWithinRange(afterUtcString, beforeUtcString).filter(
    (f) => f.fromAirport === fromIata
  );
}

export function findAirport(iata) {
  return AIRPORTS.find((a) => a.iata === iata) ?? null;
}
