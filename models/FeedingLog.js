const mongoose = require('mongoose');

const feedingLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  baby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baby',
    required: true,
  },
  type: {
    type: String,
    enum: ['breastfeeding', 'bottle'],
    required: [true, 'Feeding type is required.'],
  },
  time: {
    type: Date,
    required: [true, 'Time of feeding is required.'],
  },
  // Duration in minutes for breastfeeding
  duration: {
    type: Number,
    validate: {
      validator: function(v) {
        return this.type === 'bottle' || typeof v === 'number';
      },
      message: 'Duration is required for breastfeeding.'
    }
  },
  // Amount in milliliters for bottle feeding
  amount: {
    type: Number,
    validate: {
      validator: function(v) {
        return this.type === 'breastfeeding' || typeof v === 'number';
      },
      message: 'Amount is required for bottle feeding.'
    }
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const FeedingLog = mongoose.model('FeedingLog', feedingLogSchema);

module.exports = FeedingLog;
