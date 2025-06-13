'use client';

import React, { useState, useEffect } from 'react';
import styles from './Disclaimer.module.css';

const Disclaimer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isHidden = localStorage.getItem('disclaimerHidden');
      console.log('xxxx', isHidden);
      if (isHidden === null) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleHide = () => {
    localStorage.setItem('disclaimerHidden', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.disclaimerWrapper}>
      <button className={styles.hideButton} onClick={handleHide}>
        Hide
      </button>
      <h2 className={styles.disclaimerTitle}>Disclaimer:</h2>
      <p className={styles.disclaimerText}>
        This website may contain outdated or incorrect information. Flight schedules may be inaccurate or outdated. Before purchasing tickets, please verify the flight availability and schedule with other sources.
      </p>
      <p className={styles.disclaimerText}>
        The website may suggest short connection times. Please assess your own capabilities and ensure that you have enough time for connections.
      </p>
      <p className={styles.disclaimerText}>
        The website may not offer all possible routes, the fastest options, or may calculate travel times incorrectly. It is recommended to cross-check the information with other sources.
      </p>
      <p className={styles.disclaimerText}>
        Please note that WizzAir sells separate tickets for each leg of your journey. If you miss a connection due to a delay or any other reason, it is your responsibility to ensure you catch your next flight, as WizzAir does not guarantee connections between their flights.
      </p>
      <p className={styles.disclaimerText}>We wish you a pleasant journey!</p>
    </div>
  );
};

export default Disclaimer;
