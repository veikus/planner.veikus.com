'use client';

import React, { useState } from 'react';
import Route from './Route';
import styles from './Routes.module.css';

const PAGE_SIZE = 3;

const Routes = ({ keyPrefix, routes }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (routes.length === 0) {
    return <p className={styles.noSearchResults}>No results, try different route</p>
  }

  const hasMore = visibleCount < routes.length;

  return (
    <div>
      {
        routes.slice(0, visibleCount).map(route => (
          <Route key={`${keyPrefix}-${route.key}`} route={route} />
        ))
      }
      {hasMore && (
        <div className={styles.showMoreWrapper}>
          <button className={styles.showMoreButton} onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>
            Show more routes
          </button>
        </div>
      )}
    </div>
  );
};

export default Routes;
