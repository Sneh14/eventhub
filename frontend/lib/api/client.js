import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('eventhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
// Unwraps Axios envelope so callers receive the API response body directly:
// { success, data, pagination? }
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('eventhub_token');
      window.location.href = '/login';
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const enhanced = new Error(message);
    enhanced.status = error.response?.status;
    enhanced.data   = error.response?.data;
    return Promise.reject(enhanced);
  },
);

export { apiClient, BASE_URL };
export default apiClient;
