# Route Planner

This is a flight route planner built with Next.js. It helps find flight connections between airports with minimal transfers.

The live application can be accessed at [https://planner.veikus.com/](https://planner.veikus.com/).

## Features
- Search for routes between IATA airports
- Adjustable minimum transfer time
- Displays detailed flight and transfer information

## Development
1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and configure database variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`). Optionally set `REVALIDATE_SECRET` — it authorizes `POST /api/revalidate`, which the data pipeline ([planner-data](https://github.com/veikus/planner-data)) calls after loading fresh data so the site refreshes without a redeploy.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

Alternatively you can run the project with Docker Compose:
```bash
docker-compose up -d
```

## API
- `GET /api/airports` — every airport, `[{ iata, name }, ...]` ordered by name.
- `GET /api/routes/:from/:to/:date?minTransferTime=3` — routes between two IATA codes for a given `YYYY-MM-DD` date, grouped the same way as the results page. `minTransferTime` is in hours and defaults to `3`. Returns `{ from, to, date, minTransferTime, routes }`, or `400`/`404` with `{ error }` for an invalid date/`minTransferTime`/unknown airport.

## Building for Production
```
npm run build
npm start
```

## Contact
For questions or issues please email [artem@veikus.com](mailto:artem@veikus.com).
