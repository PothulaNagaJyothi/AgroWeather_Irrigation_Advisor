require('dotenv').config();
const createApp = require('./app');
const { PORT = 4000 } = process.env;

const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AgroWeather backend listening on port ${PORT}`);
});
