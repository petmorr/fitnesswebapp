const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const express = require('express');
const workoutController = require('../controllers/workoutController');

// Route to create a new workout plan
router.post('/workout-plans', workoutController.createWorkoutPlan);

// Route to create a new workout plan
router.post('/workout-plans', workoutController.createWorkoutPlan);

// Error Handling: Implement comprehensive error handling within the controller functions to manage any issues during the OAuth process or data fetching.
router.use((err, req, res, next) => {
    // Handle errors here
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;