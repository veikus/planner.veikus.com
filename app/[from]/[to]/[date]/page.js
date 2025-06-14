import { pathFinder } from '@/lib/susanin';
import { getAirports, getAirportByIata, airportExists } from '@/lib/data.js';
import { SearchForm, Routes, BuyMeACoffee, Notification } from '@/components';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from '@/app/page.module.css';
import { parseMinTransferHours } from '@/lib/config.js';

export const revalidate = 86_400;

export async function generateMetadata({ params }) {
  const { from, to, date } = await params;
  const fromAirport = getAirportByIata(from);
  const toAirport = getAirportByIata(to);
  const fromName = fromAirport ? fromAirport.name : params.from;
  const toName = toAirport ? toAirport.name : params.to;
  const title = `${fromName} → ${toName} on ${date}`;
  const description = `Routes from ${fromName} to ${toName} on ${date}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function Results({ params, searchParams }) {
  const { from, to, date } = await params;
  const { minTransferTime } = await searchParams;

  function isValidDate(value) {
    const d = new Date(value);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  }

  if (!isValidDate(date) || !airportExists(from) || !airportExists(to)) {
    notFound();
  }

  const raw = minTransferTime ?? '3';
  const minHours = parseMinTransferHours(raw);
  if (minHours === null) {
    redirect('/400');
  }
  const min = minHours * 3600;
  const routes = await pathFinder(from, to, date, min);

  return (
    <div className={styles.app}>
      <h1 className={styles.header}>
        <Link href="/">Route Planner</Link>
      </h1>

        <Notification/>

      <SearchForm
        airports={getAirports()}
        defaultFrom={from}
        defaultTo={to}
        defaultDate={date}
        defaultMinTransferTime={minHours}
      />

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee/>
      </div>

      <Routes keyPrefix={`${from}-${to}-${date}-${min}`} routes={routes}/>
    </div>
  );
}