// src/GyroscopeComponent.tsx

import React, { useEffect, useState } from 'react';

const GyroscopeComponent: React.FC = () => {
  const [gyroscopeData, setGyroscopeData] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setGyroscopeData({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div>
      <h2>Gyroscope Data:</h2>
      <p>Alpha: {gyroscopeData.alpha}</p>
      <p>Beta: {gyroscopeData.beta}</p>
      <p>Gamma: {gyroscopeData.gamma}</p>
    </div>
  );
};

export default GyroscopeComponent;
