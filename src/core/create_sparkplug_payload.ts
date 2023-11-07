// createSparkplugPayload.ts

export const createGyroSparkplugPayload = (gyroData: any, label: string) => {
  const payload = {
      time: new Date().toISOString(),
      //quality: 192, // Good quality
      name: 'gyroscope',
      label, // Add the label here
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
        //quality: 192, // Good quality
        name: 'motion',
        label, // Add the label here
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
  