const express = require('express');
const router = express.Router();
const { renderLandingPage, renderRegisterPage, renderLoginPage, register, login } = require('../controllers/authController');

// Route to render the landing page
router.get('/', renderLandingPage);

// Routes for registration
router.get('/register', renderRegisterPage); // Render the registration page
router.post('/register', register); // Handle form submission

// Routes for login
router.get('/login', renderLoginPage); // Render the login page
router.post('/login', login); // Handle form submission

// Error handling routes
router.use(function(req, res) {
    res.status(404).type('text/plain').send('404 Not found.');
});
router.use(function(err, req, res, next) {
    res.status(500).type('text/plain').send('Internal Server Error.');
});

module.exports = router;