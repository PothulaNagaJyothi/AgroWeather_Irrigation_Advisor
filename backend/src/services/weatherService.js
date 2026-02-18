const axios = require('axios');
const config = require('../config');
const { getDb } = require('../utils/db');

// Uses Open-Meteo free API (no secret required)
async function getShortTermForecast(lat, lon) {
  // Build params for 48h hourly precipitation and temperature
  const params = {
    latitude: lat,
    longitude: lon,
    hourly: 'temperature_2m,precipitation',
    forecast_days: 2,
    timezone: 'UTC'
  };

  const url = config.openMeteoUrl;
  try {
    console.log(`Fetching weather for ${lat}, ${lon}...`);
    const start = Date.now();
    const resp = await axios.get(url, { params, timeout: 5000 }); // 5s timeout
    console.log(`Weather fetch took ${Date.now() - start}ms`);

    // cache minimal payload
    const db = await getDb();
    db.run('INSERT INTO weather_data (lat, lon, data) VALUES (?, ?, ?)', [lat, lon, JSON.stringify(resp.data)]);

    return resp.data;
  } catch (error) {
    console.error('Weather API failed:', error.message);
    return null; // Return null so we can handle gracefully
  }
}

module.exports = { getShortTermForecast };
