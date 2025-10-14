const express = require('express');
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;