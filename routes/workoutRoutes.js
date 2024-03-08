const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

router.post('/get-advice', workoutController.getAdvice);

module.exports = router;
