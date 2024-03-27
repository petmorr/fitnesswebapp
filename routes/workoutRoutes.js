const express = require('express');
const router = express.Router();
const { generateWorkoutPage, workoutPlan, workoutPlanPreview } = require('../controllers/workoutController');
const authenticateToken = require('../middleware/authMiddleware');

// Routes for Workout Page
router.get('/workout-plan', authenticateToken, generateWorkoutPage);
router.get('/api/workout-plan', authenticateToken, workoutPlan);
// router.get('/api/workout-preview', authenticateToken, workoutPlanPreview);

module.exports = router;