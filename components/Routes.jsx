import React from 'react';
import Route from './Route';
import Disclaimer from './Disclaimer';
import styles from './Routes.module.css';

const Routes = ({keyPrefix, routes}) => {
  if (Object.keys(routes).length === 0) {
    return <p className={styles.noSearchResults}>No results, try different route</p>
  }

  return (
    <div>
      <Disclaimer/>
      {
        routes.map(route => (
          <Route key={`${keyPrefix}-${route.key}`} route={route} />
        ))
      }
    </div>
  );
};

export default Routes;