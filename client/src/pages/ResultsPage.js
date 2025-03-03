import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResultsPage.css';
import apiService from '../services/api';
import { getAssertionReasonOptionText } from '../constants/assertionReasonOptions';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExplanations, setShowExplanations] = useState({});
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('Fetching quiz attempt with ID:', id);
        
        // Use apiService instead of direct fetch
        const response = await apiService.getQuizAttempt(id);
        console.log('Results response:', response.data);
        
        // Handle different response formats
        let resultsData;
        if (response.data && response.data.success && response.data.data) {
          // Format: { success: true, data: {...} }
          resultsData = response.data.data;
        } else {
          // Format: Direct object
          resultsData = response.data;
        }
        
        // Transform the data if needed
        const transformedData = transformResultsData(resultsData);
        console.log('Transformed results data:', transformedData);
        
        setResults(transformedData);
        
        // Initialize showExplanations object
        if (transformedData && transformedData.answers && Array.isArray(transformedData.answers)) {
          const explanationsState = {};
          transformedData.answers.forEach((answer, index) => {
            // Use question._id if available, otherwise use index as fallback
            const questionId = answer.question?._id || answer.questionId?._id || answer.questionId || index;
            explanationsState[questionId] = false;
          });
          setShowExplanations(explanationsState);
        } else {
          console.error('Results data does not contain answers array:', transformedData);
          setError('Results data is invalid or incomplete');
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.response?.data?.message || 'Results not found');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  // Helper function to transform the results data if needed
  const transformResultsData = (data) => {
    // If the data already has the expected structure, return it as is
    if (data && data.quiz && data.answers) {
      return data;
    }
    
    // If the data has a different structure, transform it
    if (data) {
      // Check if quizId is an object or just an ID
      const quiz = typeof data.quizId === 'object' ? data.quizId : { _id: data.quizId, title: 'Quiz' };
      
      // Check if answers have question objects or just questionIds
      const answers = data.answers && Array.isArray(data.answers) 
        ? data.answers.map(answer => {
            // If questionId is already an object, use it
            if (typeof answer.questionId === 'object') {
              return {
                ...answer,
                question: answer.questionId
              };
            }
            // Otherwise, we need to find the question in the results
            return answer;
          })
        : [];
      
      return {
        ...data,
        quiz,
        answers
      };
    }
    
    return null;
  };
  
  const toggleExplanation = (questionId) => {
    // Ensure questionId is a string or number
    const id = typeof questionId === 'object' ? questionId._id : questionId;
    
    setShowExplanations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="results-page loading">
        <div className="loader"></div>
        <p>Loading results...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="results-page error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/chapters')} className="btn btn-primary">
          Back to Chapters
        </button>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="results-page error">
        <h2>Results Not Found</h2>
        <p>The quiz results you're looking for don't exist or have expired.</p>
        <button onClick={() => navigate('/chapters')} className="btn btn-primary">
          Back to Chapters
        </button>
      </div>
    );
  }
  
  const { quiz, answers, score, totalQuestions, completedAt } = results;
  const scorePercentage = Math.round((score / totalQuestions) * 100);
  
  // Check if we have the necessary data to render the results
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return (
      <div className="results-page error">
        <h2>Incomplete Results</h2>
        <p>The quiz results are incomplete or in an unexpected format.</p>
        <button onClick={() => navigate('/chapters')} className="btn btn-primary">
          Back to Chapters
        </button>
      </div>
    );
  }
  
  return (
    <div className="results-page">
      <div className="results-header">
        <h1>Quiz Results</h1>
        <div className="quiz-info">
          <h2>{quiz?.title || 'Quiz'}</h2>
          {quiz?.description && <p className="quiz-description">{quiz.description}</p>}
          <p className="completion-time">
            Completed on: {new Date(completedAt).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="score-card">
        <div className="score-circle" style={{ 
          background: `conic-gradient(
            ${scorePercentage >= 70 ? '#4caf50' : scorePercentage >= 40 ? '#ff9800' : '#f44336'} 
            ${scorePercentage * 3.6}deg, 
            #f0f0f0 ${scorePercentage * 3.6}deg 360deg
          )`
        }}>
          <div className="score-inner">
            <span className="score-percentage">{scorePercentage}%</span>
            <span className="score-text">{score} / {totalQuestions}</span>
          </div>
        </div>
        
        <div className="score-message">
          {scorePercentage >= 70 ? (
            <p className="good">Great job! You've mastered this content.</p>
          ) : scorePercentage >= 40 ? (
            <p className="average">Good effort! Review the questions you missed.</p>
          ) : (
            <p className="poor">Keep practicing! Review the material and try again.</p>
          )}
        </div>
      </div>
      
      <div className="results-actions">
        <Link to={`/quiz/${quiz?._id}`} className="btn btn-secondary">
          Retake Quiz
        </Link>
        <Link to="/create-quiz" className="btn btn-primary">
          Create New Quiz
        </Link>
      </div>
      
      <div className="questions-review">
        <h2>Questions Review</h2>
        
        {answers.map((answer, index) => {
          // Handle the case where answer.question might not exist
          const question = answer.question || answer.questionId;
          
          // Skip if we don't have question data
          if (!question) return null;
          
          return (
            <div 
              key={question._id || index} 
              className={`question-result ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className={`result-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              <div className="question-content">
                {question.type === 'assertion_reason' ? (
                  <div className="assertion-reason">
                    <p><strong>Assertion (A):</strong> {question.assertion}</p>
                    <p><strong>Reason (R):</strong> {question.reason}</p>
                    <div className="answer-comparison">
                      <div className="your-answer">
                        <p className="label">Your Answer:</p>
                        <p className={`answer ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                          {getAssertionReasonOptionText(answer.selectedAnswer)}
                        </p>
                      </div>
                      {!answer.isCorrect && (
                        <div className="correct-answer">
                          <p className="label">Correct Answer:</p>
                          <p className="answer correct">
                            {getAssertionReasonOptionText(question.correctAnswerCode)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="question-text">{question.questionText}</p>
                    <div className="answer-comparison">
                      <div className="your-answer">
                        <p className="label">Your Answer:</p>
                        <p className={`answer ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                          {answer.selectedAnswer}
                        </p>
                      </div>
                      {!answer.isCorrect && (
                        <div className="correct-answer">
                          <p className="label">Correct Answer:</p>
                          <p className="answer correct">{question.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <button 
                  className="explanation-toggle"
                  onClick={() => toggleExplanation(question._id || index)}
                >
                  {showExplanations[question._id || index] ? 'Hide Explanation' : 'Show Explanation'}
                </button>
                
                {showExplanations[question._id || index] && (
                  <div className="explanation">
                    <p>{question.explanation}</p>
                    {question.reference && (
                      <p className="reference">Reference: {question.reference}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="results-footer">
        <Link to="/chapters" className="btn btn-secondary">
          Browse Chapters
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage; 