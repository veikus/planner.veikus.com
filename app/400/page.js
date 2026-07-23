export const metadata = {
  title: '400 – Bad Request',
};

import Link from 'next/link';
import styles from './page.module.css';

export default function BadRequest() {
  return (
    <div className={styles.wrapper}>
      <h1>400 – Bad Request</h1>
      <p>Invalid parameters provided.</p>
      <p>
        <Link href="/">Return to search</Link>
      </p>
    </div>
  );
}
