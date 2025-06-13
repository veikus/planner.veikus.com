import React from 'react';
import styles from './UpdateNotification.module.css';

export default function UpdateNotification() {
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
