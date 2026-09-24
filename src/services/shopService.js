import api from './api';

const clean = (params = {}) => {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  });
  return out;
};

export const shopService = {
  // Categories (public)
  getCategories: async () => (await api.get('/api/categories')).data,
  getCategory: async (id) => (await api.get(`/api/categories/${id}`)).data,

  // Products (public)
  getProducts: async (params) => (await api.get('/api/products', { params: clean(params) })).data,
  getProduct: async (id) => (await api.get(`/api/products/${id}`)).data,
  getProductReviews: async (id, params) => (await api.get(`/api/products/${id}/reviews`, { params: clean(params) })).data,

  // Banners / Crops (public)
  getActiveBanners: async () => (await api.get('/api/banners/active')).data,
  getCrops: async () => (await api.get('/api/crops')).data,
  getCrop: async (id) => (await api.get(`/api/crops/${id}`)).data,

  // Cart (authenticated)
  getCart: async () => (await api.get('/api/cart')).data,
  addToCart: async (productId, quantity = 1) => (await api.post('/api/cart/items', { productId, quantity })).data,
  updateCartItem: async (itemId, quantity) => (await api.put(`/api/cart/items/${itemId}`, { quantity })).data,
  removeCartItem: async (itemId) => (await api.delete(`/api/cart/items/${itemId}`)).data,

  // Wishlist (authenticated)
  getWishlist: async () => (await api.get('/api/wishlist')).data,
  addToWishlist: async (productId) => (await api.post(`/api/wishlist/${productId}`)).data,
  removeFromWishlist: async (productId) => (await api.delete(`/api/wishlist/${productId}`)).data,

  // Addresses (authenticated)
  getAddresses: async () => (await api.get('/api/addresses')).data,
  createAddress: async (data) => (await api.post('/api/addresses', data)).data,
  updateAddress: async (id, data) => (await api.put(`/api/addresses/${id}`, data)).data,
  deleteAddress: async (id) => (await api.delete(`/api/addresses/${id}`)).data,
  setDefaultAddress: async (id) => (await api.put(`/api/addresses/${id}/default`)).data,

  // Orders (authenticated)
  checkout: async (data) => (await api.post('/api/orders', data)).data,
  getMyOrders: async (params) => (await api.get('/api/orders', { params: clean(params) })).data,
  getMyOrder: async (id) => (await api.get(`/api/orders/${id}`)).data,
  cancelMyOrder: async (id) => (await api.put(`/api/orders/${id}/cancel`)).data,

  // Reviews (authenticated)
  submitReview: async (data) => (await api.post('/api/reviews', data)).data,

  // Returns (authenticated)
  requestReturn: async (data) => (await api.post('/api/returns', data)).data,
  getMyReturns: async (params) => (await api.get('/api/returns', { params: clean(params) })).data,

  // Razorpay Payment Gateway (authenticated / public config)
  getRazorpayConfig: async () => (await api.get('/api/payments/razorpay/config')).data,
  createRazorpayOrder: async (orderId) => (await api.post('/api/payments/razorpay/create-order', { orderId })).data,
  verifyRazorpayPayment: async (data) => (await api.post('/api/payments/razorpay/verify', data)).data,
};
