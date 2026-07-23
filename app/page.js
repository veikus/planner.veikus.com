import { SearchForm, BuyMeACoffee, Notification, Header } from '@/components';
import { getAirports, getScheduleDateBounds } from '@/lib/db.js';
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

export default async function Home() {
  const airports = await getAirports();
  const { minDate, maxDate } = await getScheduleDateBounds();
  return (
    <div className={styles.app}>
      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee />
      </div>

      <Header isHome />

      <Notification/>

      <SearchForm airports={airports} minDate={minDate} maxDate={maxDate} />
    </div>
  );
}
