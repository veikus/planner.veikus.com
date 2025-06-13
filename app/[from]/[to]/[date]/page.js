import { pathFinder } from '@/lib/susanin';
import { allAirports } from '@/lib/data.mjs';
import SearchForm from '@/components/SearchForm';
import Routes from '@/components/Routes';
import BuyMeACoffee from '@/components/BuyMeACoffee';
import styles from './page.module.css';

export default async function Results({ params, searchParams }) {
  const min = Number(searchParams.minTransferTime ?? 3 * 3600);
  const routes = await pathFinder(params.from, params.to, params.date, min);

  return (
    <div className={styles.app}>
      <h1 className={styles.header}>Route Planner</h1>

      <div className={styles.notification}>
        <p>
          📅 <strong>Site and timetable updated Jun 13, 2025.</strong> Report about issues:&nbsp;
          <a href="mailto:artem@veikus.com">artem@veikus.com</a>
        </p>
      </div>

      <SearchForm airports={allAirports}/>

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee/>
      </div>

      <Routes keyPrefix={`${params.from}-${params.to}-${params.date}-${min}`} routes={routes}/>
    </div>
  );
}