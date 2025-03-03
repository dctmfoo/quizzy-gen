/**
 * Quiz Attempt routes
 */

const express = require('express');
const router = express.Router();
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/v1/quiz-attempts
 * @desc    Submit a quiz attempt
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { quizId, userName, userEmail, answers } = req.body;
    
    // Validate required fields
    if (!quizId || !answers || !answers.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required fields'
        }
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(quizId).populate('questions');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Quiz not found'
        }
      });
    }
    
    // Validate answers
    const validatedAnswers = await validateAnswers(answers, quiz.questions);
    
    // Calculate score
    const score = validatedAnswers.filter(answer => answer.isCorrect).length;
    
    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      quizId,
      userName,
      userEmail,
      answers: validatedAnswers,
      score,
      totalQuestions: quiz.questionCount,
      completedAt: new Date(),
      ipAddress: req.ip
    });
    
    await quizAttempt.save();
    
    // Prepare results
    const results = prepareResults(validatedAnswers, quiz.questions);
    
    res.status(201).json({
      success: true,
      data: {
        ...quizAttempt.toObject(),
        results
      }
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error submitting quiz attempt',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/quiz-attempts/:id
 * @desc    Get quiz attempt by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const quizAttempt = await QuizAttempt.findById(req.params.id)
      .populate('quizId', 'title description')
      .populate({
        path: 'answers.questionId',
        select: 'questionText options correctAnswer type assertion reason correctAnswerCode explanation'
      });
    
    if (!quizAttempt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Quiz attempt not found'
        }
      });
    }
    
    // Prepare results
    const results = prepareResults(quizAttempt.answers, quizAttempt.answers.map(a => a.questionId));
    
    res.json({
      success: true,
      data: {
        ...quizAttempt.toObject(),
        results
      }
    });
  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching quiz attempt',
        details: error.message
      }
    });
  }
});

/**
 * Helper function to validate answers
 * @param {Array} answers - Array of answer objects
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array of validated answer objects
 */
async function validateAnswers(answers, questions) {
  // Create a map of question IDs to questions for faster lookup
  const questionMap = {};
  questions.forEach(question => {
    questionMap[question._id.toString()] = question;
  });
  
  // Validate each answer
  return answers.map(answer => {
    const question = questionMap[answer.questionId.toString()];
    
    if (!question) {
      return {
        ...answer,
        isCorrect: false
      };
    }
    
    let isCorrect = false;
    
    if (question.type === 'standard') {
      isCorrect = answer.selectedAnswer === question.correctAnswer;
    } else if (question.type === 'assertion_reason') {
      isCorrect = answer.selectedAnswer === question.correctAnswerCode;
    }
    
    return {
      ...answer,
      isCorrect
    };
  });
}

/**
 * Helper function to prepare results
 * @param {Array} answers - Array of validated answer objects
 * @param {Array} questions - Array of question objects
 * @returns {Object} - Object with correctAnswers and incorrectAnswers
 */
function prepareResults(answers, questions) {
  // Create a map of question IDs to questions for faster lookup
  const questionMap = {};
  questions.forEach(question => {
    questionMap[question._id.toString()] = question;
  });
  
  // Separate correct and incorrect answers
  const correctAnswers = [];
  const incorrectAnswers = [];
  
  answers.forEach(answer => {
    const question = questionMap[answer.questionId.toString()];
    
    if (!question) {
      return;
    }
    
    const result = {
      questionId: question._id,
      questionText: question.questionText,
      selectedAnswer: answer.selectedAnswer,
      explanation: question.explanation
    };
    
    if (question.type === 'standard') {
      result.correctAnswer = question.correctAnswer;
      result.options = question.options;
    } else if (question.type === 'assertion_reason') {
      result.assertion = question.assertion;
      result.reason = question.reason;
      result.correctAnswerCode = question.correctAnswerCode;
      result.optionsCodes = question.optionsCodes;
    }
    
    if (answer.isCorrect) {
      correctAnswers.push(result);
    } else {
      incorrectAnswers.push(result);
    }
  });
  
  return {
    correctAnswers,
    incorrectAnswers
  };
}

module.exports = router; 