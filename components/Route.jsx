'use client';

import React, { useState } from 'react';
import RouteLeg from './RouteLeg';
import TransferInfo from './TransferInfo';
import styles from './Route.module.css';
import { formatDuration, localTime, localDayDiff } from '@/lib/timeFormat';
import { SHORT_TRANSFER_THRESHOLD_MINUTES } from '@/lib/config';
import { deriveSelectedLegs } from '@/lib/routeSelection';

const Route = ({ route, minTransferTime = 0 }) => {
  const legsCount = route.fastestRouteLegs.length;
  const legOptions = route.legs.slice(0, legsCount);

  // Only the user's explicit choice per leg is state; which options are
  // reachable and which leg ends up selected are both derived fresh on
  // every render (see deriveSelectedLegs) so a broken chain -- an earlier
  // pick with no valid next leg -- can never leave a later leg looking at
  // undefined.
  const [selectedIds, setSelectedIds] = useState(() =>
    route.fastestRouteLegs.map(leg => leg.id)
  );

  const { selectedLegs, availableOptionsPerLeg } = deriveSelectedLegs(
    legOptions,
    selectedIds,
    minTransferTime
  );

  const handleChange = (legIndex, newId) => {
    setSelectedIds(prevIds => {
      const nextIds = [...prevIds];
      nextIds[legIndex] = newId;
      // An earlier leg changing invalidates any explicit choice on later
      // legs -- they re-derive to the first still-valid option instead.
      for (let i = legIndex + 1; i < legsCount; i++) {
        nextIds[i] = undefined;
      }

      const { selectedLegs: nextSelectedLegs } = deriveSelectedLegs(
        legOptions,
        nextIds,
        minTransferTime
      );
      return nextSelectedLegs.map(leg => leg?.id);
    });
  };

  // If a chain breaks, selectedLegs holds undefined from that point on;
  // render only up to the last leg that actually has a selection.
  const firstBrokenIndex = selectedLegs.findIndex(leg => !leg);
  const renderableCount = firstBrokenIndex === -1 ? legsCount : firstBrokenIndex;
  const isBroken = renderableCount < legsCount;

  const stops = legsCount - 1;
  const stopsLabel = stops === 0 ? 'Direct' : stops === 1 ? '1 stop' : `${stops} stops`;
  const totalDuration = isBroken
    ? null
    : formatDuration(selectedLegs[legsCount - 1].staUTC - selectedLegs[0].stdUTC);

  const items = [];
  for (let i = 0; i < renderableCount; i++) {
    const leg = selectedLegs[i];
    const options = availableOptionsPerLeg[i].map(option => {
      const dayOffset = localDayDiff(selectedLegs[0].std, option.std);
      return {
        id: option.id,
        label: `${option.flightNumber} · ${localTime(option.std)}${dayOffset > 0 ? ` (+${dayOffset})` : ''}`,
      };
    });

    const legDayDiff = localDayDiff(leg.std, leg.sta);
    items.push({
      type: 'leg',
      itemKey: `leg-${i}`,
      depTime: localTime(leg.std),
      depCode: leg.fromAirport,
      arrTime: localTime(leg.sta),
      arrCode: leg.toAirport,
      arrDayBadge: legDayDiff > 0 ? `+${legDayDiff}` : '',
      flightNumber: leg.flightNumber,
      durationLabel: formatDuration(leg.flightTime * 60_000),
      options,
      selectedId: leg.id,
      onChange: (e) => handleChange(i, e.target.value),
    });

    if (i < renderableCount - 1) {
      const next = selectedLegs[i + 1];
      const transferMs = next.stdUTC - leg.staUTC;
      items.push({
        type: 'transfer',
        itemKey: `transfer-${i}`,
        code: leg.toAirport,
        durationLabel: formatDuration(transferMs),
        isShort: transferMs / 60_000 < SHORT_TRANSFER_THRESHOLD_MINUTES,
      });
    }
  }

  return (
    <div className={styles.route}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.cities}>{route.cities.join(' → ')}</span>
          <span className={styles.stopsBadge}>{stopsLabel}</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.totalLabel}>Total travel time</div>
          <div className={styles.totalDuration}>{totalDuration ?? '—'}</div>
        </div>
      </div>

      <div className={styles.segments}>
        {items.map(({ itemKey, type, ...item }) => (
          type === 'leg'
            ? <RouteLeg key={itemKey} {...item} />
            : <TransferInfo key={itemKey} {...item} />
        ))}
      </div>

      {isBroken && (
        <p className={styles.noConnectionText}>
          No later flight connects from this selection — try a different option above.
        </p>
      )}
    </div>
  );
};

export default Route;
