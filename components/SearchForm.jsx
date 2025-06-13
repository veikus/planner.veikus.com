'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchForm.module.css';

export default function SearchForm({ airports }) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(today);
  const [minTransferTime, setMinTransferTime] = useState(3); // часы
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;

    const maxHours = 72;
    const minHours = Math.min(minTransferTime, maxHours);

    let url = `/${from}/${to}/${date}`;
    if (minHours !== 3) {
      const minSeconds = minHours * 3600;
      url += `?minTransferTime=${minSeconds}`;
    }

    router.push(url);
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          {/* FROM */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="from">From:</label>
            <select
              id="from"
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              <option value="">Select airport</option>
              {airports.map(a => (
                <option key={a.iata} value={a.iata}>
                  {a.name} ({a.iata})
                </option>
              ))}
            </select>
          </div>

          {/* TO */}
          <div className={styles.formGroup}>
            <label htmlFor="to">Destination:</label>
            <select
              id="to"
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              <option value="">Select airport</option>
              {airports.map(a => (
                <option key={a.iata} value={a.iata}>
                  {a.name} ({a.iata})
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* SUBMIT */}
          <button
            className={styles.searchButton}
            type="submit"
            disabled={!from || !to || !date}
          >
            Search
          </button>
        </div>

        {/* ADVANCED */}
        <p
          className={styles.advancedButton}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} advanced settings
        </p>

        {showAdvanced && (
          <div className={styles.section}>
            <div className={`${styles.formGroup} ${styles.minTransferTime}`}>
              <label htmlFor="minTransferTime">
                Minimum Transfer Time (0 – 72 h):
              </label>
              <input
                type="number"
                id="minTransferTime"
                value={minTransferTime}
                min={0}
                max={72}
                onChange={e => setMinTransferTime(Number(e.target.value))}
              />
              {minTransferTime < 3 && (
                <p className={styles.warningText}>
                  Warning: short transfer time may lead to missed connections!
                </p>
              )}
            </div>
            <div className={styles.spacer} />
          </div>
        )}
      </form>
    </div>
  );
}
