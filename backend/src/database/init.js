const fs = require('fs');
const path = require('path');
const { getDb } = require('../utils/db');

const migrate = async () => {
  const db = await getDb();

  // users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // farm_details table with location_name
  db.run(
    `CREATE TABLE IF NOT EXISTS farm_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT,
      location_name TEXT,
      location_lat REAL NOT NULL,
      location_lon REAL NOT NULL,
      crop_type TEXT NOT NULL,
      soil_type TEXT NOT NULL,
      field_size_ha REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`
  );

  // weather_data table (cached forecasts)
  db.run(
    `CREATE TABLE IF NOT EXISTS weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      data TEXT NOT NULL
    );`
  );

  // irrigation_history table
  db.run(
    `CREATE TABLE IF NOT EXISTS irrigation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farm_id INTEGER NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(farm_id) REFERENCES farm_details(id) ON DELETE CASCADE
    );`
  );

  console.log('Database migrated / initialized at', path.resolve(require('../config').dbFile));
};

(async () => { try { await migrate(); } catch (e) { console.error(e); process.exit(1); } })();
