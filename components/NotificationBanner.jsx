'use client';

import { bannerKey } from '@/lib/bannerKey.js';
import { useDismissableBanner } from '@/lib/useDismissableBanner.js';
import styles from './Notification.module.css';

// All user-visible content lives in these constants and feeds bannerKey,
// so editing the message automatically re-shows a dismissed banner.
const BADGE = 'Updated';
const REFRESHED_PREFIX = 'Timetable refreshed on';
const LINK_URL = 'https://www.reddit.com/r/WizzAir/comments/1f3h4tf/multistop_route_planner_for_wizzair/';
const LINK_TEXT = 'Discussion on Reddit';

export default function NotificationBanner({ updatedOn }) {
  // The data date is part of the fingerprint, so dismissing today's
  // "data refreshed" notice doesn't suppress the next update's notice.
  const storageKey = bannerKey(
    'notificationHidden',
    ...(updatedOn ? [BADGE, REFRESHED_PREFIX, updatedOn] : []),
    LINK_TEXT,
    LINK_URL,
  );
  const { visible, dismiss: handleDismiss } = useDismissableBanner(storageKey);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.notification}>
      <div className={styles.text}>
        {updatedOn && (
          <>
            <span className={styles.badge}>{BADGE}</span>
            {REFRESHED_PREFIX} {updatedOn} ·{' '}
          </>
        )}
        <a href={LINK_URL} rel="nofollow" target="_blank">
          {LINK_TEXT}
        </a>
      </div>
      <button className={styles.dismiss} onClick={handleDismiss} aria-label="Dismiss notification">
        ✕
      </button>
    </div>
  );
}
