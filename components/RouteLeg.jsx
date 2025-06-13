'use client';

import React from "react";
import styles from "./RouteLeg.module.css";

const formatDate = (timestamp, offset = 0) => {
  const date = new Date(timestamp + offset * 60 * 1000);
  const DD = date.getUTCDate().toString().padStart(2, '0');
  const MM = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const YYYY = date.getUTCFullYear();
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');

  return `${DD}.${MM}.${YYYY} ${hh}:${mm}`;
}

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
        <span className={styles.textBold}>Departure:</span> {formatDate(selected.std, selected.stdOffset)}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Arrival:</span> {formatDate(selected.sta, selected.staOffset)}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Flight:</span> {selected.flightNumber}
      </p>
      <p className={styles.text}>
        <span className={styles.textBold}>Flight time:</span> {selected.flightTime}
      </p>
      <select
        className={styles.legSelect}
        onChange={(e) => onChange(e)}
        value={selected.id}
      >
        {
          options.map((flight, routeIndex) => (
            <option key={flight.id} value={flight.id}>
              {flight.flightNumber} {formatDate(flight.std, flight.stdOffset)}
            </option>
          ))
        }
      </select>
    </div>
  );
};

export default RouteLeg;