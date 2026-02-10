const path = require('path');

module.exports = {
  dbFile: process.env.SQLITE_FILE || path.resolve(__dirname, '..', '..', 'database', 'agroweather.db'),
  openMeteoUrl: 'https://api.open-meteo.com/v1/forecast'
};
