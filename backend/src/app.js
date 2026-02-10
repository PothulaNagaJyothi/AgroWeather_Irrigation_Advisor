const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', routes);

  // centralized error handler
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
