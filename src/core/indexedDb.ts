import { DBSchema, openDB } from 'idb';

export type GyroscopeSample = {
    timestamp: number;
    yaw: number;
    pitch: number;
    roll: number;
}

export type MotionSample = {
    timestamp: number;
    x: number;
    y: number;
    z: number;
}


export type Activity = {
    label: string;
    gyroscope_data: GyroscopeSample[]; // Array of [timestamp, alpha, beta, gamma]
    motion_data: MotionSample[]; // Array of [timestamp, alpha, beta, gamma]
};

// Define a schema for your database
interface ActivityDatabaseSchema extends DBSchema {
    activityData: {
      key: number; // This will be an auto-incrementing key
      value: Activity;
      indexes: { 'by-label': number };
    };
  }

const TABLE = 'activityData';

class IndexedDb {
    private database: string;
    private db: any;

    constructor() {
        this.database = 'activity-data';
    }

    public async createObjectStore() {
        try {
            this.db = await openDB<ActivityDatabaseSchema>(this.database, 1, {
                upgrade(db) {
                    //db.createObjectStore(tableName, { autoIncrement: true, keyPath: 'id' });
                    const activityDataStore = db.createObjectStore(TABLE, { keyPath: 'key', autoIncrement: true });
    
                    // Create an index for label
                    activityDataStore.createIndex('by-label', 'label', { unique: false });
                },
            });
        } catch (error) {
            return false;
        }
    }

    public async getValue(id: number) {
        const tx = this.db.transaction(TABLE, 'readonly');
        const store = tx.objectStore(TABLE);
        const result = await store.get(id);
        console.log('Get Data ', JSON.stringify(result));
        return result;
    }

    public async getAllValue() {
        const tx = this.db.transaction(TABLE, 'readonly');
        const store = tx.objectStore(TABLE);
        const result = await store.getAll();
        //console.log('Get All Data', JSON.stringify(result));
        return result;
    }

    public async putValue(value: Activity) {
        const tx = this.db.transaction(TABLE, 'readwrite');
        const store = tx.objectStore(TABLE);
        const result = await store.put(value);
        console.log('Put Data ', JSON.stringify(result));
        return result;
    }

    /* public async putBulkValue(values: Activity[]) {
        const tx = this.db.transaction(TABLE, 'readwrite');
        const store = tx.objectStore(TABLE);
        for (const value of values) {
            const result = await store.put(value);
            console.log('Put Bulk Data ', JSON.stringify(result));
        }
        //return this.getAllValue(TABLE);
    } */

    public async deleteValue(id: number) {
        const tx = this.db.transaction(TABLE, 'readwrite');
        const store = tx.objectStore(TABLE);
        const result = await store.get(id);
        if (!result) {
            console.log('Id not found', id);
            return result;
        }
        await store.delete(id);
        console.log('Deleted Data', id);
        return id;
    }

    public async deleteAllValue() {
        const tx = this.db.transaction(TABLE, 'readwrite');
        const store = tx.objectStore(TABLE);
        await store.clear();
    }
}

export default IndexedDb;