/**
 * Quiz routes
 */

const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/v1/quizzes/available-counts
 * @desc    Get available question counts for selected chapters
 * @access  Private
 */
router.get('/available-counts', auth, async (req, res) => {
  try {
    const { chapters } = req.query;
    
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Please select at least one chapter'
        }
      });
    }

    // Count questions by type directly from the Question model
    const [standardCount, assertionReasonCount] = await Promise.all([
      Question.countDocuments({ 
        chapterId: { $in: chapters },
        type: 'standard'
      }),
      Question.countDocuments({ 
        chapterId: { $in: chapters },
        type: 'assertion_reason'
      })
    ]);

    res.json({
      success: true,
      data: {
        standardCount,
        assertionReasonCount
      }
    });
  } catch (error) {
    console.error('Error getting available question counts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error getting available question counts',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/quizzes
 * @desc    Get all quizzes
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('chapters', 'chapterNumber title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching quizzes',
        details: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/quizzes
 * @desc    Create a new quiz
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, chapters, standardCount, assertionReasonCount } = req.body;
    
    // Validate required fields
    if (!title || !chapters || !chapters.length || (standardCount === undefined && assertionReasonCount === undefined)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required fields'
        }
      });
    }

    const totalQuestionCount = (standardCount || 0) + (assertionReasonCount || 0);
    if (totalQuestionCount < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Total number of questions must be at least 1'
        }
      });
    }
    
    // Get random questions from selected chapters
    const questions = await getRandomQuestions(chapters, standardCount, assertionReasonCount);
    
    if (!questions || questions.length < totalQuestionCount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Not enough questions available. Requested ${totalQuestionCount} (${standardCount} standard, ${assertionReasonCount} assertion-reason), but only found ${questions ? questions.length : 0}.`
        }
      });
    }
    
    // Count assertion-reason questions for logging
    const actualAssertionReasonCount = questions.filter(q => q.type === 'assertion_reason').length;
    const actualStandardCount = questions.length - actualAssertionReasonCount;
    console.log(`Quiz created with ${actualStandardCount} standard questions and ${actualAssertionReasonCount} assertion-reason questions`);
    
    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      chapters,
      questionCount: totalQuestionCount,
      questions: questions.map(q => q._id)
    });
    
    // Generate shareable link
    quiz.shareableLink = generateShareableLink();
    
    await quiz.save();
    
    // Populate questions for response
    await quiz.populate('questions');
    await quiz.populate('chapters');
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error creating quiz',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/quizzes/link/:shareableLink
 * @desc    Get quiz by shareable link
 * @access  Private
 */
router.get('/link/:shareableLink', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareableLink: req.params.shareableLink })
      .populate('chapters', 'chapterNumber title')
      .populate('questions');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Quiz not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz by link:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching quiz',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/quizzes/:id
 * @desc    Get quiz by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('chapters', 'chapterNumber title')
      .populate('questions');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Quiz not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching quiz',
        details: error.message
      }
    });
  }
});

/**
 * Generate a random shareable link
 * @returns {String} - Random string for shareable link
 */
function generateShareableLink() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 10;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Get random questions from selected chapters
 * @param {Array} chapters - Array of chapter IDs
 * @param {Number} standardCount - Number of standard questions to return
 * @param {Number} assertionReasonCount - Number of assertion-reason questions to return
 * @returns {Array} - Array of question objects
 */
async function getRandomQuestions(chapters, standardCount = 0, assertionReasonCount = 0) {
  try {
    // Get all questions from selected chapters
    const allQuestions = await Question.find({ chapterId: { $in: chapters } });
    
    // Separate questions by type
    const assertionReasonQuestions = allQuestions.filter(q => q.type === 'assertion_reason');
    const standardQuestions = allQuestions.filter(q => q.type !== 'assertion_reason');
    
    console.log(`Found ${standardQuestions.length} standard questions and ${assertionReasonQuestions.length} assertion-reason questions`);
    
    // Check if we have enough questions of each type
    if (standardQuestions.length < standardCount) {
      console.log(`Not enough standard questions. Requested ${standardCount}, found ${standardQuestions.length}`);
      return null;
    }
    
    if (assertionReasonQuestions.length < assertionReasonCount) {
      console.log(`Not enough assertion-reason questions. Requested ${assertionReasonCount}, found ${assertionReasonQuestions.length}`);
      return null;
    }
    
    // Shuffle both arrays using Fisher-Yates algorithm
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    const shuffledStandard = shuffleArray([...standardQuestions]);
    const shuffledAssertionReason = shuffleArray([...assertionReasonQuestions]);
    
    // Take the required number of each type
    const selectedStandard = shuffledStandard.slice(0, standardCount);
    const selectedAssertionReason = shuffledAssertionReason.slice(0, assertionReasonCount);
    
    // Place standard questions first, followed by assertion-reason questions
    const orderedQuestions = [...selectedStandard, ...selectedAssertionReason];
    
    console.log(`Final quiz composition: ${selectedStandard.length} standard and ${selectedAssertionReason.length} assertion-reason questions`);
    
    return orderedQuestions;
  } catch (error) {
    console.error('Error in getRandomQuestions:', error);
    return null;
  }
}

module.exports = router; 