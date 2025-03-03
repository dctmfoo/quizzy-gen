import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    console.log('API Interceptor - Token from localStorage:', token);
    
    if (token) {
      config.headers['x-auth-token'] = token;
      // Also add as Authorization header in Bearer format as a fallback
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('API Interceptor - Headers set:', {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      });
    } else {
      console.log('API Interceptor - No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('API Interceptor - Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response - ${response.config.method.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`API Error - ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, 
      error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Chapter endpoints
  getChapters: () => api.get('/chapters'),
  getChapter: (id) => api.get(`/chapters/${id}`),
  getChapterQuestions: (id) => api.get(`/chapters/${id}/questions`),
  
  // Question endpoints
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  
  // Quiz endpoints
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  getQuizzes: () => api.get('/quizzes'),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  getQuizByLink: (link) => api.get(`/quizzes/link/${link}`),
  
  // Quiz attempt endpoints
  submitQuizAttempt: (attemptData) => api.post('/quiz-attempts', attemptData),
  getQuizAttempt: (id) => api.get(`/quiz-attempts/${id}`),
  
  // Admin endpoints
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  adminRegister: (userData) => api.post('/admin/register', userData),
  getCurrentAdmin: () => api.get('/admin/me'),
  
  // Helper methods
  clearToken: () => {
    localStorage.removeItem('adminToken');
    console.log('Token cleared from localStorage');
  },
  
  getToken: () => {
    const token = localStorage.getItem('adminToken');
    console.log('Current token in localStorage:', token);
    return token;
  }
};

export default apiService;