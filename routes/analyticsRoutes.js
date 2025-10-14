import express from 'express';
import { recordVisit, getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/visit', recordVisit);
router.get('/', getAnalytics);

export default router;
