/**
 * Question routes
 */

const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/v1/questions
 * @desc    Get questions with optional filtering by chapter
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { chapterId, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (chapterId) {
      query.chapterId = chapterId;
    }
    
    // Execute query with pagination
    const questions = await Question.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('chapterId', 'chapterNumber title');
    
    // Get total count for pagination
    const total = await Question.countDocuments(query);
    
    res.json({
      success: true,
      data: questions,
      pagination: {
        total,
        limit: parseInt(limit),
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching questions',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/questions/:id
 * @desc    Get question by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('chapterId', 'chapterNumber title');
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Question not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching question',
        details: error.message
      }
    });
  }
});

module.exports = router; 