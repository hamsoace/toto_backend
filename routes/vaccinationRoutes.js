const express = require('express');
const { protect } = require('../middleware/auth');
const { getVaccinationSchedule, markVaccinationCompleted, markVaccinationPending } = require('../controllers/vaccinationController');

const router = express.Router();

router.use(protect);

router.get('/schedule', getVaccinationSchedule);
router.patch('/:id/complete', markVaccinationCompleted);
router.patch('/:id/pending', markVaccinationPending);

module.exports = router;