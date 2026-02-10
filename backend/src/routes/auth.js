const express = require('express');
const authController = require('../controllers/authController');
const { validateAuthInput } = require('../middlewares/validate');

const router = express.Router();

router.post('/signup', validateAuthInput, authController.signup);
router.post('/login', validateAuthInput, authController.login);

module.exports = router;
