import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { isAuthenticated, logout } from '../utils/auth';

function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    const authStatus = await isAuthenticated();
    setIsAuth(authStatus);
  };

  useEffect(() => {
    // Check auth status on component mount
    checkAuthStatus();
    
    // Listen for auth-logout events
    const handleLogout = () => {
      setIsAuth(false);
    };
    
    window.addEventListener('auth-logout', handleLogout);
    
    // Listen for storage events (for multi-tab support)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('auth-logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <h1>Quizzy-Gen</h1>
          </Link>
        </div>
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {isAuth && (
              <>
                <li>
                  <Link to="/chapters">Chapters</Link>
                </li>
                <li>
                  <Link to="/create-quiz">Create Quiz</Link>
                </li>
                <li>
                  <Link to="/admin/dashboard">Dashboard</Link>
                </li>
                <li>
                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
            {!isAuth && (
              <li>
                <Link to="/admin/login">Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header; 