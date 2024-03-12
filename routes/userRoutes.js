const express = require('express');
const router = express.Router();
const { renderLandingPage, renderRegisterPage, register, renderRegisterSuccess, renderLoginPage, login, renderLoginSuccess, renderDashboardPage } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Route to render the landing page
router.get('/', renderLandingPage);

// Routes for registration
router.get('/register', renderRegisterPage); // Render the registration page
router.post('/register', register); // Handle form submission
router.get('/registerSuccess', renderRegisterSuccess); // Render the registration success page

// Routes for login
router.get('/login', renderLoginPage); // Render the login page
router.post('/login', login); // Handle form submission
router.get('/loginSuccess', renderLoginSuccess); // Render the login success page

// Route to render the dashboard
router.get('/dashboard', authMiddleware, renderDashboardPage);

// Error handling routes
router.use(function(req, res) {
    res.status(404).type('text/plain').send('404 Not found.');
});
router.use(function(err, req, res, next) {
    res.status(500).type('text/plain').send('Internal Server Error.');
});

module.exports = router;