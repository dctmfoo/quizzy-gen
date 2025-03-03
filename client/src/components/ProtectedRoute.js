import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * ProtectedRoute component that checks if user is authenticated
 * If authenticated, renders the child component
 * If not authenticated, redirects to login page
 */
const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setIsAuth(authStatus);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication verification failed:', error);
        setIsAuth(false);
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login page with return URL
  if (!isAuth) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute; 