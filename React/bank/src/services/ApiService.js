import axios from 'axios';
import { getJwtToken, clearJwtToken } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(config => {
  const token = getJwtToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearJwtToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
