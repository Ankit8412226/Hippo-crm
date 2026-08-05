import axios from 'axios';

const envUrl = (import.meta as any).env?.VITE_API_URL;
const API_BASE_URL = envUrl || 'https://hippo-crm-rho.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hippo_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise backend errors into a single friendly message and handle expired /
// invalid sessions globally (401 -> clear auth and bounce to login).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let friendlyMessage = data?.message || 'Something went wrong. Please try again.';
    if (data?.errors && typeof data.errors === 'object') {
      // Validation errors: { field: message } -> "message1, message2"
      friendlyMessage = Object.values(data.errors).join(', ');
    }
    if (status === 429) {
      friendlyMessage = data?.message || 'Too many attempts. Please wait and try again.';
    }
    error.friendlyMessage = friendlyMessage;

    if (status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('hippo_token');
      localStorage.removeItem('hippo_user');
      localStorage.removeItem('hippo_employee');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
