import axiosInstance from '../../api/axiosInstance';

const requirementService = {
  getAll: async () => {
    const response = await axiosInstance.get('/requirements');
    return response.data; // { success, statusCode, message, data: [] }
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/requirements/${id}`);
    return response.data;
  },

  create: async (requirementData) => {
    const response = await axiosInstance.post('/requirements', requirementData);
    return response.data;
  },

  update: async (id, requirementData) => {
    const response = await axiosInstance.patch(`/requirements/${id}`, requirementData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/requirements/${id}`);
    return response.data;
  },
};

export default requirementService;
