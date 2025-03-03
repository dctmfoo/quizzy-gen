import apiService from '../services/api';

/**
 * Utility functions for authentication
 */

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  try {
    const token = apiService.getToken();
    if (!token) {
      return false;
    }
    
    // Verify token by making a request to /admin/me
    await apiService.getCurrentAdmin();
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    // Clear invalid token
    apiService.clearToken();
    return false;
  }
};

/**
 * Get the current admin user
 * @returns {Promise<Object|null>} Admin user object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const token = apiService.getToken();
    if (!token) {
      return null;
    }
    
    const response = await apiService.getCurrentAdmin();
    return response.data.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    apiService.clearToken();
    return null;
  }
};

/**
 * Logout the current user
 */
export const logout = () => {
  apiService.clearToken();
  // Dispatch a custom event to notify components about logout
  window.dispatchEvent(new Event('auth-logout'));
};

export default {
  isAuthenticated,
  getCurrentUser,
  logout
}; 