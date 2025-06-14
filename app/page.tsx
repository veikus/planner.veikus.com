import { SearchForm, BuyMeACoffee, Notification } from '@/components';
import { getAirports } from '@/lib/data.js';
import styles from '@/app/page.module.css';

export const revalidate = 86_400;

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

      <SearchForm airports={getAirports()} />

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee />
      </div>
    </div>
  );
}
