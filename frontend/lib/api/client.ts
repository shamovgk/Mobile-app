import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - автоматический рефреш токенов
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и не retry yet - попробовать рефреш
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        
        if (refreshToken) {
          const { data } = await axios.post(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
          
          // Повторить оригинальный запрос с новым токеном
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Рефреш не удался - выйти
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    console.error(`❌ API Response Error:`, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
