import React from 'react';
import styles from './Notification.module.css';

export default function Notification() {
  return (
    <div className={styles.notification}>
      <p>
        📅 <strong>Site and timetable updated Jun 13, 2025.</strong>{' '}
        Report about issues:&nbsp;
        <a href="mailto:artem@veikus.com">artem@veikus.com</a>
      </p>
    </div>
  );
}
