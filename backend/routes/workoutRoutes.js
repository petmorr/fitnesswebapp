const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// Route to create a new workout plan
router.post('/workout-plans', workoutController.createWorkoutPlan);

// Error Handling Middleware
router.use((err, req, res, next) => {
    if (err) {
        console.error(err); // Log the error for debugging purposes.
        const status = err.status || 500;
        const message = err.message || 'Internal Server Error';
        res.status(status).json({ error: message });
    } else {
        next();
    }
});

module.exports = router;