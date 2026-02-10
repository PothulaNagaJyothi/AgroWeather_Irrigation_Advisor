const { getDb } = require('../utils/db');
const weatherService = require('./weatherService');

async function createFarm(userId, input) {
  const db = await getDb();
  try {
    db.run(
      `INSERT INTO farm_details (user_id, name, location_name, location_lat, location_lon, crop_type, soil_type, field_size_ha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, input.name || '', input.location_name || '', input.location_lat, input.location_lon, input.crop_type, input.soil_type, input.field_size_ha]
    );
  } catch (e) {
    throw e;
  }
  const row = db.get('SELECT id FROM farm_details WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
  return getFarmById(row.id, userId);
}

async function getFarmById(id, userId) {
  const db = await getDb();
  return db.get('SELECT * FROM farm_details WHERE id = ? AND user_id = ?', [id, userId]);
}

async function fetchWeatherForFarm(farm) {
  return weatherService.getShortTermForecast(farm.location_lat, farm.location_lon);
}

async function saveIrrigationDecision(farmId, decision) {
  const db = await getDb();
  db.run('INSERT INTO irrigation_history (farm_id, decision, reason, priority) VALUES (?, ?, ?, ?)', [
    farmId,
    decision.decision,
    JSON.stringify(decision.reason),
    decision.priority
  ]);
}

module.exports = { createFarm, getFarmById, fetchWeatherForFarm, saveIrrigationDecision };
