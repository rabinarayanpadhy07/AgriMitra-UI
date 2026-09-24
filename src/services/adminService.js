import api from './api';

const buildParams = (params = {}) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },

  getRecentUsers: async () => {
    const response = await api.get('/api/admin/dashboard/recent-users');
    return response.data;
  },

  getRecentSellerApplications: async () => {
    const response = await api.get('/api/admin/dashboard/recent-seller-applications');
    return response.data;
  },

  // User management
  getUsers: async (params) => {
    const response = await api.get('/api/admin/users', { params: buildParams(params) });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },

  blockUser: async (id) => {
    const response = await api.put(`/api/admin/users/${id}/block`);
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await api.put(`/api/admin/users/${id}/unblock`);
    return response.data;
  },

  // Seller management
  getSellers: async (params) => {
    const response = await api.get('/api/admin/sellers', { params: buildParams(params) });
    return response.data;
  },

  getSellerById: async (id) => {
    const response = await api.get(`/api/admin/sellers/${id}`);
    return response.data;
  },

  approveSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/approve`);
    return response.data;
  },

  rejectSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/reject`);
    return response.data;
  },

  suspendSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/suspend`);
    return response.data;
  },

  reactivateSeller: async (id) => {
    const response = await api.put(`/api/admin/sellers/${id}/reactivate`);
    return response.data;
  },
};
