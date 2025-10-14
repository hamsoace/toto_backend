const mongoose = require('mongoose');

const chpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  ward: {
    type: String,
    required: true
  },
  subCounty: {
    type: String,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  healthUnit: String,
  languages: [String],
  specialties: [String],
  coverageArea: {
    gpsCoordinates: [String],
    villages: [String]
  },
  availability: {
    days: [String],
    hours: String,
    emergencyResponse: { type: Boolean, default: true }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'suspended'],
    default: 'pending'
  },
  dataSource: String,
  lastVerified: Date
}, {
  timestamps: true
});

// Index for location-based queries
chpSchema.index({ county: 1, subCounty: 1, ward: 1 });
chpSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('CHP', chpSchema);