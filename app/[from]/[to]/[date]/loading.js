import Link from 'next/link';
import styles from '@/app/page.module.css';
import routeStyles from '@/components/Routes.module.css';
import { Notification } from '@/components';

export default function Loading() {
  return (
    <div className={styles.app}>
      <h1 className={styles.header}>
        <Link href="/">Route Planner</Link>
      </h1>

      <Notification />

      <p className={routeStyles.noSearchResults}>
        Loading... It takes around ~5 seconds. Please, be patient
      </p>
    </div>
  );
}
