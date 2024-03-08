const express = require('express');
const router = express.Router();

const passport = require('passport');
require('./config/passport')(passport);

// Include controllers for handling the OAuth flow and fetching data
router.get('/authorize', healthDataController.authorize);
router.get('/callback', healthDataController.callback);
router.get('/fetch-data', healthDataController.fetchData);

// Secure OAuth process and validate tokens
// OAuth authentication route middleware
router.use(passport.authenticate('oauth2', { session: false }));

// Error Handling
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' });
});

const crypto = require('crypto');

function encryptData(data) {
    // Generate a 32-byte (256-bit) encryption key for AES-256
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    // Generate a 16-byte (128-bit) initialization vector
    const iv = crypto.randomBytes(16).toString('hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

router.use((req, res, next) => {
    if(req.body && Object.keys(req.body).length !== 0) {
        req.body = encryptData(JSON.stringify(req.body));
    }
    next();
});

module.exports = router;