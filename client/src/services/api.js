import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
  }
  return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
};

const API_URL = getBaseURL();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitfuel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — but NOT on auth endpoints (login/register/me)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    const onAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

    if (error.response?.status === 401 && !isAuthEndpoint && !onAuthPage) {
      localStorage.removeItem('fitfuel_token');
      localStorage.removeItem('fitfuel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me')
};

// User
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getStats: () => api.get('/users/stats')
};

// Foods
export const foodAPI = {
  getAll: (params) => api.get('/foods', { params }),
  getById: (id) => api.get(`/foods/${id}`),
  getSuggestions: (mealType, params) => api.get(`/foods/suggestions/${mealType}`, { params }),
  search: (q) => api.get('/foods/search', { params: { q } }),
  addCustom: (data) => api.post('/foods/custom', data),
  rate: (id, rating) => api.put(`/foods/${id}/rate`, { rating })
};

// Meals
export const mealAPI = {
  log: (data) => api.post('/meals', data),
  getToday: () => api.get('/meals/today'),
  getHistory: (days) => api.get('/meals/history', { params: { days } }),
  getFavorites: () => api.get('/meals/favorites'),
  toggleFavorite: (id) => api.post(`/meals/${id}/favorite`),
  delete: (id) => api.delete(`/meals/${id}`),
  getPlan: (params) => api.get('/meals/plan', { params }),
  getGroceryList: (days) => api.get('/meals/grocery-list', { params: { days } })
};

// Goals
export const goalAPI = {
  create: (data) => api.post('/goals', data),
  getActive: () => api.get('/goals/active'),
  update: (id, data) => api.put(`/goals/${id}`, data),
  getProgress: () => api.get('/goals/progress')
};

// Logs
export const logAPI = {
  create: (data) => api.post('/logs', data),
  getToday: () => api.get('/logs/today'),
  getAll: (days) => api.get('/logs', { params: { days } }),
  getStats: (days) => api.get('/logs/stats', { params: { days } }),
  getHeatmap: (months) => api.get('/logs/heatmap', { params: { months } })
};

// Water
export const waterAPI = {
  getToday: () => api.get('/water/today'),
  addGlass: () => api.put('/water/add'),
  removeGlass: () => api.put('/water/remove')
};

// Exercise
export const exerciseAPI = {
  log: (data) => api.post('/exercise', data),
  getToday: () => api.get('/exercise/today'),
  getHistory: (days) => api.get('/exercise/history', { params: { days } }),
  getSuggestions: () => api.get('/exercise/suggestions')
};

// Photos
export const photoAPI = {
  upload: (formData) => api.post('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (bodyPart) => api.get('/photos', { params: { bodyPart } }),
  getComparison: (bodyPart) => api.get('/photos/compare', { params: { bodyPart } }),
  delete: (id) => api.delete(`/photos/${id}`)
};

// Wellness
export const wellnessAPI = {
  logSleep: (data) => api.post('/wellness/sleep', data),
  getSleepHistory: (days) => api.get('/wellness/sleep/history', { params: { days } }),
  logSupplements: (data) => api.post('/wellness/supplements', data),
  getTodaySupplements: () => api.get('/wellness/supplements/today'),
  startFasting: (data) => api.post('/wellness/fasting/start', data),
  endFasting: () => api.put('/wellness/fasting/end'),
  getActiveFasting: () => api.get('/wellness/fasting/active'),
  getHealthScore: () => api.get('/wellness/health-score'),
  getAlerts: () => api.get('/wellness/alerts')
};

// Gamification
export const gamificationAPI = {
  getBadges: () => api.get('/gamification/badges'),
  getLevel: () => api.get('/gamification/level'),
  getStreak: () => api.get('/gamification/streak'),
  getLeaderboard: (type) => api.get('/gamification/leaderboard', { params: { type } }),
  checkAchievements: () => api.post('/gamification/check')
};

export default api;
