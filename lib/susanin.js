import { DateTime } from 'luxon';
import pool, { getAirportByIata, getFlightsInWindow } from './db.js';

class Route {
  constructor(legs) {
    this.legs = legs;
  }

  get to() {
    return this.legs[this.legs.length - 1].toAirport;
  }

  get staUTC() {
    return this.legs[this.legs.length - 1].staUTC;
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

async function getFlightsFromAirport(from, after, before) {
  const [rows] = await pool.execute(`
    SELECT 
      flight_id AS id,
      flight_number AS flightNumber,
      DATE_FORMAT(std_local, '%d.%m.%Y %H:%i') AS std,
      std_offset_min AS stdOffset,
      DATE_FORMAT(sta_local, '%d.%m.%Y %H:%i') AS sta,
      sta_offset_min AS staOffset,
      flight_time_min AS flightTime,
      from_iata AS fromAirport,
      to_iata AS toAirport,
      from_city AS fromCity,
      to_city AS toCity,
      UNIX_TIMESTAMP(std_utc) * 1000 AS stdUTC,
      UNIX_TIMESTAMP(sta_utc) * 1000 AS staUTC 
    FROM flight_schedule
    WHERE from_iata = ?
    AND std_utc BETWEEN ? AND ?
    ORDER BY std_utc, flight_id
  `, [from, after, before]);

  return rows;
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

  result.sort((a, b) => a.stdUTC - b.stdUTC);
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

    const routeDuration = route.legs[route.legs.length - 1].staUTC - route.legs[0].stdUTC;
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

async function buildInitialRoutes(from, date) {
  const airport = await getAirportByIata(from);
  if (!airport) {
    console.warn(`Airport with IATA code "${from}" not found.`);
    return [];
  }

  const localDate = DateTime.fromISO(date, { zone: airport.timezone });
  const startOfDay = localDate.startOf('day');
  const endOfDay   = startOfDay.plus({ days: 1 });

  const flights = await getFlightsFromAirport(
    from,
    startOfDay.toUTC().toFormat('yyyy-MM-dd HH:mm:ss'),
    endOfDay.toUTC().toFormat('yyyy-MM-dd HH:mm:ss')
  );
  return flights.map(flight => new Route([flight]));
}

function routeExpansionWindow(route, minTransferTime) {
  const start = route.staUTC + minTransferTime * 60 * 60 * 1000;
  const end = start + 3 * 24 * 60 * 60 * 1000; // 3 days later
  return [start, end];
}

function indexByFromAirport(flights) {
  const index = new Map();
  for (const flight of flights) {
    const bucket = index.get(flight.fromAirport);
    if (bucket) {
      bucket.push(flight);
    } else {
      index.set(flight.fromAirport, [flight]);
    }
  }
  return index;
}

// Every route needing expansion has its own precise [start, end] departure
// window (staUTC + minTransferTime, plus a 3 day lookahead), same as before.
// Rather than one DB round-trip per route, fetch the union of all those
// windows in a single query, indexed in memory by departure airport, and
// filter each route's exact window from that index.
//
// The final expansion loop below iterates `routes` itself (not a filtered
// subset) to keep newly-expanded routes interleaved with already-arrived
// ones in the same relative order the old single-pass version produced --
// groupRoutes' fastest-route tie-breaking (strict `<`, first-seen wins) and
// its final stable sort both depend on that order for routes/groups tied
// on duration.
async function expandRoutes(routes, to, minTransferTime, finalLeg = false) {
  const pending = routes.filter(route => route.to !== to);

  let flightsByAirport = new Map();
  if (pending.length > 0) {
    let windowStart = Infinity;
    let windowEnd = -Infinity;
    for (const route of pending) {
      const [start, end] = routeExpansionWindow(route, minTransferTime);
      if (start < windowStart) windowStart = start;
      if (end > windowEnd) windowEnd = end;
    }

    const startDT = DateTime.fromMillis(windowStart, { zone: 'utc' }).toFormat('yyyy-MM-dd HH:mm:ss');
    const endDT = DateTime.fromMillis(windowEnd, { zone: 'utc' }).toFormat('yyyy-MM-dd HH:mm:ss');
    flightsByAirport = indexByFromAirport(await getFlightsInWindow(startDT, endDT));
  }

  const results = [];
  for (const route of routes) {
    if (route.to === to) {
      results.push(route);
      continue;
    }

    const [start, end] = routeExpansionWindow(route, minTransferTime);
    const candidates = flightsByAirport.get(route.to) ?? [];
    let flights = candidates.filter(flight => flight.stdUTC >= start && flight.stdUTC <= end);
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

/**
 * Finds paths from one airport to another on a given date.
 * @param from - IATA code of the departure airport
 * @param to - IATA code of the destination airport
 * @param date - Date in ISO format (YYYY-MM-DD)
 * @param minTransferTime - Minimum transfer time in hours
 * @returns {Promise<*[]>}
 */
export async function pathFinder(from, to, date, minTransferTime) {
  let routes = await buildInitialRoutes(from, date);
  routes = await expandRoutes(routes, to, minTransferTime);
  routes = await expandRoutes(routes, to, minTransferTime, true);
  return groupRoutes(routes);
}