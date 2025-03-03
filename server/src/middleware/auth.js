/**
 * Authentication middleware
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to authenticate admin users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = async function(req, res, next) {
  try {
    console.log('Auth middleware - Headers:', JSON.stringify(req.headers, null, 2));
    
    // Get token from header - check both x-auth-token and Authorization header
    let token = req.header('x-auth-token');
    console.log('Token from x-auth-token:', token);
    
    // If no token in x-auth-token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      console.log('Authorization header:', authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Token extracted from Authorization header:', token);
      }
    }
    
    // Check if no token
    if (!token) {
      console.log('No token found in request headers');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token, authorization denied'
        }
      });
    }
    
    // Verify token
    console.log('Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    // Find admin by ID
    console.log('Finding admin with ID:', decoded.id);
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    
    if (!admin) {
      console.log('Admin not found with ID:', decoded.id);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token, authorization denied'
        }
      });
    }
    
    console.log('Admin found:', admin.username);
    
    // Add admin to request object
    req.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };
    
    console.log('Auth middleware successful, proceeding to route handler');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token, authorization denied'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired, authorization denied'
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
        details: error.message
      }
    });
  }
}; 