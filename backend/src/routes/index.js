const express = require('express');
const authRouter = require('./auth');
const farmRouter = require('./farm');
const weatherRouter = require('./weather');
const historyRouter = require('./history');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/farm', farmRouter);
router.use('/weather', weatherRouter);
router.use('/history', historyRouter);

module.exports = router;
