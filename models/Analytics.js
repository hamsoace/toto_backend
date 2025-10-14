import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  event: { type: String, required: true }, // 'visit' | 'install'
  userId: { type: String },
  page: { type: String },
  device: { type: String },
  browser: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Analytics', analyticsSchema);
