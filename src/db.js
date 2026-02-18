import Dexie from 'dexie';

export const db = new Dexie('MacroTrackerDB');

// Define your "tables" and indexes
// '++id' means auto-incrementing primary key
db.version(1).stores({
  entries: '++id, food, calories, protein, time, date',
  settings: 'key, value'
});