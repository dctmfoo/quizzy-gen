import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';
import apiService from '../services/api';

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Log the token to verify it's being used
    console.log('Using token:', token.substring(0, 20) + '...');
    
    const fetchData = async () => {
      try {
        // Fetch admin info first
        const adminResponse = await apiService.getCurrentAdmin();
        setAdminInfo(adminResponse.data);
        console.log('Admin info fetched successfully:', adminResponse.data);
        
        // Mock stats data for now (replace with actual API call when available)
        setStats({
          totalQuizzes: 15,
          totalAttempts: 120,
          averageScore: 78,
          activeQuizzes: 8,
          recentAttempts: []
        });
        
        // Fetch quizzes using apiService
        const quizzesResponse = await apiService.getQuizzes();
        setQuizzes(quizzesResponse.data);
        
        // Fetch chapters using apiService
        const chaptersResponse = await apiService.getChapters();
        setChapters(chaptersResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        if (err.response && err.response.status === 401) {
          console.error('Authentication error:', err.response.data);
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };
  
  if (isLoading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="admin-dashboard error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/admin/login')} className="btn btn-primary">
          Back to Login
        </button>
      </div>
    );
  }
  
  // If we don't have admin info, something went wrong
  if (!adminInfo) {
    return (
      <div className="admin-dashboard error">
        <h2>Authentication Error</h2>
        <p>Unable to verify your credentials. Please log in again.</p>
        <button onClick={() => navigate('/admin/login')} className="btn btn-primary">
          Back to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <p className="admin-info">Logged in as: {adminInfo.username} ({adminInfo.role})</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          Quizzes
        </button>
        <button 
          className={`tab-button ${activeTab === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveTab('chapters')}
        >
          Chapters
        </button>
      </div>
      
      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Quizzes</h3>
              <p className="stat-value">{stats.totalQuizzes}</p>
            </div>
            <div className="stat-card">
              <h3>Total Attempts</h3>
              <p className="stat-value">{stats.totalAttempts}</p>
            </div>
            <div className="stat-card">
              <h3>Average Score</h3>
              <p className="stat-value">{stats.averageScore}%</p>
            </div>
            <div className="stat-card">
              <h3>Active Quizzes</h3>
              <p className="stat-value">{stats.activeQuizzes}</p>
            </div>
          </div>
          
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            {stats.recentAttempts && stats.recentAttempts.length > 0 ? (
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>User</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map(attempt => (
                    <tr key={attempt._id}>
                      <td>{attempt.quizTitle}</td>
                      <td>{attempt.userName || 'Anonymous'}</td>
                      <td>{attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)</td>
                      <td>{new Date(attempt.completedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No recent quiz attempts</p>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'quizzes' && (
        <div className="quizzes-content">
          <h2>All Quizzes</h2>
          {quizzes.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Questions</th>
                  <th>Attempts</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(quiz => (
                  <tr key={quiz._id}>
                    <td>{quiz.title}</td>
                    <td>{quiz.questionCount}</td>
                    <td>{quiz.attemptCount}</td>
                    <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${quiz.isActive ? 'active' : 'inactive'}`}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button view">View</button>
                        <button className="action-button edit">Edit</button>
                        <button className="action-button delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No quizzes found</p>
          )}
        </div>
      )}
      
      {activeTab === 'chapters' && (
        <div className="chapters-content">
          <h2>All Chapters</h2>
          {chapters.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map(chapter => (
                  <tr key={chapter._id}>
                    <td>{chapter.chapterNumber}</td>
                    <td>{chapter.title}</td>
                    <td>{chapter.subject}</td>
                    <td>{chapter.questionCount}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button view">View</button>
                        <button className="action-button edit">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No chapters found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 