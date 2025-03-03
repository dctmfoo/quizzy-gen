import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChaptersPage from './pages/ChaptersPage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected routes */}
            <Route path="/chapters" element={
              <ProtectedRoute>
                <ChaptersPage />
              </ProtectedRoute>
            } />
            <Route path="/create-quiz" element={
              <ProtectedRoute>
                <CreateQuizPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:id" element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            } />
            <Route path="/results/:id" element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <ProtectedRoute>
                <NotFoundPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 