// src/GyroscopeComponent.tsx

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import { dbPromise, GyroscopeSample } from '../core/indexedDBmanager';

const ACTIVITY_LIST = ["upstair", "downstair", "sitting", "walking"]

type Activity = {
    label: string;
    data: GyroscopeSample[]; // Array of [timestamp, alpha, beta, gamma]
};

const GyroscopeComponent: React.FC = () => {
  const [activity, setActivity] = React.useState(ACTIVITY_LIST[0]);
  const [currentDataBlock, setCurrentDataBlock] = React.useState<GyroscopeSample[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeSample>({
    timestamp: Date.now(),
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  async function saveGyroscopeData(activity: Activity) {
    const db = await dbPromise;
    const tx = db.transaction('gyroscopeData', 'readwrite');
    const store = tx.objectStore('gyroscopeData');
    await store.add(activity);
    await tx.done;
  }

  useEffect(() => {
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    let val: GyroscopeSample = {
        timestamp: Date.now(),
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      }
    setGyroscopeData(val);

    if (isRecording) {
      // Add the gyroscope data to the list
      
      setCurrentDataBlock(prevData => [...prevData, val]);
    }
  };

  const handleActivityChange = (event: SelectChangeEvent) => {
    setActivity(event.target.value as string);
  };

  const handleRecording = () => {
    setIsRecording(prev => !prev);

    if (isRecording) {
        setCurrentDataBlock([]);
    }

    if (!isRecording) {
        const oneActivity: Activity = {
            label: activity,
            data: [...currentDataBlock],
        };
        saveGyroscopeData(oneActivity);
    }
  };

  return (
    <div>
        <div>
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Activity</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={activity}
                    label="Activity"
                    onChange={handleActivityChange}
                >
                {ACTIVITY_LIST.map((item, index) => {
                    return (<MenuItem key={index} value={item}>{item}</MenuItem>);
                })}
                </Select>
            </FormControl>
        </Box>
        </div>
        <div>
            <h2>Gyroscope Data:</h2>
            <p>Alpha: {gyroscopeData.alpha}</p>
            <p>Beta: {gyroscopeData.beta}</p>
            <p>Gamma: {gyroscopeData.gamma}</p>
        </div>
        <div>
        <Button variant="outlined" onClick={handleRecording}>{!isRecording ? "Start Recording" : "Stop Recording"}</Button>
        </div>
    </div>
  );
};

export default GyroscopeComponent;
