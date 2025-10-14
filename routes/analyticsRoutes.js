import express from 'express';
import { recordVisit, getAnalytics, recordInstall } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/visit', recordVisit);
router.get('/', getAnalytics);
router.post('/install', recordInstall);


export default router;
