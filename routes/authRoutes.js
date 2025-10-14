const express = require('express');
const { initiateWhatsAppAuth, verifyWhatsAppCode } = require('../controllers/authController');

const router = express.Router();

router.post('/initiate', initiateWhatsAppAuth);
router.post('/verify', verifyWhatsAppCode);

module.exports = router;