/**
 * Question model
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['standard', 'assertion_reason']
  },
  questionText: {
    type: String,
    required: true
  },
  options: [String],
  correctAnswer: String,
  assertion: String,
  reason: String,
  optionsCodes: [String],
  correctAnswerCode: String,
  explanation: {
    type: String,
    required: true
  },
  reference: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index on chapterId for faster queries
questionSchema.index({ chapterId: 1 });

// Update the updatedAt field before saving
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema); 