const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/book', sessionController.bookSession);
router.get('/sessions', sessionController.listSessions);

module.exports = router;