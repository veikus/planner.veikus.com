import Link from 'next/link';
import styles from './Header.module.css';

export default function Header({ isHome = false }) {
  const brand = (
    <div className={styles.brandRow}>
      <svg width="30" height="16" viewBox="0 0 30 16" aria-hidden="true">
        <circle cx="3" cy="8" r="3" fill="var(--accent)" />
        <line x1="7" y1="8" x2="23" y2="8" stroke="var(--border)" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="27" cy="8" r="3" fill="var(--ink)" />
      </svg>
      <h1 className={styles.title}>Route Planner</h1>
    </div>
  );

  return (
    <div className={styles.header}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
      {isHome ? brand : <Link href="/" className={styles.brandLink}>{brand}</Link>}
      <p className={styles.subtitle}>Multi-stop connections for WizzAir flights</p>
    </div>
  );
}
