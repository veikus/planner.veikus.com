'use client';

import React, { useState } from 'react';
import RouteLeg from './RouteLeg';
import TransferInfo from './TransferInfo';
import styles from './Route.module.css';
import { formatDuration } from '@/lib/timeFormat';
import { filterConnectingOptions, selectLeg } from '@/lib/routeSelection';

const Route = ({ route, minTransferTime = 0 }) => {
  const options1 = route.legs[0];
  const options2 = route.legs[1];
  const options3 = route.legs[2];

  // Only the user's explicit choice per leg is state; everything else
  // (which options are reachable, which leg is actually selected) is
  // derived below so a broken chain (an earlier pick with no valid next
  // leg) can never leave a later derivation looking at undefined.
  const [selectedIds, setSelectedIds] = useState(() => ({
    0: route.fastestRouteLegs[0]?.id,
    1: route.fastestRouteLegs[1]?.id,
    2: route.fastestRouteLegs[2]?.id,
  }));

  const availableOptions1 = options1;
  const leg1 = selectLeg(availableOptions1, selectedIds[0]);
  const availableOptions2 = filterConnectingOptions(options2, leg1, minTransferTime);
  const leg2 = selectLeg(availableOptions2, selectedIds[1]);
  const availableOptions3 = filterConnectingOptions(options3, leg2, minTransferTime);
  const leg3 = selectLeg(availableOptions3, selectedIds[2]);

  const calculateTravelTime = () => {
    const start = leg1.stdUTC;
    const end = leg3?.staUTC ?? leg2?.staUTC ?? leg1.staUTC;

    return formatDuration(end - start);
  };

  const handleChange = (legIndex, event) => {
    const newId = event.target.value;

    setSelectedIds(prev => {
      const next = { ...prev, [legIndex]: newId };
      // An earlier leg changing invalidates any explicit choice on later
      // legs -- they re-derive to the first still-valid option instead.
      for (let i = legIndex + 1; i <= 2; i++) {
        delete next[i];
      }
      return next;
    });
  };

  return (
    <div className={styles.route}>
        <div className={styles.header}>
          <div>{route.cities.join(' - ')}</div>
          <div className={styles.travelTime}>{calculateTravelTime()}</div>
        </div>

        <div className={styles.segments}>
          <RouteLeg selected={leg1} options={availableOptions1} onChange={e => handleChange(0, e)} />
          <TransferInfo leg1={leg1} leg2={leg2} />
          <RouteLeg selected={leg2} options={availableOptions2} onChange={e => handleChange(1, e)} />
          <TransferInfo leg1={leg2} leg2={leg3} />
          <RouteLeg selected={leg3} options={availableOptions3} onChange={e => handleChange(2, e)} />
        </div>
    </div>
  );
};

export default Route;