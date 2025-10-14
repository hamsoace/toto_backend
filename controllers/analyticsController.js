const asyncHandler = require('express-async-handler');
const Analytics = require('../models/Analytics');

// Record a page visit
const recordVisit = asyncHandler(async (req, res) => {
  const { userId, page, device, browser } = req.body;
  await Analytics.create({ event: 'visit', userId, page, device, browser, timestamp: new Date() });
  res.status(200).json({ success: true, message: 'Visit recorded' });
});

// Record a PWA install
const recordInstall = asyncHandler(async (req, res) => {
  const { userId, device, browser } = req.body;
  await Analytics.create({ event: 'install', userId, device, browser, timestamp: new Date() });
  res.status(200).json({ success: true, message: 'Install recorded' });
});

// Get analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.find().sort({ timestamp: -1 });
  res.status(200).json({ success: true, data: analytics });
});

module.exports = { recordVisit, recordInstall, getAnalytics };
