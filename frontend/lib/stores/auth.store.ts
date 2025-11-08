// lib/stores/auth.store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email?: string;
  displayName: string;
  isGuest: boolean;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  token: null,

  initAuth: async () => {
    try {
      // Проверить сохранённый токен в AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      
      if (token) {
        // Установить token в заголовки
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Проверить профиль
        const response = await apiClient.get('/auth/profile');
        set({ 
          user: response.data, 
          token,
          isLoading: false 
        });
      } else {
        // Нет токена - переход в auth
        set({ 
          user: null, 
          token: null,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Auth init error:', error);
      // Очистить всё при ошибке
      await AsyncStorage.removeItem('auth_token');
      apiClient.defaults.headers.common['Authorization'] = '';
      set({ 
        user: null, 
        token: null,
        isLoading: false 
      });
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;

      // Сохранить токен
      await AsyncStorage.setItem('auth_token', accessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      set({ user, token: accessToken });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email, password, displayName) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        displayName,
      });
      const { user, accessToken } = response.data;

      await AsyncStorage.setItem('auth_token', accessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      set({ user, token: accessToken });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  loginAsGuest: async () => {
    try {
      const response = await apiClient.post('/auth/guest');
      const { user, accessToken } = response.data;

      await AsyncStorage.setItem('auth_token', accessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      set({ user, token: accessToken });
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    apiClient.defaults.headers.common['Authorization'] = '';
    set({ user: null, token: null });
  },
}));
