import axiosInstance from '../../api/axiosInstance';

const analysisService = {
  runAnalysis: async (requirementId) => {
    const response = await axiosInstance.post(`/analysis/requirement/${requirementId}/run`);
    return response.data; // { success, statusCode, message, data: { suppliers, recommendation } }
  },

  getByRequirement: async (requirementId) => {
    const response = await axiosInstance.get(`/analysis/requirement/${requirementId}`);
    return response.data; // { data: quotation_analysis[] }
  },

  getByQuotation: async (quotationId) => {
    const response = await axiosInstance.get(`/analysis/quotation/${quotationId}`);
    return response.data; // { data: quotation_analysis }
  },
};

export default analysisService;
