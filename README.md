# Route Planner

This is a flight route planner built with Next.js. It helps find flight connections between airports with minimal transfers.

The live application can be accessed at [https://planner.veikus.com/](https://planner.veikus.com/).

## Features
- Search for routes between IATA airports
- Adjustable minimum transfer time
- Displays detailed flight and transfer information

## Development
1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and configure database variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`).
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

Alternatively you can run the project with Docker Compose:
```bash
docker-compose up -d
```

## Building for Production
```
npm run build
npm start
```

## Contact
For questions or issues please email [artem@veikus.com](mailto:artem@veikus.com).
