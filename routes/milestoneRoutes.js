const express = require('express');
const { protect } = require('../middleware/auth');
const { getMilestones, markMilestoneAchieved, markMilestonePending } = require('../controllers/milestoneController');

const router = express.Router();

router.use(protect);

router.get('/', getMilestones);
router.patch('/:id/achieved', markMilestoneAchieved);
router.patch('/:id/pending', markMilestonePending);

module.exports = router;