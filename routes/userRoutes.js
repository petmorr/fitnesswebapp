const express = require('express');
const router = express.Router();
const { renderLandingPage, renderRegisterPage, renderLoginPage, register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Route to render the landing page
router.get('/', renderLandingPage);

// Routes for registration
router.get('/register', renderRegisterPage); // Render the registration page
router.post('/register', register); // Handle form submission
router.get('/registerSuccess', (req, res) => res.render('registerSuccess', { title: 'Registration Successful' }));

// Routes for login
router.get('/login', renderLoginPage); // Render the login page
router.post('/login', login); // Handle form submission

// Route to render the dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
    try {
        res.render('dashboard', { title: 'Dashboard' });
    } catch (error) {
        console.error("Dashboard error:", error);
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