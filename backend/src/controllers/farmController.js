const farmService = require('../services/farmService');
const decisionService = require('../services/decisionService');

async function createAndDecide(req, res, next) {
  try {
    const input = req.body;
    const userId = req.userId;

    const farm = await farmService.createFarm(userId, input);

    const weather = await farmService.fetchWeatherForFarm(farm);

    const decision = decisionService.decide({ farm, weather });

    await farmService.saveIrrigationDecision(farm.id, decision);

    res.json({ farm, decision });
  } catch (err) {
    next(err);
  }
}

async function getFarm(req, res, next) {
  try {
    const id = Number(req.params.id);
    const userId = req.userId;

    const farm = await farmService.getFarmById(id, userId);
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    res.json({ farm });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAndDecide, getFarm };
