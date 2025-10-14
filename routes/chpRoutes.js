const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  getNearbyCHPs,
  getCHPByWard,
  contactCHP,
  getAllCounties,
  getSubCounties,
  getWards
} = require('../controllers/chpController');

const router = express.Router();

router.use(protect);

router.get('/nearby', getNearbyCHPs);
router.get('/ward', getCHPByWard);
router.post('/:id/contact', contactCHP);
router.get('/counties', getAllCounties);
router.get('/subcounties/:county', getSubCounties);
router.get('/wards/:subCounty', getWards);

module.exports = router;