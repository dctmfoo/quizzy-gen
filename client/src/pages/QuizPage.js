import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizPage.css';
import apiService from '../services/api';
import { ASSERTION_REASON_OPTIONS } from '../constants/assertionReasonOptions';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [showAssertionReasonInstructions, setShowAssertionReasonInstructions] = useState(false);
  const [hasSeenAssertionReasonInstructions, setHasSeenAssertionReasonInstructions] = useState(false);
  const [firstAssertionReasonIndex, setFirstAssertionReasonIndex] = useState(-1);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Use apiService instead of direct fetch
        const response = await apiService.getQuiz(id);
        console.log('Quiz response:', response.data);
        
        // Handle different response formats
        let quizData;
        if (response.data && response.data.success && response.data.data) {
          // Format: { success: true, data: {...} }
          quizData = response.data.data;
        } else {
          // Format: Direct object
          quizData = response.data;
        }
        
        setQuiz(quizData);
        
        // Find the first assertion-reason question index
        if (quizData && quizData.questions && Array.isArray(quizData.questions)) {
          const index = quizData.questions.findIndex(q => q.type === 'assertion_reason');
          setFirstAssertionReasonIndex(index);
          
          // Initialize answers object with empty values
          const initialAnswers = {};
          quizData.questions.forEach(question => {
            initialAnswers[question._id] = '';
          });
          setAnswers(initialAnswers);
        } else {
          console.error('Quiz data does not contain questions array:', quizData);
          setError('Quiz data is invalid or incomplete');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id]);
  
  // Check if we need to show assertion-reason instructions when navigating to a question
  useEffect(() => {
    if (quiz && !showUserForm && !hasSeenAssertionReasonInstructions && firstAssertionReasonIndex !== -1) {
      // Show instructions when we're about to see the first assertion-reason question
      if (currentQuestionIndex === firstAssertionReasonIndex) {
        setShowAssertionReasonInstructions(true);
      }
    }
  }, [quiz, currentQuestionIndex, showUserForm, hasSeenAssertionReasonInstructions, firstAssertionReasonIndex]);
  
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextQuestion = () => {
    // Check if the next question is the first assertion-reason question
    if (!hasSeenAssertionReasonInstructions && 
        firstAssertionReasonIndex !== -1 && 
        currentQuestionIndex + 1 === firstAssertionReasonIndex) {
      setShowAssertionReasonInstructions(true);
    } else {
      setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1));
    }
  };
  
  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    setShowUserForm(false);
    
    // If the first question is an assertion-reason type, show instructions immediately
    if (firstAssertionReasonIndex === 0 && !hasSeenAssertionReasonInstructions) {
      setShowAssertionReasonInstructions(true);
    }
  };
  
  const handleAssertionReasonInstructionsAcknowledge = () => {
    setShowAssertionReasonInstructions(false);
    setHasSeenAssertionReasonInstructions(true);
    // After acknowledging instructions, move to the first assertion-reason question
    if (firstAssertionReasonIndex !== -1) {
      setCurrentQuestionIndex(firstAssertionReasonIndex);
    }
  };
  
  const handleQuestionDotClick = (index) => {
    // If clicking on or after the first assertion-reason question and haven't seen instructions
    if (!hasSeenAssertionReasonInstructions && 
        firstAssertionReasonIndex !== -1 && 
        index >= firstAssertionReasonIndex) {
      setShowAssertionReasonInstructions(true);
    } else {
      setCurrentQuestionIndex(index);
    }
  };
  
  const handleSubmitQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Check if all questions are answered
      const unansweredQuestions = Object.values(answers).filter(answer => !answer).length;
      
      if (unansweredQuestions > 0) {
        if (!window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`)) {
          setIsLoading(false);
          return;
        }
      }
      
      // Prepare quiz attempt data
      const attemptData = {
        quizId: id,
        userName,
        userEmail,
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer
        }))
      };
      
      console.log('Submitting quiz attempt:', attemptData);
      
      // Use apiService instead of direct fetch
      const response = await apiService.submitQuizAttempt(attemptData);
      console.log('Quiz submission response:', response.data);
      
      // Handle different response formats
      let resultId;
      if (response.data && response.data._id) {
        // Direct object response
        resultId = response.data._id;
      } else if (response.data && response.data.data && response.data.data._id) {
        // Nested data object response
        resultId = response.data.data._id;
      } else {
        console.error('Unexpected quiz submission response format:', response.data);
        throw new Error('Invalid response format');
      }
      
      // Navigate to results page
      navigate(`/results/${resultId}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="quiz-page loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="quiz-page error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/chapters')} className="btn btn-primary">
          Back to Chapters
        </button>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="quiz-page error">
        <h2>Quiz Not Found</h2>
        <p>The quiz you're looking for doesn't exist or has expired.</p>
        <button onClick={() => navigate('/chapters')} className="btn btn-primary">
          Back to Chapters
        </button>
      </div>
    );
  }
  
  if (showUserForm) {
    return (
      <div className="quiz-page user-form">
        <h1>{quiz.title}</h1>
        <p className="quiz-description">{quiz.description}</p>
        <div className="quiz-info">
          <p><strong>Questions:</strong> {quiz.questions.length}</p>
          <p><strong>Chapters:</strong> {quiz.chapters.map(ch => ch.title).join(', ')}</p>
        </div>
        
        <form onSubmit={handleUserFormSubmit} className="user-info-form">
          <h2>Enter Your Information</h2>
          <div className="form-group">
            <label htmlFor="userName">Your Name (Optional)</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userEmail">Your Email (Optional)</label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Start Quiz
          </button>
        </form>
      </div>
    );
  }
  
  if (showAssertionReasonInstructions) {
    return (
      <div className="quiz-page assertion-reason-instructions">
        <div className="instructions-container">
          <h2>Assertion-Reason Questions</h2>
          <div className="instructions-content">
            <p>For this type of question, two statements are given – One labelled as Assertion (A) and the other labelled as Reason (R).</p>
            
            <p>Select the correct answer to these questions from the codes (a), (b), (c) and (d) as given below:</p>
            
            <div className="instruction-options">
              <p><strong>(a)</strong> Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of the Assertion (A).</p>
              <p><strong>(b)</strong> Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of the Assertion (A).</p>
              <p><strong>(c)</strong> Assertion (A) is true, but Reason (R) is false.</p>
              <p><strong>(d)</strong> Assertion (A) is false, but Reason (R) is true.</p>
            </div>
            
            <button 
              onClick={handleAssertionReasonInstructionsAcknowledge}
              className="btn btn-primary"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isFirstAssertionReasonQuestion = currentQuestionIndex === firstAssertionReasonIndex;

  // Define assertion-reason answer options with their codes
  const assertionReasonOptions = Object.entries(ASSERTION_REASON_OPTIONS).map(([code, text]) => ({
    code,
    text: `(${code}) ${text}`
  }));

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(Object.values(answers).filter(a => a).length / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <p>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
            <span className="answered-count">
              ({Object.values(answers).filter(a => a).length} answered)
            </span>
          </p>
        </div>
      </div>
      
      <div className="question-container">
        {isFirstAssertionReasonQuestion && !hasSeenAssertionReasonInstructions ? (
          <div className="assertion-reason-banner">
            <h3>Assertion-Reason Questions</h3>
            <p>The following questions are in assertion-reason format. Each question consists of two statements:</p>
            <ul>
              <li>An Assertion (A)</li>
              <li>A Reason (R)</li>
            </ul>
            <p>Select the correct answer from the options below based on the following criteria:</p>
            <div className="assertion-reason-options-guide">
              {assertionReasonOptions.map(({code, text}, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="question-text">
          <h2>
            {currentQuestion.type === 'assertion_reason' ? 'Assertion-Reason Question' : 'Question'}
          </h2>
          
          {currentQuestion.type === 'assertion_reason' ? (
            <div className="assertion-reason">
              <p><strong>Assertion (A):</strong> {currentQuestion.assertion}</p>
              <p><strong>Reason (R):</strong> {currentQuestion.reason}</p>
              <p className="instruction">
                Select the correct option based on the assertion and reason statements.
              </p>
            </div>
          ) : (
            <p>{currentQuestion.questionText}</p>
          )}
        </div>
        
        <div className="options">
          {currentQuestion.type === 'assertion_reason' ? (
            assertionReasonOptions.map(({code, text}, index) => (
              <div 
                key={index}
                className={`option ${answers[currentQuestion._id] === code ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion._id, code)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{text}</span>
              </div>
            ))
          ) : (
            currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`option ${answers[currentQuestion._id] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion._id, option)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="quiz-navigation">
        <button 
          onClick={handlePrevQuestion} 
          disabled={currentQuestionIndex === 0}
          className="nav-button prev"
        >
          Previous
        </button>
        
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button 
            onClick={handleNextQuestion}
            className="nav-button next"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmitQuiz}
            className="nav-button submit"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
      
      <div className="question-navigator">
        {quiz.questions.map((q, index) => (
          <button
            key={index}
            className={`question-dot ${index === currentQuestionIndex ? 'active' : ''} ${answers[q._id] ? 'answered' : ''}`}
            onClick={() => handleQuestionDotClick(index)}
            aria-label={`Go to question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizPage; 