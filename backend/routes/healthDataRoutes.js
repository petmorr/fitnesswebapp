const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../config/passport')(passport);
const { authorize, callback, fetchData } = require('../controllers/healthDataController');
const { encryptRequestBody } = require('../utils/encryptionUtil'); // Assumes encryption logic is moved to this utility

// OAuth authentication route middleware
router.use(passport.authenticate('oauth2', { session: false }));

// Routes
router.get('/authorize', authorize);
router.get('/callback', callback);
router.get('/fetch-data', passport.authenticate('oauth2', { session: false }), fetchData);

// Middleware for request body encryption
router.use(encryptRequestBody);

// Error handling middleware
router.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;