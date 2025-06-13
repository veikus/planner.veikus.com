import SearchForm from '@/components/SearchForm';
import BuyMeACoffee from '@/components/BuyMeACoffee';
import UpdateNotification from '@/components/UpdateNotification';
import { allAirports } from '@/lib/data.mjs';
import styles from '@/app/page.module.css';

export default function Home() {
  return (
    <div className={styles.app}>
      <h1 className={styles.header}>Route Planner</h1>

      <UpdateNotification/>

      <SearchForm airports={allAirports} />

      <div className={styles.buyMeACoffee}>
        <BuyMeACoffee />
      </div>
    </div>
  );
}
