import Dexie from 'dexie';

export const db = new Dexie('HealthyLivingDB');

// Define your "tables" and indexes
// '++id' means auto-incrementing primary key
db.version(1).stores({
  entries: '++id, food, calories, time, date',
  settings: 'key, value'
});