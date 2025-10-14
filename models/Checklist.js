const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['ppd', 'partner'],
    required: true
  },
  scores: [{
    type: Number,
    min: 0,
    max: 3,
    required: true
  }],
  totalScore: {
    type: Number,
    required: true
  },
  // PPD Specific Fields
  riskLevel: {
    type: String,
    enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe']
  },
  recommendation: String,
  
  // Partner Checklist Specific Fields
  supportLevel: Number, // 0-1 scale
  feedback: String,
  encouragement: String,
  
  // Metadata
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
checklistSchema.index({ userId: 1, type: 1, completedAt: -1 });
checklistSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('Checklist', checklistSchema);