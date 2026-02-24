/**
 * Axios API service - base URL and auth header
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Admin APIs (requires admin token)
export const createExam = (data) => api.post('/admin/exam', data);
export const addQuestion = (data) => api.post('/admin/question', data);
export const uploadQuestions = (formData) =>
  api.post('/admin/upload-questions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getAdminExamDetail = (id) => api.get(`/admin/exam/${id}`);
export const deleteExam = (id) => api.delete(`/admin/exam/${id}`);
export const assignExam = (data) => api.post('/admin/assign', data);
export const getResponses = (params) => api.get('/admin/responses', { params });
export const getScore = (responseId) => api.post('/admin/get-score', { responseId });

// User APIs (requires user token)
export const getMyExams = () => api.get('/user/exams');
export const getExam = (id) => api.get(`/user/exam/${id}`);
export const submitExam = (data) => api.post('/user/submit', data);
export const getResult = (examId) => api.get(`/user/result/${examId}`);

export default api;
