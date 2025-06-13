import { pathFinder } from '@/lib/susanin';
import { allAirports } from '@/lib/data.mjs';
import { SearchForm, Routes, BuyMeACoffee, Notification } from '@/components';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from '@/app/page.module.css';
import { parseMinTransferHours } from '@/lib/config.js';

export default async function Results({ params, searchParams }) {
  const raw = searchParams.minTransferTime ?? '3';
  const minHours = parseMinTransferHours(raw);
  if (minHours === null) {
    redirect('/400');
  }
  const min = minHours * 3600;
  const routes = await pathFinder(params.from, params.to, params.date, min);

  return (
    <div className={styles.app}>
      <h1 className={styles.header}>
        <Link href="/">Route Planner</Link>
      </h1>

        <Notification/>

      <SearchForm airports={allAirports}/>

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee/>
      </div>

      <Routes keyPrefix={`${params.from}-${params.to}-${params.date}-${min}`} routes={routes}/>
    </div>
  );
}