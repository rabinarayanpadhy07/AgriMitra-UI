import api from './api';

const clean = (params = {}) => {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  });
  return out;
};

export const adminCatalogService = {
  // Categories
  listCategories: async (params) => (await api.get('/api/admin/categories', { params: clean(params) })).data,
  getCategory: async (id) => (await api.get(`/api/admin/categories/${id}`)).data,
  createCategory: async (data) => (await api.post('/api/admin/categories', data)).data,
  updateCategory: async (id, data) => (await api.put(`/api/admin/categories/${id}`, data)).data,
  deleteCategory: async (id) => (await api.delete(`/api/admin/categories/${id}`)).data,
  activateCategory: async (id) => (await api.put(`/api/admin/categories/${id}/activate`)).data,
  deactivateCategory: async (id) => (await api.put(`/api/admin/categories/${id}/deactivate`)).data,

  // Products
  listProducts: async (params) => (await api.get('/api/admin/products', { params: clean(params) })).data,
  getProduct: async (id) => (await api.get(`/api/admin/products/${id}`)).data,
  createProduct: async (data) => (await api.post('/api/admin/products', data)).data,
  updateProduct: async (id, data) => (await api.put(`/api/admin/products/${id}`, data)).data,
  deleteProduct: async (id) => (await api.delete(`/api/admin/products/${id}`)).data,
  activateProduct: async (id) => (await api.put(`/api/admin/products/${id}/activate`)).data,
  deactivateProduct: async (id) => (await api.put(`/api/admin/products/${id}/deactivate`)).data,
  featureProduct: async (id) => (await api.put(`/api/admin/products/${id}/feature`)).data,
  unfeatureProduct: async (id) => (await api.put(`/api/admin/products/${id}/unfeature`)).data,

  // Inventory
  lowStock: async (params) => (await api.get('/api/admin/inventory/low-stock', { params: clean(params) })).data,
  outOfStock: async (params) => (await api.get('/api/admin/inventory/out-of-stock', { params: clean(params) })).data,
  transactions: async (params) => (await api.get('/api/admin/inventory/transactions', { params: clean(params) })).data,
  adjustStock: async (productId, data) => (await api.put(`/api/admin/inventory/products/${productId}/adjust`, data)).data,

  // Orders
  listOrders: async (params) => (await api.get('/api/admin/orders', { params: clean(params) })).data,
  getOrder: async (id) => (await api.get(`/api/admin/orders/${id}`)).data,
  updateOrderStatus: async (id, status) => (await api.put(`/api/admin/orders/${id}/status`, { status })).data,
  cancelOrder: async (id) => (await api.put(`/api/admin/orders/${id}/cancel`)).data,

  // Payments
  listPayments: async (params) => (await api.get('/api/admin/payments', { params: clean(params) })).data,
  updatePaymentStatus: async (id, status) => (await api.put(`/api/admin/payments/${id}/status`, { status })).data,

  // Reviews
  listReviews: async (params) => (await api.get('/api/admin/reviews', { params: clean(params) })).data,
  approveReview: async (id) => (await api.put(`/api/admin/reviews/${id}/approve`)).data,
  rejectReview: async (id) => (await api.put(`/api/admin/reviews/${id}/reject`)).data,
  deleteReview: async (id) => (await api.delete(`/api/admin/reviews/${id}`)).data,

  // Coupons
  listCoupons: async (params) => (await api.get('/api/admin/coupons', { params: clean(params) })).data,
  createCoupon: async (data) => (await api.post('/api/admin/coupons', data)).data,
  updateCoupon: async (id, data) => (await api.put(`/api/admin/coupons/${id}`, data)).data,
  deleteCoupon: async (id) => (await api.delete(`/api/admin/coupons/${id}`)).data,

  // Returns
  listReturns: async (params) => (await api.get('/api/admin/returns', { params: clean(params) })).data,
  updateReturnStatus: async (id, status) => (await api.put(`/api/admin/returns/${id}/status`, { status })).data,

  // Banners
  listBanners: async () => (await api.get('/api/admin/banners')).data,
  createBanner: async (data) => (await api.post('/api/admin/banners', data)).data,
  updateBanner: async (id, data) => (await api.put(`/api/admin/banners/${id}`, data)).data,
  deleteBanner: async (id) => (await api.delete(`/api/admin/banners/${id}`)).data,
  activateBanner: async (id) => (await api.put(`/api/admin/banners/${id}/activate`)).data,
  deactivateBanner: async (id) => (await api.put(`/api/admin/banners/${id}/deactivate`)).data,

  // Crops
  listCrops: async () => (await api.get('/api/admin/crops')).data,
  getCrop: async (id) => (await api.get(`/api/admin/crops/${id}`)).data,
  createCrop: async (data) => (await api.post('/api/admin/crops', data)).data,
  updateCrop: async (id, data) => (await api.put(`/api/admin/crops/${id}`, data)).data,
  deleteCrop: async (id) => (await api.delete(`/api/admin/crops/${id}`)).data,
  addCropStage: async (cropId, data) => (await api.post(`/api/admin/crops/${cropId}/stages`, data)).data,
  updateCropStage: async (cropId, stageId, data) => (await api.put(`/api/admin/crops/${cropId}/stages/${stageId}`, data)).data,
  deleteCropStage: async (cropId, stageId) => (await api.delete(`/api/admin/crops/${cropId}/stages/${stageId}`)).data,

  // Notifications
  listNotifications: async (params) => (await api.get('/api/admin/notifications', { params: clean(params) })).data,
  unreadNotificationCount: async () => (await api.get('/api/admin/notifications/unread-count')).data,
  markNotificationRead: async (id) => (await api.put(`/api/admin/notifications/${id}/read`)).data,
};
