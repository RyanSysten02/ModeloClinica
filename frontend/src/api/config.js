import axios from 'axios';

const ApiConfig = axios.create({
  baseURL: 'http://localhost:5001/api',
});

ApiConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { ApiConfig };
