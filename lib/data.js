import fs from 'fs';
import path from 'path';

function readFlightData() {
  console.log('Loading flight data from disk…');
  const dir = path.join(process.cwd(), 'flights');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  const flights = [];
  const airports = [];
  const seen = new Set();

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    flights.push(data);
    const { iata, name } = data.from ?? {};
    if (iata && !seen.has(iata)) {
      airports.push({ iata, name });
      seen.add(iata);
    }
  }
  airports.sort((a, b) => a.name.localeCompare(b.name));
  return { flights, airports };
}

export const getFlightData = () => {
  if (!globalThis.__flightCache) {
    globalThis.__flightCache = readFlightData();
  }
  return globalThis.__flightCache;
};
export const getAirports   = () => getFlightData().airports;
export const getFlights    = () => getFlightData().flights;

export function getAirportByIata(iata) {
  const airports = getAirports();
  return airports.find((a) => a.iata === iata) || null;
}

export function airportExists(iata) {
  return !!getAirportByIata(iata);
}