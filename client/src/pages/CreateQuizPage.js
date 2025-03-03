import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import './CreateQuizPage.css';

const CreateQuizPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [standardCount, setStandardCount] = useState(1);
  const [assertionReasonCount, setAssertionReasonCount] = useState(1);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableStandardCount, setAvailableStandardCount] = useState(0);
  const [availableAssertionReasonCount, setAvailableAssertionReasonCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Parse chapter ID from URL query parameter if present
    const query = new URLSearchParams(location.search);
    const chapterId = query.get('chapter');
    
    if (chapterId) {
      setSelectedChapters([chapterId]);
    }
    
    // Fetch available chapters using the API service
    const fetchChapters = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getChapters();
        // Handle different response formats
        if (Array.isArray(response.data)) {
          setAvailableChapters(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setAvailableChapters(response.data.data);
        } else {
          console.error('Unexpected chapters response format:', response.data);
          setError('Failed to load chapters. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError('Failed to load chapters. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChapters();
  }, [location.search]);

  // Fetch available question counts when chapters change
  useEffect(() => {
    const fetchAvailableCounts = async () => {
      if (selectedChapters.length === 0) {
        setAvailableStandardCount(0);
        setAvailableAssertionReasonCount(0);
        setStandardCount(1);
        setAssertionReasonCount(1);
        return;
      }

      try {
        setIsLoadingCounts(true);
        const response = await apiService.getAvailableQuestionCounts(selectedChapters);
        const counts = response.data.data;
        setAvailableStandardCount(counts.standardCount);
        setAvailableAssertionReasonCount(counts.assertionReasonCount);

        // Reset counts if they exceed available counts
        if (standardCount > counts.standardCount) {
          setStandardCount(counts.standardCount || 1);
        }
        if (assertionReasonCount > counts.assertionReasonCount) {
          setAssertionReasonCount(counts.assertionReasonCount || 1);
        }
      } catch (err) {
        console.error('Error fetching available counts:', err);
        setError('Failed to load available question counts. Please try again.');
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchAvailableCounts();
  }, [selectedChapters]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedChapters.length === 0) {
      setError('Please select at least one chapter');
      return;
    }

    const totalQuestions = standardCount + assertionReasonCount;
    if (totalQuestions < 1) {
      setError('Total number of questions must be at least 1');
      return;
    }

    if (standardCount > availableStandardCount) {
      setError(`Cannot select more standard questions than available (${availableStandardCount})`);
      return;
    }

    if (assertionReasonCount > availableAssertionReasonCount) {
      setError(`Cannot select more assertion-reason questions than available (${availableAssertionReasonCount})`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const quizData = {
        title,
        description,
        standardCount: parseInt(standardCount),
        assertionReasonCount: parseInt(assertionReasonCount),
        chapters: selectedChapters
      };
      
      console.log('Creating quiz with data:', quizData);
      const response = await apiService.createQuiz(quizData);
      console.log('Quiz creation response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data._id) {
        // Direct object response
        navigate(`/quiz/${response.data._id}`);
      } else if (response.data && response.data.data && response.data.data._id) {
        // Nested data object response
        navigate(`/quiz/${response.data.data._id}`);
      } else {
        console.error('Unexpected quiz creation response format:', response.data);
        setError('Failed to create quiz. Unexpected response format.');
      }
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleChapter = (chapterId) => {
    setSelectedChapters(prev => 
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };
  
  return (
    <div className="create-quiz-page">
      <h1>Create a New Quiz</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-group">
          <label htmlFor="title">Quiz Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter a title for your quiz"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this quiz is about"
            rows="3"
          />
        </div>
        
        <div className="question-counts">
          <div className="count-input">
            <label htmlFor="standardCount">Number of Standard Questions</label>
            {isLoadingCounts ? (
              <div className="loading-counts">Loading available counts...</div>
            ) : (
              <select
                id="standardCount"
                value={standardCount}
                onChange={(e) => setStandardCount(parseInt(e.target.value))}
                disabled={selectedChapters.length === 0 || availableStandardCount === 0}
                className="count-select"
              >
                {availableStandardCount === 0 ? (
                  <option value="0">No standard questions available</option>
                ) : (
                  Array.from({ length: availableStandardCount }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))
                )}
              </select>
            )}
            {availableStandardCount > 0 && (
              <div className="available-count">
                Available: {availableStandardCount}
              </div>
            )}
          </div>
          
          <div className="count-input">
            <label htmlFor="assertionReasonCount">Number of Assertion-Reason Questions</label>
            {isLoadingCounts ? (
              <div className="loading-counts">Loading available counts...</div>
            ) : (
              <select
                id="assertionReasonCount"
                value={assertionReasonCount}
                onChange={(e) => setAssertionReasonCount(parseInt(e.target.value))}
                disabled={selectedChapters.length === 0 || availableAssertionReasonCount === 0}
                className="count-select"
              >
                {availableAssertionReasonCount === 0 ? (
                  <option value="0">No assertion-reason questions available</option>
                ) : (
                  Array.from({ length: availableAssertionReasonCount }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))
                )}
              </select>
            )}
            {availableAssertionReasonCount > 0 && (
              <div className="available-count">
                Available: {availableAssertionReasonCount}
              </div>
            )}
          </div>

          <div className="total-questions">
            Total Questions: {standardCount + assertionReasonCount}
          </div>
        </div>
        
        <div className="form-group">
          <label>Select Chapters</label>
          {isLoading ? (
            <div className="chapters-selection">
              <p>Loading chapters...</p>
            </div>
          ) : (
            <>
              <div className="chapters-selection">
                {availableChapters.length > 0 ? (
                  availableChapters.map(chapter => (
                    <div 
                      key={chapter._id} 
                      className={`chapter-option ${selectedChapters.includes(chapter._id) ? 'selected' : ''}`}
                      onClick={() => toggleChapter(chapter._id)}
                    >
                      <div className="chapter-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedChapters.includes(chapter._id)} 
                          onChange={() => {}} // Handled by the onClick on the parent div
                          id={`chapter-${chapter._id}`}
                        />
                      </div>
                      <div className="chapter-info">
                        <span className="chapter-number">Chapter {chapter.chapterNumber}</span>
                        <span className="chapter-title">{chapter.title}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No chapters available. Please add chapters first.</p>
                )}
              </div>
              {selectedChapters.length > 0 && (
                <div className="selected-chapters-summary">
                  <p>{selectedChapters.length} chapter(s) selected</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <button 
          type="submit" 
          className="create-button" 
          disabled={isLoading || selectedChapters.length === 0}
        >
          {isLoading ? 'Creating...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
};

export default CreateQuizPage; 