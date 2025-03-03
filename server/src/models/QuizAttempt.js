/**
 * QuizAttempt model
 */

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userName: {
    type: String,
    trim: true
  },
  userEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  ipAddress: {
    type: String
  }
});

// Create index on quizId for faster queries
quizAttemptSchema.index({ quizId: 1 });

// Create compound index on quizId and completedAt for faster analytics queries
quizAttemptSchema.index({ quizId: 1, completedAt: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema); 