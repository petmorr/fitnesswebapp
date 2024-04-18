const express = require('express');
const router = express.Router();
const { generateWorkoutPage, generateAndUpdateWorkoutPlan, workoutPlanPreview, saveWorkoutDays, submitWorkoutFeedback } = require('../controllers/workoutController');
const authenticateToken = require('../middleware/authMiddleware');

// Routes for Workout Page
router.get('/workout-plan', authenticateToken, generateWorkoutPage);
router.get('/api/workout-plan', authenticateToken, generateAndUpdateWorkoutPlan);
// router.get('/api/workout-preview', authenticateToken, workoutPlanPreview);
router.post('/api/saveWorkoutDays', authenticateToken, saveWorkoutDays);
router.post('/api/submitFeedback', authenticateToken, submitWorkoutFeedback);

module.exports = router;