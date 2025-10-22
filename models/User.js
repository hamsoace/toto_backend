const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  profileType: {
    type: String,
    enum: ['mum', 'dad', 'partner'],
    required: true
  },
  language: {
    type: String,
    default: 'sw'
  },
  // ADD GAMIFICATION FIELDS HERE:
  gamification: {
    points: {
      type: Number,
      default: 0
    },
    badges: [{
      name: String,
      earnedAt: Date,
      description: String
    }],
    achievements: [{
      type: String,
      enum: ['first_login', 'profile_completed', 'first_checklist', 'baby_profile_added']
    }],
    lastLogin: Date,
    loginStreak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ADD THESE TWO CRITICAL LINES:
const User = mongoose.model('User', userSchema);
module.exports = User;