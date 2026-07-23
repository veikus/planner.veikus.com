import mysql from 'mysql2/promise';

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASS) {
  console.error('Missing database configuration. Set DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASS.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  timezone: 'Z',
  dateStrings: true,
});

export default pool;

export async function endPool() {
  await pool.end();
}

export async function getAirportByIata(iata) {
  const [rows] = await pool.execute(
    'SELECT iata, name, timezone FROM airports WHERE iata = ? LIMIT 1',
    [iata]
  );
  return rows[0] || null;
}

export async function getAirports() {
  const [rows] = await pool.execute(
    'SELECT iata, name FROM airports ORDER BY name'
  );
  return rows;
}

export async function airportExists(iata) {
  const airport = await getAirportByIata(iata);
  return !!airport;
}

export async function getScheduleDateRange() {
  const [rows] = await pool.execute(
    'SELECT UNIX_TIMESTAMP(MIN(std_utc)) * 1000 AS minUTC, UNIX_TIMESTAMP(MAX(std_utc)) * 1000 AS maxUTC FROM flight_schedule'
  );
  return rows[0];
}

// Same day of buffer as the results page's own range check, since `date`
// is a calendar day in some airport's local timezone, not UTC -- these are
// meant as a soft min/max hint on the search form's date input, not the
// authoritative bounds (that check still happens server-side per search).
export async function getScheduleDateBounds() {
  const { minUTC, maxUTC } = await getScheduleDateRange();
  const bufferMs = 24 * 60 * 60 * 1000;
  return {
    minDate: new Date(minUTC - bufferMs).toISOString().slice(0, 10),
    maxDate: new Date(maxUTC + bufferMs).toISOString().slice(0, 10),
  };
}

// Unlike susanin.js's own getFlightsFromAirport, this isn't filtered by
// from_iata -- it fetches every departure (any airport) inside the window,
// so pathFinder's expansion stages can index the result in memory instead
// of issuing one query per route.
export async function getFlightsInWindow(after, before) {
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
    WHERE std_utc BETWEEN ? AND ?
    ORDER BY std_utc, flight_id
  `, [after, before]);

  return rows;
}

export async function getDataStatus() {
  const [rows] = await pool.execute(
    'SELECT updated_at AS updatedAt FROM data_status WHERE id = 1'
  );
  return rows[0] ?? null;
}
