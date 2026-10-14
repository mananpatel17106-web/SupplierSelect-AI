import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Enables sending and receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract backend error message if available
    const customMessage =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors.join(', ')) ||
      error.message ||
      'Network or server error';

    // Enhance error object with formatted message
    error.formattedMessage = customMessage;

    return Promise.reject(error);
  }
);

export default axiosInstance;
