const Joi = require('joi');

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const farmSchema = Joi.object({
  name: Joi.string().optional().allow(''),
  location_name: Joi.string().optional().allow(''),
  location_lat: Joi.number().required(),
  location_lon: Joi.number().required(),
  crop_type: Joi.string().required(),
  soil_type: Joi.string().valid('sandy','loamy','clay').required(),
  field_size_ha: Joi.number().min(0.01).required()
});

const validateAuthInput = (req, res, next) => {
  const { error } = authSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  return next();
};

const validateFarmInput = (req, res, next) => {
  const { error } = farmSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  return next();
};

module.exports = { validateAuthInput, validateFarmInput };
