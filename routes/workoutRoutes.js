const express = require('express');
const router = express.Router();
const { workoutPlan } = require('../controllers/workoutController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/workout-plan', authenticateToken, workoutPlan);

module.exports = router;