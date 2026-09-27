import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

export const postService = {
  getAll: async (params) => {
    const response = await api.get('/posts', { params });
    return response.data.data;
  },
  getMyPosts: async (params) => {
    const response = await api.get('/posts/my-posts', { params });
    return response.data.data;
  },
  getPending: async (params) => {
    const response = await api.get('/posts/pending', { params });
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/posts/stats');
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data.data.post;
  },
  create: async (data) => {
    const response = await api.post('/posts', data);
    return response.data.data.post;
  },
  update: async (id, data) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data.data.post;
  },
  delete: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  submit: async (id) => {
    const response = await api.post(`/posts/${id}/submit`);
    return response.data.data.post;
  },
  approve: async (id) => {
    const response = await api.post(`/posts/${id}/approve`);
    return response.data.data.post;
  },
  reject: async (id, reason) => {
    const response = await api.post(`/posts/${id}/reject`, { reason });
    return response.data.data.post;
  },
};

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data.data.categories;
  },
  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data.data.category;
  },
  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data.category;
  },
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url;
  },
};

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data.data.users;
  },
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },
  getComments: async (id) => {
    const response = await api.get(`/users/${id}/comments`);
    return response.data.data.comments;
  },
  updateRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data.data.user;
  },
};

export const commentService = {
  getAll: async (params) => {
    const response = await api.get('/comments', { params });
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/comments/stats');
    return response.data.data;
  },
  getPending: async (params) => {
    const response = await api.get('/comments/pending', { params });
    return response.data.data;
  },
  getByPost: async (params) => {
    const response = await api.get('/comments/by-post', { params });
    return response.data.data;
  },
  getAdminPostComments: async (postId) => {
    const response = await api.get(`/comments/post/${postId}/admin`);
    return response.data.data.comments;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/comments/${id}/status`, { status });
    return response.data;
  },
  getByPostId: async (postId) => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data.data.comments;
  },
  delete: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

export const analyticsService = {
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data.data;
  },
  getPopularPosts: async (limit = 10) => {
    const response = await api.get('/analytics/popular-posts', { params: { limit } });
    return response.data.data.posts;
  },
  getEngagement: async (limit = 10) => {
    const response = await api.get('/analytics/engagement', { params: { limit } });
    return response.data.data.posts;
  },
  getCategories: async () => {
    const response = await api.get('/analytics/categories');
    return response.data.data.categories;
  },
  getReadDepth: async (postId) => {
    const response = await api.get(`/analytics/read-depth/${postId}`);
    return response.data.data;
  },
};

export const contactService = {
  getAll: async (params) => {
    const response = await api.get('/contacts/admin', { params });
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/contacts/admin/stats');
    return response.data.data.stats;
  },
  getById: async (id) => {
    const response = await api.get(`/contacts/admin/${id}`);
    return response.data.data.contact;
  },
  updateStatus: async (id, data) => {
    const response = await api.patch(`/contacts/admin/${id}/status`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/contacts/admin/${id}`);
    return response.data;
  },
};

export const newsletterService = {
  getSubscribers: async (params) => {
    const response = await api.get('/newsletter/admin/subscribers', { params });
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/newsletter/admin/stats');
    return response.data.data.stats;
  },
  getDeliveries: async (params) => {
    const response = await api.get('/newsletter/admin/deliveries', { params });
    return response.data.data;
  },
  unsubscribe: async (id) => {
    const response = await api.patch(`/newsletter/admin/subscribers/${id}/unsubscribe`);
    return response.data;
  },
  deleteSubscriber: async (id) => {
    const response = await api.delete(`/newsletter/admin/subscribers/${id}`);
    return response.data;
  },
};

