'use client';

import React from 'react';
import styles from './TransferInfo.module.css';

const TransferInfo = ({ code, durationLabel, isShort }) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Transfer · {code}</span>
      <span className={styles.duration}>{durationLabel}</span>
      {isShort && <span className={styles.shortBadge}>Short connection</span>}
    </div>
  );
};

export default TransferInfo;
