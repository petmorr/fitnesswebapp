const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// Route to create a new workout plan
router.post('/workout-plans', workoutController.createWorkoutPlan);

module.exports = router;