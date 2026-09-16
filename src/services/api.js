import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopeasy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: In case of 401 Unauthorized, automatically log out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage only if user was supposedly logged in
      if (localStorage.getItem('shopeasy_token')) {
        localStorage.removeItem('shopeasy_token');
        localStorage.removeItem('shopeasy_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
