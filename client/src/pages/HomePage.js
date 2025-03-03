import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Quizzy-Gen</h1>
          <p>Generate custom quizzes from science curriculum chapters</p>
          <div className="hero-buttons">
            <Link to="/chapters" className="btn btn-primary">Browse Chapters</Link>
            <Link to="/create-quiz" className="btn btn-secondary">Create Quiz</Link>
          </div>
        </div>
      </section>
      
      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Comprehensive Content</h3>
            <p>Access questions from multiple science chapters covering various topics</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Custom Quizzes</h3>
            <p>Create quizzes with your preferred number of questions from selected chapters</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Instant Results</h3>
            <p>Get immediate feedback and detailed explanations for each question</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Shareable Links</h3>
            <p>Share your quizzes with friends or students via unique links</p>
          </div>
        </div>
      </section>
      
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse Chapters</h3>
            <p>Explore available science chapters in our curriculum</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Create Quiz</h3>
            <p>Select chapters and customize the number of questions</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Take Quiz</h3>
            <p>Answer questions and submit your responses</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>View Results</h3>
            <p>Get your score and review detailed explanations</p>
          </div>
        </div>
      </section>
      
      <section className="cta">
        <h2>Ready to Test Your Knowledge?</h2>
        <p>Start creating custom quizzes from our science curriculum</p>
        <Link to="/chapters" className="btn btn-primary">Get Started</Link>
      </section>
    </div>
  );
};

export default HomePage; 