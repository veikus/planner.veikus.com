'use client';

import React from 'react';
import styles from './BuyMeACoffee.module.css';

export default function BuyMeACoffee() {
  return (
    <a className={styles.btn}
       target="_blank"
       href="https://buymeacoffee.com/veikus"><span className={styles.beer}>🍺</span><span className={styles.txt}>Support this project</span></a>
  );
}