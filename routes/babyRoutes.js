const express = require('express');
const { protect } = require('../middleware/auth');
const { createBaby, getBaby, updateBaby } = require('../controllers/babyController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBaby)
  .post(createBaby)
  .patch(updateBaby);

module.exports = router;