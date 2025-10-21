const FeedingLog = require('../models/FeedingLog');

// Create a new feeding log
exports.createFeedingLog = async (req, res) => {
  try {
    const feedingLog = new FeedingLog(req.body);
    await feedingLog.save();
    res.status(201).json({ success: true, data: feedingLog });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all feeding logs for a specific baby
exports.getFeedingLogsForBaby = async (req, res) => {
  try {
    const feedingLogs = await FeedingLog.find({ baby: req.params.babyId });
    res.status(200).json({ success: true, data: feedingLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single feeding log by ID
exports.getFeedingLogById = async (req, res) => {
  try {
    const feedingLog = await FeedingLog.findById(req.params.id);
    if (!feedingLog) {
      return res.status(404).json({ success: false, error: 'Feeding log not found' });
    }
    res.status(200).json({ success: true, data: feedingLog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a feeding log
exports.updateFeedingLog = async (req, res) => {
  try {
    const feedingLog = await FeedingLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!feedingLog) {
      return res.status(404).json({ success: false, error: 'Feeding log not found' });
    }
    res.status(200).json({ success: true, data: feedingLog });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a feeding log
exports.deleteFeedingLog = async (req, res) => {
  try {
    const feedingLog = await FeedingLog.findByIdAndDelete(req.params.id);
    if (!feedingLog) {
      return res.status(404).json({ success: false, error: 'Feeding log not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
