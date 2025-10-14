const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event: { type: String, required: true },
  userId: { type: String },
  page: { type: String },
  device: { type: String },
  browser: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
