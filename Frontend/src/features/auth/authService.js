import axiosInstance from '../../api/axiosInstance';

const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosInstance.patch('/auth/change-password', passwordData);
    return response.data;
  },
};

export default authService;
