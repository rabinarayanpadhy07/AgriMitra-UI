import api from './api';

export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Login with Email or Mobile Number + Password
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Logout current user (invalidates session on backend)
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed or session already expired:', err);
    }
  },

  // Initiate password recovery by requesting an OTP
  forgotPassword: async (identifier) => {
    const response = await api.post('/api/auth/forgot-password', { identifier });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (identifier, otp) => {
    const response = await api.post('/api/auth/verify-otp', { identifier, otp });
    return response.data;
  },

  // Reset password using verified OTP
  resetPassword: async (resetData) => {
    const response = await api.post('/api/auth/reset-password', resetData);
    return response.data;
  },

  // Change password for logged-in user
  changePassword: async (passwordData) => {
    const response = await api.put('/api/auth/change-password', passwordData);
    return response.data;
  },

  // Get current authenticated user profile
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  // Get active sessions
  getSessions: async () => {
    const response = await api.get('/api/user/sessions');
    return response.data;
  },

  // Request seller access (creates a PENDING seller application for admin review)
  applyForSellerStatus: async () => {
    const response = await api.post('/api/user/seller-application');
    return response.data;
  },
};
