'use client';

import React from 'react';
import { bannerKey } from '@/lib/bannerKey.js';
import { useDismissableBanner } from '@/lib/useDismissableBanner.js';
import styles from './Disclaimer.module.css';

// The visible content lives in these constants and feeds bannerKey, so
// rewording the disclaimer re-shows it to users who hid an old version.
const TITLE = 'Disclaimer';
const PARAGRAPHS = [
  'This website may contain outdated or incorrect information. Flight schedules may be inaccurate or outdated. Before purchasing tickets, please verify the flight availability and schedule with other sources.',
  'The website may suggest short connection times. Please assess your own capabilities and ensure that you have enough time for connections.',
  'The website may not offer all possible routes, the fastest options, or may calculate travel times incorrectly. It is recommended to cross-check the information with other sources.',
  'Please note that WizzAir sells separate tickets for each leg of your journey. If you miss a connection due to a delay or any other reason, it is your responsibility to ensure you catch your next flight, as WizzAir does not guarantee connections between their flights.',
  'We wish you a pleasant journey!',
];

const Disclaimer = () => {
  const { visible: isVisible, dismiss: handleHide } = useDismissableBanner(bannerKey('disclaimerHidden', TITLE, ...PARAGRAPHS));

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.disclaimerWrapper}>
      <button className={styles.hideButton} onClick={handleHide}>
        Hide
      </button>
      <h2 className={styles.disclaimerTitle}>{TITLE}</h2>
      {PARAGRAPHS.map((text) => (
        <p key={text} className={styles.disclaimerText}>
          {text}
        </p>
      ))}
    </div>
  );
};

export default Disclaimer;
