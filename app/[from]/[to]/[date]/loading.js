import styles from '@/app/page.module.css';
import routeStyles from '@/components/Routes.module.css';
import { Notification, Header } from '@/components';

export default function Loading() {
  return (
    <div className={styles.app}>
      <Header/>

      <Notification />

      <p className={routeStyles.noSearchResults}>
        Loading... It takes around ~5 seconds. Please, be patient
      </p>
    </div>
  );
}
