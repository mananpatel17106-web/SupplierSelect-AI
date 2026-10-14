import axiosInstance from '../../api/axiosInstance';

const quotationService = {
  upload: async (formData, onUploadProgress) => {
    const response = await axiosInstance.post('/quotations/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data; // { success, statusCode, message, data: { quotation, processing } }
  },

  getByRequirement: async (requirementId) => {
    const response = await axiosInstance.get(`/quotations/requirement/${requirementId}`);
    return response.data; // { data: quotations[] }
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/quotations/${id}`);
    return response.data; // { data: quotation }
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/quotations/${id}`);
    return response.data;
  },
};

export default quotationService;
