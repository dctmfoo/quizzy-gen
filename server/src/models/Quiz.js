/**
 * Quiz model
 */

const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  questionCount: {
    type: Number,
    required: true,
    min: 1
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  shareableLink: {
    type: String,
    unique: true,
    default: () => nanoid(10)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Create index on shareableLink for faster queries
quizSchema.index({ shareableLink: 1 }, { unique: true });

module.exports = mongoose.model('Quiz', quizSchema); 