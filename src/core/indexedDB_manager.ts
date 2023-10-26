import { DBSchema, openDB } from 'idb';

export type GyroscopeSample = {
    timestamp: number;
    yaw: number;
    pitch: number;
    roll: number;
    accelerometer: number;
}

// Define a schema for your database
interface GyroscopeDatabaseSchema extends DBSchema {
  gyroscopeData: {
    key: number; // This will be an auto-incrementing key
    value: {
        label: string;
        data: GyroscopeSample[]; // Array of [timestamp, alpha, beta, gamma]
    };
    indexes: { 'by-label': number };
  };
}

// Open the database
const dbPromise = openDB<GyroscopeDatabaseSchema>('gyroscope-data', 1, {
  upgrade(db) {
    // Create an object store for gyroscope data
    const gyroscopeDataStore = db.createObjectStore('gyroscopeData', { keyPath: 'key', autoIncrement: true });
    
    // Create an index for label
    gyroscopeDataStore.createIndex('by-label', 'label', { unique: false });
  },
});

export { dbPromise };
