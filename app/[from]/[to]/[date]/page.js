import { DateTime } from 'luxon';
import { pathFinder } from '@/lib/susanin';
import { getAirports, airportExists, getAirportByIata, getScheduleDateBounds } from '@/lib/db.js';
import { SearchForm, Routes, BuyMeACoffee, Notification, Disclaimer, Header } from '@/components';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from '@/app/page.module.css';
import { parseMinTransferHours } from '@/lib/config.js';
import { isValidDate, isWithinScheduleRange } from '@/lib/dateRange.js';

export const revalidate = 86_400;

export async function generateMetadata({ params }) {
  const { from, to, date } = await params;
  const fromAirport = await getAirportByIata(from);
  const toAirport = await getAirportByIata(to);
  const fromName = fromAirport ? fromAirport.name : from;
  const toName = toAirport ? toAirport.name : to;
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
  const { minDate, maxDate } = await getScheduleDateBounds();

  if (
    !isValidDate(date) ||
    !(await isWithinScheduleRange(date)) ||
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
  const dayLabel = DateTime.fromISO(date, { zone: 'utc' }).toFormat('ccc, dd LLL yyyy');

  return (
    <div className={styles.app}>
      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee/>
      </div>

      <Header/>

      <Notification/>

      <SearchForm
        airports={airports}
        defaultFrom={from}
        defaultTo={to}
        defaultDate={date}
        defaultMinTransferTime={minHours}
        minDate={minDate}
        maxDate={maxDate}
      />

      <Disclaimer/>

      <div className={styles.dayNav}>
        <Link href={prevUrl} rel="nofollow">← Previous day</Link>
        <span className={styles.dayLabel}>{dayLabel}</span>
        <Link href={nextUrl} rel="nofollow">Next day →</Link>
      </div>

      <Routes keyPrefix={`${from}-${to}-${date}-${minHours}`} routes={routes} minTransferTime={minHours}/>
    </div>
  );
}
