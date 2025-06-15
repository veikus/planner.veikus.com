'use client';

import React from 'react';
import styles from './RouteLeg.module.css';
import { formatDuration } from '@/lib/timeFormat';

const RouteLeg = ({selected, options, onChange}) => {
  if (!selected) {
    return null;
  }

  return (
    <div className={styles.leg}>
      <p className={styles.title}>
        {selected.fromAirport} - {selected.toAirport}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Departure:</span> {selected.std}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Arrival:</span> {selected.sta}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Flight:</span> {selected.flightNumber}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Flight time:</span> {formatDuration(selected.flightTime * 60_000)}
      </p>
      <select
        className={styles.legSelect}
        onChange={(e) => onChange(e)}
        value={selected.id}
      >
        {
          options.map((flight, routeIndex) => (
            <option key={flight.id} value={flight.id}>
              {flight.flightNumber} {flight.std}
            </option>
          ))
        }
      </select>
    </div>
  );
};

export default RouteLeg;