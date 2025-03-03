/**
 * Admin routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/v1/admin/register
 * @desc    Register a new admin
 * @access  Private (super_admin only)
 */
router.post('/register', auth, async (req, res) => {
  try {
    // Check if user is super_admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only super admins can register new admins'
        }
      });
    }
    
    const { username, email, password, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required fields'
        }
      });
    }
    
    // Check if admin already exists
    let admin = await Admin.findOne({ $or: [{ email }, { username }] });
    
    if (admin) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Admin already exists'
        }
      });
    }
    
    // Create new admin
    admin = new Admin({
      username,
      email,
      passwordHash: password,
      role: role || 'admin'
    });
    
    await admin.save();
    
    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.passwordHash;
    
    res.status(201).json({
      success: true,
      data: adminResponse
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error registering admin',
        details: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/admin/login
 * @desc    Login admin
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for username:', req.body.username);
    
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing required fields'
        }
      });
    }
    
    // Check if admin exists
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      console.log('Admin not found with username:', username);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      });
    }
    
    console.log('Admin found:', admin.username);
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      });
    }
    
    console.log('Password matched successfully');
    
    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();
    
    // Create token
    console.log('Creating JWT token with payload:', { id: admin._id, role: admin.role });
    console.log('Using JWT_SECRET:', process.env.JWT_SECRET ? 'Secret is set' : 'Secret is NOT set');
    console.log('Using JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
    
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log('Token generated successfully:', token);
    
    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.passwordHash;
    
    console.log('Sending successful login response with token');
    
    res.json({
      success: true,
      data: {
        admin: adminResponse,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error logging in admin',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/admin/me
 * @desc    Get current admin
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-passwordHash');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Admin not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching admin',
        details: error.message
      }
    });
  }
});

module.exports = router; 