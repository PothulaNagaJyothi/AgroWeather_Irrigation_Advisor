const weatherService = require('../services/weatherService');

async function getForecast(req, res, next) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon query params required' });
    const data = await weatherService.getShortTermForecast(Number(lat), Number(lon));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getForecast };
