import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import './ChaptersPage.css';

function ChaptersPage() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await apiService.getChapters();
        setChapters(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError('Failed to load chapters. Please try again later.');
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  if (loading) {
    return (
      <div className="chapters-page">
        <div className="container">
          <h1>Chapters</h1>
          <div className="loading">Loading chapters...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chapters-page">
        <div className="container">
          <h1>Chapters</h1>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chapters-page">
      <div className="container">
        <h1>Chapters</h1>
        <p>Browse through our science curriculum chapters</p>
        
        <div className="chapters-grid">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="chapter-card">
              <div className="chapter-number">Chapter {chapter.chapterNumber}</div>
              <h2>{chapter.title}</h2>
              <p>{chapter.subject}</p>
              <Link to={`/create-quiz?chapter=${chapter._id}`} className="btn btn-primary">
                Create Quiz
              </Link>
            </div>
          ))}
        </div>
        
        {chapters.length === 0 && (
          <div className="no-chapters">
            <p>No chapters available at the moment.</p>
          </div>
        )}
        
        <div className="cta-section">
          <h2>Ready to test your knowledge?</h2>
          <p>Create a customized quiz from multiple chapters</p>
          <Link to="/create-quiz" className="btn btn-primary">
            Create Custom Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ChaptersPage; 