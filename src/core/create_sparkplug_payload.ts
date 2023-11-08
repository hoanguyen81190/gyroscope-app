// createSparkplugPayload.ts

export const createGyroSparkplugPayload = (gyroData: any, label: string) => {
  const payload = {
      time: new Date().toISOString(),
      name: 'gyroscope',
      label, //activity
      metrics: [
        {
          metric: 'alpha',
          type: 'Float',
          value: gyroData.alpha,
        },
        {
          metric: 'beta',
          type: 'Float',
          value: gyroData.beta,
        },
        {
          metric: 'gamma',
          type: 'Float',
          value: gyroData.gamma,
        },
      ],
  };

  return payload;
};

export const createMotionSparkplugPayload = (motionData: any, label: string) => {
    const payload = {
        time: new Date().toISOString(),
        name: 'motion',
        label, 
        metrics: [
          {
            metric: 'x',
            type: 'Float',
            value: motionData.x,
          },
          {
            metric: 'y',
            type: 'Float',
            value: motionData.y,
          },
          {
            metric: 'z',
            type: 'Float',
            value: motionData.z,
          },
        ],
    };
  
    return payload;
  };
  