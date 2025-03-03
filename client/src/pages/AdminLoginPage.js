import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLoginPage.css';
import apiService from '../services/api';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from || '/admin/dashboard';
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('Initial token check:', token);
    
    if (token) {
      // Verify token validity by making a request to /admin/me
      apiService.getCurrentAdmin()
        .then((response) => {
          console.log('Token validation successful:', response);
          // If successful, redirect to the original destination or dashboard
          navigate(from);
        })
        .catch((err) => {
          console.error('Token validation failed:', err);
          // If token is invalid, remove it
          localStorage.removeItem('adminToken');
        });
    }
  }, [navigate, from]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use apiService instead of direct fetch
      const response = await apiService.adminLogin({
        username,
        password,
      });
      
      console.log('Login response:', response); // Debug the full response
      
      // Check the structure of the response
      if (!response || !response.data) {
        console.error('Invalid response structure:', response);
        setError('Server returned an invalid response');
        setIsLoading(false);
        return;
      }
      
      // Extract token from response
      let token = null;
      
      if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
      } else if (response.data.token) {
        token = response.data.token;
      } else {
        console.error('Could not find token in response:', JSON.stringify(response, null, 2));
        setError('Authentication failed: Token missing from response');
        setIsLoading(false);
        return;
      }
      
      // Store the token
      localStorage.setItem('adminToken', token);
      console.log('Token stored:', token);
      
      // Verify the token was stored correctly
      const storedToken = localStorage.getItem('adminToken');
      console.log('Verified stored token:', storedToken);
      
      if (!storedToken) {
        console.error('Token was not stored in localStorage');
        setError('Authentication failed: Could not store token');
        setIsLoading(false);
        return;
      }
      
      // Add a small delay to ensure token is stored before redirect
      setTimeout(() => {
        // Redirect to the original destination or dashboard
        navigate(from);
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="admin-login-page">
      <div className="login-container">
        <h1>Admin Login</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {from !== '/admin/dashboard' && (
          <div className="redirect-message">
            Please log in to access the requested page
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage; 