const express = require('express');
const router = express.Router();
const { renderLandingPage, renderRegisterPage, register, renderLoginPage, login, renderDashboardPage, logout, currentUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Route to render the landing page
router.get('/', renderLandingPage);

// Routes for registration
router.get('/register', renderRegisterPage); // Render the registration page
router.post('/api/register', register); // Handle form submission

// Routes for login
router.get('/login', renderLoginPage); // Render the login page
router.post('/api/login', login); // Handle form submission

// Route to get the current userId
router.get('/api/current-user', authenticateToken, currentUser);

// Route to logout
router.get('/logout', authenticateToken, logout);

// Route to render the dashboard
router.get('/dashboard', authenticateToken, renderDashboardPage);

module.exports = router;