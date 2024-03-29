// src/GyroscopeComponent.tsx

import React, { useEffect, useState } from 'react';

//import { GyroscopeSample, MotionSample, Activity } from '../core/indexedDb';

import { createGyroSparkplugPayload, createMotionSparkplugPayload } from '../core/create_sparkplug_payload'

//import IndexedDb from '../core/indexedDb';

import { CallbackFunctionType, connectToBroker, publishData } from '../core/mqtt_manager';

//These are the default activities, can expand later either via hardcode or interface
const ACTIVITY_LIST = ["upstair", "downstair", "sitting", "walking"]

/* const RECORDING_ACTION = {
  start: 'startRecording',
  stop: 'stopRecording',
  saving: 'savingRecording'
} */

const GyroscopeComponent: React.FC = () => {
  //The label for the activity in recording, can be switch using a drop-down list
  const [activity, setActivity] = useState(ACTIVITY_LIST[0]);

  //Store the current sample
  const [isRecording, setRecordingState] = useState(false);

  //Address of the central server to store all data, currently use REST_API, can be switched/expanded to MQTT later
  const [serverAddress, setServerAddress] = useState("v8517e16.ala.us-east-1.emqxsl.com");

  //For testing purpose only
  const [testMessage, setTestMessage] = useState("");

  const [predictedActivity, setPredictedActivity] = useState("");

  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  //For displaying the data on the screen
  const [gyroscopeData, setGyroscopeData] = useState({
    timestamp: Date.now(),
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const [motionData, setMotionData] = useState({
    timestamp: Date.now(),
    x: 0,
    y: 0,
    z: 0,
  });

  const displayMessage: CallbackFunctionType = (message: string) => {
    console.log("message ", message)
    setTestMessage(message)
  };

  //Webpage initiation
  useEffect(() => {

    //Database initiation
/*     const runIndexDb = async () => {
        const indexedDb = new IndexedDb();
        await indexedDb.createObjectStore();
    }
    runIndexDb(); */

    connectToBroker(serverAddress, displayMessage, mqttMessageCallback, false)

    //Since iOS 12.2, Apple requires permission to access device orientation and motion data
    if (typeof DeviceOrientationEvent !== 'undefined') {
      const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
      if (typeof requestPermissionFn === 'function') {
        requestPermissionFn()
          .then((permissionState: PermissionState) => {
            if (permissionState === 'granted') {
              setIsPermissionGranted(true);
              window.addEventListener('deviceorientation', handleOrientation);
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        setIsPermissionGranted(true);
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleMotion);
      }
      
    }
    else {
      console.log('Device orientation not supported.');
      
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);

    };
  }, [isRecording, predictedActivity]);

  const handleOrientation = (event: DeviceOrientationEvent ) => {
    const val = {
        timestamp: Date.now(),
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
    } 
    setGyroscopeData(val);

    if (isRecording) {
      // Add the gyroscope data to the list
      publishData('gyroscope', createGyroSparkplugPayload(val, activity));
    }
  };
  const handleMotion = (event: DeviceMotionEvent) => {
    const val = {
        timestamp: Date.now(),
        x: event.accelerationIncludingGravity?.x || 0,
        y: event.accelerationIncludingGravity?.y || 0,
        z: event.accelerationIncludingGravity?.z || 0,
    } 
    setMotionData(val);

    if (isRecording) {
      // Add the gyroscope data to the list
      publishData('motion', createMotionSparkplugPayload(val, activity));
    }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity(e.target.value as string);
  };
  
  const startStopRecording = () => {
    setRecordingState(prev => !prev)
    setPredictedActivity("")
  };

  function connectToMqtt() {
    if (serverAddress) {
      connectToBroker(serverAddress, displayMessage, mqttMessageCallback, true)
    }
  }

  function mqttMessageCallback(message: any) {
    if (JSON.stringify(message.payloadString) !== predictedActivity) {
      if(isRecording) {
        setPredictedActivity(JSON.stringify(message.payloadString))
      }
      
    }
  }

/*   const handleClearData = async () => {
    const indexedDb = new IndexedDb();
    await indexedDb.createObjectStore();
    await indexedDb.deleteAllValue();
    console.log("DONE")
  } */

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
                <button  onClick={connectToMqtt}> Connect to MQTT </button >
            </div>
            <p>MQTT Status: {testMessage}</p>
            {/*<div>
                Clear Data: <button  onClick={handleClearData}> Clear </button >
  </div>*/}
            
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
            <p>Yaw: {gyroscopeData.alpha}</p>
            <p>Pitch: {gyroscopeData.beta}</p>
            <p>Roll: {gyroscopeData.gamma}</p>

            <h2>Accelerometer Data:</h2>
            <p>X: {motionData.x}</p>
            <p>Y: {motionData.y}</p>
            <p>Z: {motionData.z}</p>
            <p>Predicted Activity: {predictedActivity}</p>
        </div>
        <div>
            <button  onClick={startStopRecording}>{!isRecording ? "Start Recording" : "Stop Recording"}</button >
        </div>
    </div>
  );
};

export default GyroscopeComponent;
