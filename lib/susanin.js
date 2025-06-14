import { getFlights, getAirportByIata } from './data.js';
import { DateTime } from 'luxon';

const flightsFromCache = new Map();

class Route {
  constructor(legs) {
    this.legs = legs;
  }

  get to() {
    return this.legs[this.legs.length - 1].toAirport;
  }

  get sta() {
    return this.legs[this.legs.length - 1].sta;
  }

  get airports() {
    const set = new Set();
    for (const leg of this.legs) {
      set.add(leg.fromAirport);
      set.add(leg.toAirport);
    }

    return set;
  }

  addLegIfNotLooped(flight) {
    if (this.airports.has(flight.toAirport)) {
      return null;
    }

    return new Route([...this.legs, flight]);
  }
}

function getFlightsBetween(flightData, start, end) {
  const tz = flightData.from.timezone;
  const results = [];

  let cursor = start.setZone(tz).startOf('day');
  const endMillis = end.toMillis();
  const startMillis = start.toMillis();

  while (cursor.toMillis() <= endMillis) {
    const flight = getFlightForTheDay(flightData, cursor);

    if (flight &&
      flight.std >= startMillis &&
      flight.std <= endMillis) {
      results.push(flight);
    }

    cursor = cursor.plus({ days: 1 });
  }

  return results;
}

function calculateFlightTime(std, sta) {
  const duration = sta - std;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getFlightForTheDay(flightData, date) {
  const tzFrom = flightData.from.timezone;
  const tzTo   = flightData.to.timezone;

  const localDate = date.setZone(tzFrom);
  const dayKey = ['mon','tue','wed','thu','fri','sat','sun'][localDate.weekday - 1];
  const timetable = flightData.timetable[dayKey];
  if (!timetable) {
    return null;
  }

  const [stdH, stdM] = timetable.std.split(':').map(Number);
  const stdDT = localDate.set({
    hour: stdH,
    minute: stdM,
    second: 0,
    millisecond: 0,
  });

  const [staH, staM] = timetable.sta.split(':').map(Number);
  let staDT = stdDT.setZone(tzTo).set({
    hour: staH,
    minute: staM,
    second: 0,
    millisecond: 0,
  });

  // If the scheduled arrival time is before the scheduled departure time,
  // it means the flight arrives the next day.
  if (staDT.toMillis() <= stdDT.toMillis()) {
    staDT = staDT.plus({ days: 1 });
  }

  return {
    id: `${flightData.flightNumber}-${stdDT.toISODate()}`,
    flightNumber: flightData.flightNumber,
    std: stdDT.toMillis(),
    stdOffset: stdDT.offset,
    sta: staDT.toMillis(),
    staOffset: staDT.offset,
    flightTime: calculateFlightTime(stdDT.toMillis(), staDT.toMillis()),
    fromAirport: flightData.from.iata,
    toAirport: flightData.to.iata,
    fromCity: flightData.from.name,
    toCity: flightData.to.name,
  };
}

function getFlightsFromAirport(from, after, before) {
  const results = [];
  let cachedFlights = flightsFromCache.get(from);
  if (!cachedFlights) {
    const allFlights = getFlights();
    cachedFlights = allFlights.filter(flight => flight.from.iata === from);
    flightsFromCache.set(from, cachedFlights);
  }

  for (const flight of cachedFlights) {
    const flights = getFlightsBetween(flight, after, before);
    results.push(...flights);
  }

  return results;
}

function groupLegs(legs) {
  const result = [];

  const flights = new Set();
  for (const leg of legs) {
    if (!flights.has(leg.id)) {
      flights.add(leg.id);
      result.push(leg);
    }
  }

  result.sort((a, b) => a.std - b.std);
  return result;
}

function groupRoutes(routes) {
  const grouped = {};

  for (const route of routes) {
    const airports = [...route.legs.map(leg => leg.fromAirport), route.to];
    const key = airports.join('-');
    const group = grouped[key] || {
      key,
      airports,
      cities: [...route.legs.map(leg => leg.fromCity), route.legs[route.legs.length - 1].toCity],
      legs: [[], [], []],
      fastestRouteDuration: 0,
      fastestRouteLegs: [],
    };

    if (!grouped[key]) {
      grouped[key] = group;
    }

    const routeDuration = route.legs[route.legs.length - 1].sta - route.legs[0].std;
    if (group.fastestRouteDuration === 0 || routeDuration < group.fastestRouteDuration) {
      group.fastestRouteDuration = routeDuration;
      group.fastestRouteLegs = route.legs;
    }

    for (let i = 0; i < 3; i++) {
      if (route.legs[i]) {
        group.legs[i].push(route.legs[i]);
      }
    }
  }

  const result = [];
  for (const key in grouped) {
    const group = grouped[key];
    group.legs[0] = groupLegs(group.legs[0]);
    group.legs[1] = groupLegs(group.legs[1]);
    group.legs[2] = groupLegs(group.legs[2]);
    result.push(grouped[key]);
  }

  result.sort((a, b) => a.fastestRouteDuration - b.fastestRouteDuration);
  return result;
}

function filterFlightsByDestination(flights, destination) {
  return flights.filter(flight => flight.toAirport === destination);
}

function buildInitialRoutes(from, date) {
  const airport = getAirportByIata(from);
  if (!airport) {
    console.warn(`Airport with IATA code "${from}" not found.`);
    return [];
  }

  const localDate = DateTime.fromISO(date, { zone: airport.timezone });
  const startOfDay = localDate.startOf('day');
  const endOfDay   = startOfDay.plus({ days: 1 });

  const flights = getFlightsFromAirport(from, startOfDay, endOfDay);
  return flights.map(flight => new Route([flight]));
}

function expandRoutes(routes, to, minTransferTime, finalLeg = false) {
  const results = [];
  const transferDelta = { seconds: minTransferTime };

  for (const route of routes) {
    if (route.to === to) {
      results.push(route);
      continue;
    }

    // Earliest possible start time for the next leg
    const startDT = DateTime
      .fromMillis(route.sta, { zone: 'utc' })
      .plus(transferDelta);

    // End time for the next leg, 3 days after the start time
    const endDT = startDT.plus({ days: 3 });

    let flights = getFlightsFromAirport(route.to, startDT, endDT);
    if (finalLeg) {
      flights = filterFlightsByDestination(flights, to);
    }

    for (const flight of flights) {
      const newRoute = route.addLegIfNotLooped(flight);
      if (newRoute) {
        results.push(newRoute);
      }
    }
  }

  return results;
}

export function pathFinder(from, to, date, minTransferTime) {
  let routes = buildInitialRoutes(from, date);
  routes = expandRoutes(routes, to, minTransferTime);
  routes = expandRoutes(routes, to, minTransferTime, true);
  return groupRoutes(routes);
}