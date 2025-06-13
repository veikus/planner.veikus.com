'use client';

import React, { useState } from 'react';
import RouteLeg from './RouteLeg';
import TransferInfo from './TransferInfo';
import styles from './Route.module.css';
import { formatDuration } from '@/lib/timeFormat';

const Route = ({ route }) => {
  const fastestRouteLegs = route.fastestRouteLegs;
  const options1 = route.legs[0];
  const options2 = route.legs[1];
  const options3 = route.legs[2];
  const [leg1, setLeg1] = useState(options1.find(leg => leg.id === fastestRouteLegs[0].id));
  const [leg2, setLeg2] = useState(options2.find(leg => leg.id === fastestRouteLegs[1].id));
  const [leg3, setLeg3] = useState(options3.find(leg => leg.id === fastestRouteLegs[2].id));
  const availableOptions1 = options1;
  const [availableOptions2, setAvailableOptions2] = useState(options2);
  const [availableOptions3, setAvailableOptions3] = useState(options3);


  const calculateTravelTime = () => {
    const start = leg1.std;
    const end = leg3?.sta || leg2?.sta || leg1.sta;

    return formatDuration(end - start);
  };

  const handleChange = (legIndex, event) => {
    const newId = event.target.value;
    const newSelection = route.legs[legIndex].find(leg => leg.id === newId);

    let newLeg1 = leg1;
    let newLeg2 = leg2;
    let newLeg3 = leg3;
    let newAvailableOptions2 = availableOptions2;
    let newAvailableOptions3 = availableOptions3;

    if (legIndex === 0) {
      newLeg1 = newSelection;
      newAvailableOptions2 = options2.filter(leg => leg.std > newLeg1.sta);
      newLeg2 = newAvailableOptions2[0];
      newAvailableOptions3 = options3.filter(leg => leg.std > newLeg2.sta);
      newLeg3 = newAvailableOptions3[0];

      setLeg1(newLeg1);
      setLeg2(newLeg2);
      setLeg3(newLeg3);
      setAvailableOptions2(newAvailableOptions2);
      setAvailableOptions3(newAvailableOptions3);
    }

    if (legIndex === 1) {
      newLeg2 = newSelection;
      newAvailableOptions3 = options3.filter(leg => leg.std > newLeg2.sta);
      newLeg3 = newAvailableOptions3[0];

      setLeg2(newLeg2);
      setLeg3(newLeg3);
      setAvailableOptions3(newAvailableOptions3);
    }

    if (legIndex === 2) {
      newLeg3 = newSelection;
      setLeg3(newLeg3);
    }
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