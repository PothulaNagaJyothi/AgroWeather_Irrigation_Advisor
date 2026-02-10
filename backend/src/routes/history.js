const express = require('express');
const historyController = require('../controllers/historyController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, historyController.listHistory);

module.exports = router;
