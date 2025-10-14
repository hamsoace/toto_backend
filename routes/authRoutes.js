const express = require('express');
const { initiateWhatsAppAuth, verifyWhatsAppCode, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/initiate', initiateWhatsAppAuth);
router.post('/verify', verifyWhatsAppCode);
router.get('/verify-token', protect, verifyToken);

module.exports = router;