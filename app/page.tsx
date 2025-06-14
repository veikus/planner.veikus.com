import { SearchForm, BuyMeACoffee, Notification } from '@/components';
import { allAirports } from '@/lib/data.mjs';
import styles from '@/app/page.module.css';

export const revalidate = 60 * 60 * 24;

export const metadata = {
  title: 'Route Planner',
  description: 'Find flight routes with minimal transfers',
  openGraph: {
    title: 'Route Planner',
    description: 'Find flight routes with minimal transfers',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className={styles.app}>
      <h1 className={styles.header}>Route Planner</h1>

        <Notification/>

      <SearchForm airports={allAirports} />

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee />
      </div>
    </div>
  );
}
