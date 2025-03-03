/**
 * Chapter routes
 */

const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/v1/chapters
 * @desc    Get all chapters
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const chapters = await Chapter.find().sort({ chapterNumber: 1 });
    
    res.json({
      success: true,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching chapters',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/chapters/:id
 * @desc    Get chapter by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chapter not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: chapter
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching chapter',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/chapters/:id/questions
 * @desc    Get questions for a chapter
 * @access  Private
 */
router.get('/:id/questions', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chapter not found'
        }
      });
    }
    
    // This route will be implemented in the questions controller
    // Redirecting to the questions route with chapterId query parameter
    res.redirect(`/api/v1/questions?chapterId=${chapter._id}`);
  } catch (error) {
    console.error('Error fetching chapter questions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching chapter questions',
        details: error.message
      }
    });
  }
});

module.exports = router; 