const mongoose = require('mongoose');

const babySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  vaccinations: [{
    name: String,
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedDate: Date,
    notes: String
  }],
  milestones: [{
    category: String,
    title: String,
    description: String,
    typicalAge: String,
    achieved: { type: Boolean, default: false },
    achievedDate: Date,
    notes: String
  }],
  growthRecords: [{
    date: Date,
    weight: Number,
    height: Number,
    headCircumference: Number,
    notes: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Baby', babySchema);