const express = require('express');
const router = express.Router();
const { landingPage, register, login } = require('../controllers/authController');

router.get('/', landingPage);
router.post('/register', register);
router.post('/login', login);

module.exports = router;