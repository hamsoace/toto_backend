const express = require('express');
const { recordVisit, recordInstall, getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/visit', recordVisit);
router.post('/install', recordInstall);
router.get('/', getAnalytics);

module.exports = router;
