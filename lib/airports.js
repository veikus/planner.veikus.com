import { allAirports } from './data.mjs';

const airportSet = new Set(allAirports.map(a => a.iata));

export function airportExists(iata) {
  return airportSet.has(iata);
}
