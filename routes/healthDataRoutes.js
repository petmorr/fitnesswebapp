const express = require('express');
const router = express.Router();

// Include controllers for handling the OAuth flow and fetching data
router.get('/authorize', healthDataController.authorize);
router.get('/callback', healthDataController.callback);
router.get('/fetch-data', healthDataController.fetchData);

module.exports = router;
