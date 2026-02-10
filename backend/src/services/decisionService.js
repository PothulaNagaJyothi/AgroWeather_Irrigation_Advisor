/*
  Decision engine: rule-based, explainable.
  Inputs: { farm, weather }
*/

function sumForecastRain(weather) {
  try {
    const precip = weather.hourly.precipitation || [];
    // Sum first 48 hours (assuming hourly data)
    return precip.slice(0, 48).reduce((s, v) => s + (v || 0), 0);
  } catch (e) {
    return 0;
  }
}

function getCropCharacteristics(crop) {
  const c = crop.toLowerCase();
  // Daily water requirement in mm (approximate averages)
  const characteristics = {
    rice: { demand: 8, label: 'High' },
    sugarcane: { demand: 8, label: 'High' },
    banana: { demand: 7, label: 'High' },
    maize: { demand: 6, label: 'Medium' },
    soy: { demand: 5, label: 'Medium' },
    wheat: { demand: 4, label: 'Medium' },
    potato: { demand: 4, label: 'Medium' },
    default: { demand: 5, label: 'Medium' }
  };
  return characteristics[c] || characteristics.default;
}

function getSoilFactor(soil) {
  // Factor > 1 means needs MORE water (poor retention)
  // Factor < 1 means needs LESS water (good retention)
  const map = {
    sandy: { factor: 1.2, label: 'Low Retention' }, // Drains fast
    loamy: { factor: 1.0, label: 'Balanced' },
    clay: { factor: 0.8, label: 'High Retention' } // Holds water
  };
  return map[soil.toLowerCase()] || { factor: 1.0, label: 'Standard' };
}

function decide({ farm, weather }) {
  const totalPrecip = sumForecastRain(weather); // mm over next 48h
  const temps = weather.hourly.temperature_2m || [];
  // Avg temp over next 24h
  const avgTemp = temps.slice(0, 24).length ? temps.slice(0, 24).reduce((s, v) => s + v, 0) / temps.slice(0, 24).length : 25;

  const cropChar = getCropCharacteristics(farm.crop_type);
  const soilChar = getSoilFactor(farm.soil_type);

  // Irrigation logic
  const daysToForecast = 2;
  const grossWaterNeed = cropChar.demand * daysToForecast * soilChar.factor; // mm needed in 48h
  const netWaterDeficit = grossWaterNeed - totalPrecip; // mm deficiency

  // Thresholds
  const precipThresholdPostpone = 5.0; // If rain > 5mm, generally postpone unless deficit is huge
  const highHeatThreshold = 30; // degrees C

  let decision = 'monitor';
  let reason = [];
  let priority = 'low';
  let quantityLiters = 0;

  // Decision Tree
  if (totalPrecip >= precipThresholdPostpone) {
    decision = 'postpone';
    reason.push(`Significant rainfall forecast (${totalPrecip.toFixed(1)}mm) for next 48h.`);
    reason.push(`Nature will water your crops. Save your resources.`);
    priority = 'low';
  } else if (netWaterDeficit > 0) {
    // Water is needed
    decision = 'start';

    // Calculate Quantity
    // 1 mm on 1 ha = 10,000 Liters
    quantityLiters = Math.round(netWaterDeficit * farm.field_size_ha * 10000);

    // Reasons
    reason.push(`Forecast rain (${totalPrecip.toFixed(1)}mm) is insufficient for ${farm.crop_type}.`);
    if (avgTemp > highHeatThreshold) {
      reason.push(`High average temperature (${avgTemp.toFixed(1)}°C) increases evaporation.`);
      priority = 'high';
    } else {
      reason.push(`Soil moisture assumed low for ${farm.soil_type} soil.`);
    }

    // Adjust priority based on deficit magnitude
    if (netWaterDeficit > 10) priority = 'high';
    else if (netWaterDeficit > 5) priority = 'medium';
    else priority = 'low';

  } else {
    // Deficit <= 0 (Rain is sufficient or demand is low)
    decision = 'monitor';
    reason.push(`Forecast rain (${totalPrecip.toFixed(1)}mm) meets the estimated crop demand.`);
    reason.push(`Soil moisture levels should be adequate.`);
  }

  // Formatting Quantity
  let quantityString = 'Not needed';
  if (decision === 'start') {
    if (quantityLiters > 1000000) {
      quantityString = `${(quantityLiters / 1000000).toFixed(2)} Million Liters`;
    } else {
      quantityString = `${quantityLiters.toLocaleString()} Liters`;
    }
  }

  return {
    decision,
    reason,
    priority,
    quantity: {
      liters: quantityLiters,
      formatted: quantityString,
      deficit_mm: Math.max(0, netWaterDeficit)
    },
    meta: {
      totalPrecip,
      avgTemp,
      cropDemand: cropChar.label,
      soilRetention: soilChar.label
    }
  };
}

module.exports = { decide, getCropCharacteristics, getSoilFactor };
