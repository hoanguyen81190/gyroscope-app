// createSparkplugPayload.ts

export interface GyroscopeData {
  alpha: number;
  beta: number;
  gamma: number;
}

interface GyroDataMetric {
  metric: string;
  type: string;
  value: GyroscopeData;
}

export const createGyroSparkplugPayload = (gyroData: GyroscopeData[], label: string) => {
  const metrics: GyroDataMetric[] = gyroData.map((one: GyroscopeData) => ({
    metric: 'gyroData',
    type: 'GyroscopeData',
    value: { 
      alpha: one.alpha, 
      beta: one.beta, 
      gamma: one.gamma },
  }));

  const payload = {
      time: new Date().toISOString(),
      name: 'gyroscope',
      label, //activity
      metrics: metrics,
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
  