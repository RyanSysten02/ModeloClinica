import axios from 'axios';

export const BASE_URL = 'http://localhost:5001'; 

const ApiConfig = axios.create({

  baseURL: `${BASE_URL}/api`,
});

ApiConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export { ApiConfig };