import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allFlights = [];
const allAirports = [];

(() => {
  const flightsDir = path.join(__dirname, '../flights');
  const fileNames = fs.readdirSync(flightsDir).filter(name => name.endsWith('.json'));
  const airportsSet = new Set();

  for (const fileName of fileNames) {
    const raw = fs.readFileSync(path.join(flightsDir, fileName), 'utf8');
    const flightData = JSON.parse(raw);
    if (!flightData.from || !flightData.to) {
      console.log(`Skipped ${fileName} due to missing from/to data`);
      continue;
    }

    allFlights.push(flightData);

    const {iata, name} = flightData.from;
    if (!airportsSet.has(iata)) {
      allAirports.push({iata, name});
      airportsSet.add(iata);
    }
  }

  allAirports.sort((a, b) => a.name.localeCompare(b.name));
})();

export function getAirportByIata(iata) {
  return allAirports.find((a) => a.iata === iata) || null;
}

export { allFlights, allAirports };
