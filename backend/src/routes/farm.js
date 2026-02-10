const express = require('express');
const farmController = require('../controllers/farmController');
const { validateFarmInput } = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, validateFarmInput, farmController.createAndDecide);
router.get('/:id', requireAuth, farmController.getFarm);

module.exports = router;
