import { DateTime } from 'luxon';
import pool, { endPool } from '../lib/db.js';
import { getFlights } from '../lib/data.js';

const BATCH = 1_000; // How many rows to insert at once

async function insertBatch(rows) {
  if (!rows.length) return;
  const sql = `
    INSERT INTO flight_schedule (
      flight_id, flight_number, flight_date,
      std_local, sta_local, std_utc, sta_utc,
      std_offset_min, sta_offset_min,
      flight_time_min, from_iata, to_iata,
      from_city, to_city
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      std_local       = VALUES(std_local),
      sta_local       = VALUES(sta_local),
      std_utc         = VALUES(std_utc),
      sta_utc         = VALUES(sta_utc),
      flight_time_min = VALUES(flight_time_min)
  `;
  await pool.query(sql, [rows]);
}
export function getFlightForTheDay(flightData, date) {
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
    flightTime: Math.round((staDT.toMillis() - stdDT.toMillis()) / 60_000), // flight time in minutes
    fromAirport: flightData.from.iata,
    toAirport: flightData.to.iata,
    fromCity: flightData.from.name,
    toCity: flightData.to.name,
  };
}

async function main() {
  const flights = getFlights();
  const today   = DateTime.utc();

  const start = today.minus({ years: 1 }).startOf('day');
  const end   = today.plus({ years: 1  }).endOf('day');

  const rows = [];
  for (const data of flights) {
    let cursor = start;

    while (cursor <= end) {
      const leg = getFlightForTheDay(data, cursor);
      cursor = cursor.plus({ days: 1 });

      if (!leg) continue;

      const std = DateTime.fromMillis(leg.std).setZone(data.from.timezone);
      const sta = DateTime.fromMillis(leg.sta).setZone(data.to.timezone);

      rows.push([
        leg.id,
        leg.flightNumber,
        std.toISODate(), // flight_date
        std.toFormat('yyyy-MM-dd HH:mm:ss'), // std_local
        sta.toFormat('yyyy-MM-dd HH:mm:ss'), // sta_local
        std.toUTC().toFormat('yyyy-MM-dd HH:mm:ss'), // std_utc
        sta.toUTC().toFormat('yyyy-MM-dd HH:mm:ss'), // sta_utc
        std.offset, // std_offset_min
        sta.offset, // sta_offset_min
        leg.flightTime, // flight_time_min
        leg.fromAirport,
        leg.toAirport,
        leg.fromCity,
        leg.toCity,
      ]);

      if (rows.length >= BATCH) {
        await insertBatch(rows.splice(0, rows.length)); // отправили и очистили
      }
    }
  }
  // последние остатки
  await insertBatch(rows);

  console.log('Done!');
  await endPool();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  endPool().finally(() => {
    process.exit(1);
  });
});
