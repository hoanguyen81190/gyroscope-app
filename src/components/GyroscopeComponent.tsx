// src/GyroscopeComponent.tsx

import React, { useEffect, useState } from 'react';

import { GyroscopeSample, Activity } from '../core/indexedDb';

import IndexedDb from '../core/indexedDb';

const ACTIVITY_LIST = ["upstair", "downstair", "sitting", "walking"]



const GyroscopeComponent: React.FC = () => {
  const [activity, setActivity] = React.useState(ACTIVITY_LIST[0]);
  const [currentDataBlock, setCurrentDataBlock] = React.useState<GyroscopeSample[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [serverAddress, setServerAddress] = React.useState("http://192.168.0.42:5999");
  const [testMessage, setTestMessage] = React.useState("");
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeSample>({
    timestamp: Date.now(),
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  async function saveGyroscopeData(activity: Activity) {
    const indexedDb = new IndexedDb();
    await indexedDb.createObjectStore();
    await indexedDb.putValue(activity);
    //const db = await dbPromise;
    //const tx = db.transaction('gyroscopeData', 'readwrite');
    //const store = tx.objectStore('gyroscopeData');
    //await store.add(activity);
    //await tx.done;
  }

  useEffect(() => {
    const runIndexDb = async () => {
        const indexedDb = new IndexedDb();
        await indexedDb.createObjectStore();
    }
    runIndexDb();

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

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity(e.target.value as string);
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

  const handleSendData = async () => {
    const indexedDb = new IndexedDb();
    await indexedDb.createObjectStore();
    const result = await indexedDb.getAllValue();
    console.log('Get All Data', JSON.stringify(result));
    //setTestMessage(result);
    const api = serverAddress + "/api";
    fetch(api)
      .then(response => response.json())
      .then(data => {console.log("hello", data.hello); setTestMessage(data.hello)})
      .catch(error => console.error('Error:', error));
    /* fetch(api, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
    })
    .then((response) => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        console.log('Data successfully sent:', data);
    })
    .catch((error) => {
        console.error('Error sending data:', error);
    }); */
  }

  const handleClearData = async () => {
    const indexedDb = new IndexedDb();
    await indexedDb.createObjectStore();
    await indexedDb.deleteAllValue();
    console.log("DONE")
  }

  return (
    <div>
        <div className="absolute top-0 right-0 p-2">
            <div>
                <input
                    id="Server Address"
                    value={serverAddress}
                    onChange={(e) => setServerAddress(e.target.value)}
                />
                <button  onClick={handleSendData}> Save </button >
            </div>
            <div>
                Clear Data: <button  onClick={handleClearData}> Clear </button >
            </div>
            
        </div>
        {/* ----------------------------------MAIN--------------------------------- */}
        <div>
            <label htmlFor="dropdown">Activity:</label>
            <select id="dropdown" value={activity} onChange={handleActivityChange}>
                {ACTIVITY_LIST.map((item, index) => {
                    return (<option key={index} value={item}>{item}</option>);
                })}
            </select>
        </div>
        <div>
        </div>
        <div>
            <h2>Gyroscope Data:</h2>
            <p>Alpha: {gyroscopeData.alpha}</p>
            <p>Beta: {gyroscopeData.beta}</p>
            <p>Gamma: {gyroscopeData.gamma}</p>
            <p>Test: {testMessage}</p>
        </div>
        <div>
            <button  onClick={handleRecording}>{!isRecording ? "Start Recording" : "Stop Recording"}</button >
        </div>
    </div>
  );
};

export default GyroscopeComponent;
