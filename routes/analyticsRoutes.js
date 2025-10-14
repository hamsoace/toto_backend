import express from 'express';
import { recordVisit, recordInstall } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/visit', recordVisit);
router.post('/install', recordInstall);

export default router;
