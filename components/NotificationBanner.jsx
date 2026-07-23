'use client';

import { useState, useEffect } from 'react';
import styles from './Notification.module.css';

export default function NotificationBanner({ updatedOn }) {
  // Keyed by updatedOn (not a single static key) so dismissing today's
  // "data refreshed" notice doesn't also suppress the next real update --
  // that gets its own date, and thus its own not-yet-dismissed key.
  const storageKey = updatedOn ? `notificationHidden:${updatedOn}` : 'notificationHidden';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(storageKey) === null) {
      setVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setVisible(false);
  };

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
      <button className={styles.dismiss} onClick={handleDismiss} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}
