import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject tenantId into URLs that need it
    const tenantStorage = localStorage.getItem('tenant-storage');
    if (tenantStorage) {
      try {
        const { state } = JSON.parse(tenantStorage);
        const currentTenant = state?.currentTenant;

        if (currentTenant?.id && config.url) {
          // List of endpoints that need tenantId prefix
          const tenantEndpoints = ['/members', '/projects', '/events', '/contributions', '/payments'];

          // Check if URL starts with any tenant endpoint
          const needsTenant = tenantEndpoints.some(endpoint =>
            config.url?.startsWith(endpoint)
          );

          if (needsTenant) {
            // Inject tenantId: /members -> /associations/:tenantId/members
            config.url = `/associations/${currentTenant.id}${config.url}`;
          }
        }
      } catch (e) {
        console.error('Failed to inject tenantId:', e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const message = error.response.data?.message || 'Une erreur est survenue';
      toast.error(message);
    } else if (error.request) {
      toast.error('Impossible de contacter le serveur');
    }

    return Promise.reject(error);
  },
);

export default api;
