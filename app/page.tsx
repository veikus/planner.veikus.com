import SearchForm from '@/components/SearchForm';
import BuyMeACoffee from '@/components/BuyMeACoffee';
import Notification from '@/components/Notification';
import { allAirports } from '@/lib/data.mjs';
import styles from '@/app/page.module.css';

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
