// src/GyroscopeComponent.tsx

import React, { useEffect, useState } from 'react';

import { GyroscopeSample, Activity } from '../core/indexedDb';

import IndexedDb from '../core/indexedDb';

import axios from 'axios';

//These are the default activities, can expand later either via hardcode or interface
const ACTIVITY_LIST = ["upstair", "downstair", "sitting", "walking"]

const GyroscopeComponent: React.FC = () => {
  //The label for the activity in recording, can be switch using a drop-down list
  const [activity, setActivity] = React.useState(ACTIVITY_LIST[0]);

  //Store the current sample
  const [currentDataBlock, setCurrentDataBlock] = React.useState<GyroscopeSample[]>([]);

  //Flag to mark the recording
  const [isRecording, setIsRecording] = React.useState(false);

  //Address of the central server to store all data, currently use REST_API, can be switched/expanded to MQTT later
  const [serverAddress, setServerAddress] = React.useState("http://192.168.0.42:5999");

  //For testing purpose only
  const [testMessage, setTestMessage] = React.useState("");

  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  //For displaying the data on the screen
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeSample>({
    timestamp: Date.now(),
    yaw: 0,
    pitch: 0,
    roll: 0,
    x: 0,
    y: 0,
    z: 0
  });

  //Save the data temporarily in indexedDb of the browser
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

  //Webpage initiation
  useEffect(() => {

    //Database initiation
    const runIndexDb = async () => {
        const indexedDb = new IndexedDb();
        await indexedDb.createObjectStore();
    }
    runIndexDb();

    //Since iOS 12.2, Apple requires permission to access device orientation and motion data
    if (typeof DeviceOrientationEvent !== 'undefined') {
      const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
      if (typeof requestPermissionFn === 'function') {
        requestPermissionFn()
          .then((permissionState: PermissionState) => {
            if (permissionState === 'granted') {
              setIsPermissionGranted(true);
              window.addEventListener('deviceorientation', handleOrientation);
              window.addEventListener('devicemotion', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        setIsPermissionGranted(true);
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleOrientation);
      }
      
    }
/*     if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    } */ else {
      console.log('Device orientation not supported.');
      
    }

    //let gyroscopeInterval;

    /* if (isRecording) {
      gyroscopeInterval = setInterval(() => {
        const newGyroscopeData: GyroscopeSample = {
          timestamp: Date.now(),
          alpha: Math.random(),
          beta: Math.random(),
          gamma: Math.random(),
        };
        console.log("recording la ")
        setCurrentDataBlock(prevData => [...prevData, newGyroscopeData]);
      }, 1000);
    } else {
      clearInterval(gyroscopeInterval);
    } */
      // non iOS 13+
      //window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleOrientation);

    };
  }, [isRecording, currentDataBlock]);

  const handleOrientation = (event: DeviceOrientationEvent | DeviceMotionEvent) => {
    let val: GyroscopeSample = {
      timestamp: Date.now(),
      yaw:  0,
      pitch:  0,
      roll:  0,
      x: 0,
      y: 0,
      z: 0
    }
    if (event instanceof DeviceOrientationEvent) {
      val.yaw = event.alpha || 0
      val.pitch = event.beta || 0
      val.roll = event.gamma || 0
    } else if (event instanceof DeviceMotionEvent) {
      val.x = event.acceleration?.x || 0
      val.y = event.acceleration?.y || 0
      val.z = event.acceleration?.z || 0
    }
/*     const val: GyroscopeSample = {
        timestamp: Date.now(),
        yaw: alpha || 0,
        pitch: beta || 0,
        roll: gamma || 0,
        accelerometer: event.
      } */
    setGyroscopeData(val);

    if (isRecording) {
      // Add the gyroscope data to the list
      console.log("is recording")
      setCurrentDataBlock(prevData => [...prevData, val]);
      
    }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity(e.target.value as string);
  };
  
  const startRecording = () => {
    setIsRecording(true);
    setCurrentDataBlock([]);
    setTestMessage("number of samples " + currentDataBlock.length);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setTestMessage("number of samples " + currentDataBlock.length);
    const oneActivity: Activity = {
      label: activity,
      data: [...currentDataBlock],
    };
    saveGyroscopeData(oneActivity);
  };

  const handleSendData = async () => {
    const indexedDb = new IndexedDb();
    await indexedDb.createObjectStore();
    const result = await indexedDb.getAllValue();
    console.log('Get All Data', JSON.stringify(result));
    //setTestMessage(result);
    const api = serverAddress + "/api";
    axios.post(api, result)
      .then(response=> {
        console.log('Response:', response.data.data);
        setTestMessage(response.data.data);
        
      })
      .catch(error => {
        console.error('Error:', error);
      }); 
  }

  const handleClearData = async () => {
    const indexedDb = new IndexedDb();
    await indexedDb.createObjectStore();
    await indexedDb.deleteAllValue();
    console.log("DONE")
  }

  const requestOrientationAccess = () => {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
      if (typeof requestPermissionFn === 'function') {
        requestPermissionFn()
          .then((permissionState: PermissionState) => {
            if (permissionState === 'granted') {
              setIsPermissionGranted(true);
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      }
    }
  };
  return (
    <div>
      {!isPermissionGranted ? (<button onClick={() => {requestOrientationAccess()}}>Request Orientation Access</button>) : <div/>}
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
            <p>Yaw: {gyroscopeData.yaw}</p>
            <p>Pitch: {gyroscopeData.pitch}</p>
            <p>Roll: {gyroscopeData.roll}</p>

            <h2>Accelerometer Data:</h2>
            <p>X: {gyroscopeData.x}</p>
            <p>Y: {gyroscopeData.y}</p>
            <p>Z: {gyroscopeData.z}</p>
            <p>Test: {testMessage}</p>
        </div>
        <div>
            <button  onClick={isRecording ? stopRecording : startRecording}>{!isRecording ? "Start Recording" : "Stop Recording"}</button >
        </div>
    </div>
  );
};

export default GyroscopeComponent;
