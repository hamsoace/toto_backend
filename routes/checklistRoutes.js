const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  submitPPDChecklist, 
  submitPartnerChecklist, 
  getChecklistHistory,
  getPPDResources 
} = require('../controllers/checklistController');

const router = express.Router();

router.use(protect);

router.post('/ppd', submitPPDChecklist);
router.post('/partner', submitPartnerChecklist);
router.get('/history', getChecklistHistory);
router.get('/ppd-resources', getPPDResources);

module.exports = router;