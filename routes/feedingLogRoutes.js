const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFeedingLog,
  getFeedingLogsForBaby,
  getFeedingLogById,
  updateFeedingLog,
  deleteFeedingLog,
} = require('../controllers/feedingLogController');

// All routes are protected
router.use(protect);

router.route('/').post(createFeedingLog);
router.route('/baby/:babyId').get(getFeedingLogsForBaby);
router.route('/:id').get(getFeedingLogById).put(updateFeedingLog).delete(deleteFeedingLog);

module.exports = router;
