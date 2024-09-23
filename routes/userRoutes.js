const express = require('express');
const router = express.Router();
const { renderLandingPage, renderRegisterPage, register, renderLoginPage, login, renderDashboardPage, logout, currentUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiter for login route: maximum of 5 requests per minute
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts from this IP, please try again after a minute"
});

// Route to render the landing page
router.get('/', renderLandingPage);

// Routes for registration
router.get('/register', renderRegisterPage); // Render the registration page
router.post('/api/register', register); // Handle form submission

// Routes for login
router.get('/login', renderLoginPage); // Render the login page
router.post('/api/login', loginLimiter, login); // Handle form submission with rate limiting

// Route to get the current userId
router.get('/api/current-user', authenticateToken, currentUser);

// Route to logout
router.get('/logout', authenticateToken, logout);

// Route to render the dashboard
router.get('/dashboard', authenticateToken, renderDashboardPage);

module.exports = router;