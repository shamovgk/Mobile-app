import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string | null;
  displayName: string;
  avatar: string | null;
  isGuest: boolean;
  profile?: {
    totalXp: number;
    level: number;
    streak: number;
    lastPlayedAt: string | null;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // Установить токен в axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      login: async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        
        get().setTokens(data.accessToken, data.refreshToken);
        set({ user: data.user });
      },

      register: async (email, password, displayName) => {
        const { data } = await apiClient.post('/auth/register', {
          email,
          password,
          displayName,
        });
        
        get().setTokens(data.accessToken, data.refreshToken);
        set({ user: data.user });
      },

      loginAsGuest: async () => {
        const { data } = await apiClient.post('/auth/guest');
        
        get().setTokens(data.accessToken, data.refreshToken);
        set({ user: data.user });
      },

      logout: async () => {
        set({ user: null, accessToken: null, refreshToken: null });
        delete apiClient.defaults.headers.common['Authorization'];
      },

      // ✅ НОВОЕ: Обновить профиль пользователя
      refreshUserProfile: async () => {
        try {
          const { data } = await apiClient.get('/auth/profile');
          set({ user: data });
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      },

      // Инициализация при старте приложения
      initAuth: async () => {
        const { accessToken, refreshToken } = get();
        
        if (!accessToken) {
          set({ isLoading: false });
          return;
        }

        try {
          // Установить токен в axios
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Попытаться загрузить профиль
          const { data } = await apiClient.get('/auth/profile');
          set({ user: data, isLoading: false });
        } catch (error: any) {
          console.error('Auth init error:', error);
          
          // Если 401 - попробовать рефреш токен
          if (error.response?.status === 401 && refreshToken) {
            try {
              const { data } = await apiClient.post('/auth/refresh', { refreshToken });
              get().setTokens(data.accessToken, data.refreshToken);
              set({ user: data.user, isLoading: false });
            } catch (refreshError) {
              // Рефреш не удался - выйти
              await get().logout();
              set({ isLoading: false });
            }
          } else {
            await get().logout();
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
