import { DateTime } from 'luxon';
import { getDataStatus } from '@/lib/db.js';
import styles from './Notification.module.css';

export default async function Notification() {
  const status = await getDataStatus();
  const updatedOn = status
    ? DateTime.fromSQL(status.updatedAt, { zone: 'utc' }).toFormat('LLL d, yyyy')
    : null;

  return (
    <div className={styles.notification}>
      <p>
        {updatedOn && (
          <>
            📅 <strong>Timetable updated on {updatedOn}.</strong><br />
          </>
        )}
        Discussion on <a href="https://www.reddit.com/r/WizzAir/comments/1f3h4tf/multistop_route_planner_for_wizzair/" rel="nofollow" target="_blank">Reddit</a>
      </p>
    </div>
  );
}
