import React from 'react';
import styles from './Notification.module.css';

export default function Notification() {
  return (
    <div className={styles.notification}>
      <p>
        📅 <strong>Timetable updated on Aug 15, 2025. And we moved to a more reliable server!</strong>{' '}
        Report about issues:&nbsp;
        <a href="mailto:artem@veikus.com">artem@veikus.com</a>
      </p>
    </div>
  );
}
