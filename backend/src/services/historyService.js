const { getDb } = require('../utils/db');

async function listAll(userId) {
  const db = await getDb();
  const rows = await db.all(
    `SELECT h.id, h.farm_id, f.name as farm_name, f.location_name, f.crop_type, f.soil_type, f.field_size_ha, h.decision, h.reason, h.priority, h.created_at
     FROM irrigation_history h
     JOIN farm_details f ON f.id = h.farm_id
     WHERE f.user_id = ?
     ORDER BY h.created_at DESC`,
    [userId]
  );

  const { getCropCharacteristics, getSoilFactor } = require('./decisionService');

  // ... inside listAll ...
  return rows.map(r => {
    try {
      r.reason = JSON.parse(r.reason);
    } catch (e) {
      // Legacy handling
    }

    // Reconstruct static meta data
    const cropChar = getCropCharacteristics(r.crop_type || '');
    const soilChar = getSoilFactor(r.soil_type || '');

    r.meta = {
      cropDemand: cropChar.label,
      soilRetention: soilChar.label,
      // Weather data is lost for history, so remain 0/null which frontend handles
      avgTemp: 0,
      totalPrecip: 0
    };

    return r;
  });
}

module.exports = { listAll };
