'use client';

import React from 'react';
import styles from './TransferInfo.module.css';
import { formatDuration } from '@/lib/timeFormat';

const TransferInfo = ({leg1, leg2}) => {
  if (!leg1 || !leg2) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Transfer</p>
      <p className={styles.text}>{formatDuration(leg2.std - leg1.sta)}</p>
    </div>
  )
}

export default TransferInfo;