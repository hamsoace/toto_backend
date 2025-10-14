// controllers/analyticsController.js
import Analytics from '../models/Analytics.js'; 
import asyncHandler from 'express-async-handler';

// Record a page visit
export const recordVisit = asyncHandler(async (req, res) => {
  const { userId, page, device, browser } = req.body;

  await Analytics.create({
    event: 'visit',
    userId: userId || null,
    page,
    device,
    browser,
    timestamp: new Date()
  });

  res.status(200).json({ success: true, message: 'Visit recorded' });
});

// Record a PWA install
export const recordInstall = asyncHandler(async (req, res) => {
  const { userId, device, browser } = req.body;

  await Analytics.create({
    event: 'install',
    userId: userId || null,
    device,
    browser,
    timestamp: new Date()
  });

  res.status(200).json({ success: true, message: 'Install recorded' });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.find().sort({ timestamp: -1 });
  res.status(200).json({ success: true, data: analytics });
});
