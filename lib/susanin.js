import { allFlights } from './data.mjs';
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
  const date = new Date(start);
  const results = [];

  while (date.getTime() <= end.getTime()) {
    const flight = getFlightForTheDay(flightData, date);
    if (flight && flight.std >= start.getTime() && flight.std <= end.getTime()) {
      results.push(flight);
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return results;
}

function calculateOffset(timezone, timestamp) {
  const dateTimeInZone = DateTime.fromISO(timestamp.toISOString(), { zone: timezone });
  return dateTimeInZone.offset; // in minutes
}

function calculateFlightTime(std, sta) {
  const duration = sta - std;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getFlightForTheDay(flightData, date) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const key = days[date.getUTCDay()];

  const timetable = flightData.timetable[key];
  if (!timetable) {
    return null;
  }

  const std = new Date(date);
  const sta = new Date(date);

  {
    const [hours, minutes] = timetable.std.split(':');
    std.setUTCHours(hours, minutes, 0, 0);
  }
  {
    const [hours, minutes] = timetable.sta.split(':');
    sta.setUTCHours(hours, minutes, 0, 0);
    if (sta <= std) {
      sta.setUTCDate(sta.getUTCDate() + 1);
    }
  }

  return {
    id: `${flightData.flightNumber}-${date.toISOString().slice(0, 10)}`,
    flightNumber: flightData.flightNumber,
    std: std.getTime(),
    stdOffset: calculateOffset(flightData.from.timezone, std),
    sta: sta.getTime(),
    staOffset: calculateOffset(flightData.to.timezone, sta),
    flightTime: calculateFlightTime(std, sta),
    fromAirport: flightData.from.iata,
    toAirport: flightData.to.iata,
    fromCity: flightData.from.name,
    toCity: flightData.to.name,
  }
}

function getFlightsFromAirport(from, after, before) {
  const results = [];
  let cachedFlights = flightsFromCache.get(from);
  if (!cachedFlights) {
    cachedFlights = allFlights.filter(flight => flight.from.iata === from);
    flightsFromCache.set(from, cachedFlights);
  }

  for (const flight of cachedFlights) {
    const flights = getFlightsBetween(flight, new Date(after), new Date(before));
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
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  const startTime = dateObj.getTime();
  const endTime = startTime + 24 * 60 * 60 * 1000;
  const flights = getFlightsFromAirport(from, startTime, endTime);
  return flights.map(flight => new Route([flight]));
}

function expandRoutes(routes, to, minTransferTime, finalLeg = false) {
  const results = [];

  for (const route of routes) {
    if (route.to === to) {
      results.push(route);
      continue;
    }

    const startTime = route.sta + minTransferTime * 1000;
    const endTime = startTime + 3 * 24 * 60 * 60 * 1000;
    let flights = getFlightsFromAirport(route.to, startTime, endTime);

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

function pathFinder(from, to, date, minTransferTime) {
  let routes = buildInitialRoutes(from, date);
  routes = expandRoutes(routes, to, minTransferTime);
  routes = expandRoutes(routes, to, minTransferTime, true);
  return groupRoutes(routes);
}

export { pathFinder, getFlightsBetween };
