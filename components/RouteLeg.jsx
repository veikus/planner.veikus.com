'use client';

import React from 'react';
import styles from './RouteLeg.module.css';

const RouteLeg = ({
  depTime,
  depCode,
  arrTime,
  arrCode,
  arrDayBadge,
  flightNumber,
  durationLabel,
  options,
  selectedId,
  onChange,
}) => {
  return (
    <div className={styles.leg}>
      <div className={styles.row}>
        <div className={styles.side}>
          <span className={styles.time}>{depTime}</span>
          <span className={styles.code}>{depCode}</span>
        </div>

        <div className={styles.middle}>
          <span className={styles.durationLabel}>{durationLabel}</span>
          <div className={styles.line}>
            <span className={styles.plane}>✈</span>
          </div>
        </div>

        <div className={`${styles.side} ${styles.sideEnd}`}>
          <span className={styles.timeWithBadge}>
            <span className={styles.time}>{arrTime}</span>
            {arrDayBadge && <sup className={styles.dayBadge}>{arrDayBadge}</sup>}
          </span>
          <span className={styles.code}>{arrCode}</span>
        </div>
      </div>

      <div className={styles.flightNumber}>Flight {flightNumber}</div>

      <select
        className={styles.legSelect}
        value={selectedId}
        onChange={onChange}
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RouteLeg;
