'use client';

import { useState } from 'react';
import styles from './Notification.module.css';

export default function NotificationBanner({ updatedOn }) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.notification}>
      <div className={styles.text}>
        {updatedOn && (
          <>
            <span className={styles.badge}>Updated</span>
            Timetable refreshed on {updatedOn} ·{' '}
          </>
        )}
        <a href="https://www.reddit.com/r/WizzAir/comments/1f3h4tf/multistop_route_planner_for_wizzair/" rel="nofollow" target="_blank">
          Discussion on Reddit
        </a>
      </div>
      <button className={styles.dismiss} onClick={() => setVisible(false)} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}
