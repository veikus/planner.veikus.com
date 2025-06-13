'use client';

import React from "react";
import styles from "./TransferInfo.module.css";

const formatTime = (seconds) => {
  const days = Math.floor(seconds / 86400000);
  const hours = Math.floor((seconds % 86400000) / 3600000);
  const minutes = Math.floor((seconds % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

const TransferInfo = ({leg1, leg2}) => {
  if (!leg1 || !leg2) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Transfer</p>
      <p className={styles.text}>{formatTime(leg2.std - leg1.sta)}</p>
    </div>
  )
}

export default TransferInfo;