const express = require('express');
const axios = require('axios');
const router = express.Router();
const { renderLandingPage, renderRegisterPage, register, renderLoginPage, login, renderDashboardPage } = require('../controllers/authController');
const { renderWorkoutPlannerPage } = require('../controllers/workoutPlannerController');
const { verifyToken } = require('../public/js/authMiddleware');
const corsConfig = require('../config/cors');
require('dotenv').config(); // Load environment variables from .env file

router.use(corsConfig);

// Route to render the landing page
router.get('/', renderLandingPage);

// Routes for registration
router.get('/register', renderRegisterPage); // Render the registration page
router.post('/register', register); // Handle form submission

// Routes for login
router.get('/login', renderLoginPage); // Render the login page
router.post('/login', login); // Handle form submission

// Route to render the dashboard
router.get('/dashboard', verifyToken, renderDashboardPage);

// Route to render the workout planner
router.get('/workoutPlanner', verifyToken, renderWorkoutPlannerPage);

// Route to fetch workout logs
router.get('/workoutLogs', verifyToken, async (req, res) => {
    try {
        const token = process.env.PERMANENT_TOKEN; // Use the permanent token
        const headers = {
            Authorization: `Token ${token}` // Use the permanent token for authorization
        };
        const response = await axios.get('https://wger.de/api/v2/workoutlog/', {
            headers,
            params: req.query
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Error handling routes
router.use(function(req, res) {
    res.status(404).type('text/plain').send('404 Not found.');
});
router.use(function(err, req, res, next) {
    res.status(500).type('text/plain').send('Internal Server Error.');
});

module.exports = router;
