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
