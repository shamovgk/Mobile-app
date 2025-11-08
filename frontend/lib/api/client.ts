import axios from 'axios';

// Читаем URL из переменной окружения
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для логирования запросов (только в dev режиме)
if (__DEV__) {
  apiClient.interceptors.request.use(
    (config) => {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.config.url}`, response.status);
      return response;
    },
    (error) => {
      console.error('❌ API Response Error:', error.message);
      return Promise.reject(error);
    }
  );
}
