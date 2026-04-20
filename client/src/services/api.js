import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('edunexus-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getByClass: (cls) => api.get(`/students/class/${cls}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const attendanceService = {
  mark: (data) => api.post('/attendance', data),
  getAll: (params) => api.get('/attendance', { params }),
  getStats: (studentId) => api.get(`/attendance/stats/${studentId}`),
  generateQR: (data) => api.post('/attendance/generate-qr', data),
  scanQR: (data) => api.post('/attendance/qr-scan', data),
};

export const marksService = {
  create: (data) => api.post('/marks', data),
  getAll: (params) => api.get('/marks', { params }),
  getStats: (studentId) => api.get(`/marks/stats/${studentId}`),
  getLeaderboard: (cls) => api.get(`/marks/class/${cls}/leaderboard`),
  update: (id, data) => api.put(`/marks/${id}`, data),
  delete: (id) => api.delete(`/marks/${id}`),
};

export const assignmentService = {
  getAll: (params) => api.get('/assignments', { params }),
  create: (data) => api.post('/assignments', data),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (id, studentId, data) => api.put(`/assignments/${id}/grade/${studentId}`, data),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getClassStats: (cls) => api.get(`/analytics/class/${cls}`),
};

export const aiService = {
  getRecommendations: (studentId) => api.get(`/ai/recommendations/${studentId}`),
  getPrediction: (studentId) => api.get(`/ai/predict/${studentId}`),
  getCareerSuggestions: (studentId) => api.get(`/ai/career/${studentId}`),
};

export const reportService = {
  getStudentReport: (id) => api.get(`/reports/student/${id}`),
  getClassReport: (cls) => api.get(`/reports/class/${cls}`),
};

export const chatService = {
  getMessages: (room) => api.get(`/chat/${room}`),
  sendMessage: (data) => api.post('/chat', data),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const gamificationService = {
  getProfile: (studentId) => api.get(`/gamification/profile/${studentId}`),
  getLeaderboard: () => api.get('/gamification/leaderboard'),
  awardPoints: (data) => api.post('/gamification/award-points', data),
};

export const timetableService = {
  get: (params) => api.get('/timetable', { params }),
  save: (data) => api.post('/timetable', data),
};

export default api;
