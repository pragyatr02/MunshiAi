import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Backend base URL from environment or localStorage override, default to http://127.0.0.1:8000
export const getApiBaseUrl = (): string => {
  const customUrl = localStorage.getItem('munshi_api_base_url');
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
};

export const setApiBaseUrl = (url: string) => {
  if (url && url.trim()) {
    localStorage.setItem('munshi_api_base_url', url.trim());
  } else {
    localStorage.removeItem('munshi_api_base_url');
  }
  api.defaults.baseURL = getApiBaseUrl();
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically update baseURL in case it was changed
    config.baseURL = getApiBaseUrl();
    
    const token = localStorage.getItem('munshi_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and 401 redirection
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem('munshi_token');
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('munshi:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const formatApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        // FastAPI validation errors
        return data.detail.map((d: { msg?: string; loc?: string[] }) => d.msg || JSON.stringify(d)).join(', ');
      }
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;
    }
    if (error.code === 'ERR_NETWORK') {
      return `Cannot connect to FastAPI backend at ${getApiBaseUrl()}. Please make sure the backend server is running on port 8000.`;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export default api;
