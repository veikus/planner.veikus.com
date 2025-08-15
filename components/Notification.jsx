import React from 'react';
import styles from './Notification.module.css';

export default function Notification() {
  return (
    <div className={styles.notification}>
      <p>
        📅 <strong>Timetable updated on Aug 15, 2025. And we moved to a more reliable server!</strong><br />
        Discussion on <a href="https://www.reddit.com/r/WizzAir/comments/1f3h4tf/multistop_route_planner_for_wizzair/" rel="nofollow" target="_blank">Reddit</a>
      </p>
    </div>
  );
}
