const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const express = require('express');
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateBooking = require('../middlewares/validateBooking');

router.post('/book', authMiddleware, validateBooking, sessionController.bookSession);
router.get('/sessions', authMiddleware, sessionController.listSessions);

module.exports = router;