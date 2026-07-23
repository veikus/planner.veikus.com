'use client';

import React, { useState } from 'react';
import RouteLeg from './RouteLeg';
import TransferInfo from './TransferInfo';
import styles from './Route.module.css';
import { formatDuration, localTime, localDayDiff } from '@/lib/timeFormat';
import { SHORT_TRANSFER_THRESHOLD_MINUTES } from '@/lib/config';

const availableOptionsFor = (legOptions, legIndex, prevLeg) => {
  if (legIndex === 0) return legOptions[0];
  const filtered = legOptions[legIndex].filter(leg => leg.stdUTC > prevLeg.staUTC);
  return filtered.length ? filtered : legOptions[legIndex];
};

const Route = ({ route }) => {
  const legsCount = route.fastestRouteLegs.length;
  const legOptions = route.legs.slice(0, legsCount);

  const [selectedIds, setSelectedIds] = useState(
    route.fastestRouteLegs.map(leg => leg.id)
  );

  const selectedLegs = selectedIds.map((id, i) => legOptions[i].find(leg => leg.id === id));

  const handleChange = (legIndex, newId) => {
    setSelectedIds(prevIds => {
      const nextIds = [...prevIds];
      nextIds[legIndex] = newId;

      let prevLeg = legOptions[legIndex].find(leg => leg.id === newId);
      for (let i = legIndex + 1; i < legsCount; i++) {
        const options = availableOptionsFor(legOptions, i, prevLeg);
        prevLeg = options[0];
        nextIds[i] = prevLeg.id;
      }

      return nextIds;
    });
  };

  const stops = legsCount - 1;
  const stopsLabel = stops === 0 ? 'Direct' : stops === 1 ? '1 stop' : `${stops} stops`;
  const totalDuration = formatDuration(
    selectedLegs[legsCount - 1].staUTC - selectedLegs[0].stdUTC
  );

  const items = [];
  selectedLegs.forEach((leg, i) => {
    const options = availableOptionsFor(legOptions, i, selectedLegs[i - 1]).map(option => {
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

    if (i < legsCount - 1) {
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
  });

  return (
    <div className={styles.route}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.cities}>{route.cities.join(' → ')}</span>
          <span className={styles.stopsBadge}>{stopsLabel}</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.totalLabel}>Total travel time</div>
          <div className={styles.totalDuration}>{totalDuration}</div>
        </div>
      </div>

      <div className={styles.segments}>
        {items.map(({ itemKey, type, ...item }) => (
          type === 'leg'
            ? <RouteLeg key={itemKey} {...item} />
            : <TransferInfo key={itemKey} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Route;
