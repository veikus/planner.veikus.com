import { pathFinder } from '@/lib/susanin';
import { getAirports, airportExists, getAirportByIata } from '@/lib/db.js';
import { SearchForm, Routes, BuyMeACoffee, Notification } from '@/components';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from '@/app/page.module.css';
import { parseMinTransferHours } from '@/lib/config.js';

export const revalidate = 86_400;

export async function generateMetadata({ params }) {
  const { from, to, date } = await params;
  const fromAirport = await getAirportByIata(from);
  const toAirport = await getAirportByIata(to);
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

  const airports = await getAirports();

  function isValidDate(value) {
    const d = new Date(value);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  }

  if (
    !isValidDate(date) ||
    !(await airportExists(from)) ||
    !(await airportExists(to))
  ) {
    notFound();
  }

  const raw = minTransferTime ?? '3';
  const minHours = parseMinTransferHours(raw);
  if (minHours === null) {
    redirect('/400');
  }
  const routes = await pathFinder(from, to, date, minHours);

  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const query = minHours !== 3 ? `?minTransferTime=${minHours}` : '';

  const prevUrl = `/${from}/${to}/${prevDate.toISOString().slice(0, 10)}${query}`;
  const nextUrl = `/${from}/${to}/${nextDate.toISOString().slice(0, 10)}${query}`;

  return (
    <div className={styles.app}>
      <h1 className={styles.header}>
        <Link href="/">Route Planner</Link>
      </h1>

        <Notification/>

      <SearchForm
        airports={airports}
        defaultFrom={from}
        defaultTo={to}
        defaultDate={date}
        defaultMinTransferTime={minHours}
      />

      <div className={styles.dayNav}>
        <Link href={prevUrl}>← Previous Day</Link>
        <Link href={nextUrl}>Next Day →</Link>
      </div>

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee/>
      </div>

      <Routes keyPrefix={`${from}-${to}-${date}-${minHours}`} routes={routes}/>
    </div>
  );
}
