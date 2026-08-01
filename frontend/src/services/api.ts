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

export default api;
