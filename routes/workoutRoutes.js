const express = require('express');
const router = express.Router();
const { generateWorkoutPage, generateAndUpdateWorkoutPlan, workoutPlanPreview, saveWorkoutDays, submitWorkoutFeedback } = require('../controllers/workoutController');
const authenticateToken = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Configure rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Routes for Workout Page
router.get('/workout-plan', authenticateToken, generateWorkoutPage);
router.get('/api/workout-plan', authenticateToken, limiter, generateAndUpdateWorkoutPlan);

// Routes for saving user preferences and feedback on workouts
router.post('/api/saveWorkoutDays', authenticateToken, limiter, saveWorkoutDays);
router.post('/api/submitFeedback', authenticateToken, limiter, submitWorkoutFeedback);

module.exports = router;