/**
 * Chapter model
 */

const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    default: 'Science',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index on chapterNumber for faster queries
chapterSchema.index({ chapterNumber: 1 });

// Update the updatedAt field before saving
chapterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting the total number of questions
chapterSchema.virtual('questionCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'chapterId',
  count: true
});

module.exports = mongoose.model('Chapter', chapterSchema); 