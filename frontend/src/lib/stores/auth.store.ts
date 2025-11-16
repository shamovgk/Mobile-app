// frontend/src/lib/stores/auth.store.ts
import { create } from 'zustand';
import { User, AuthState, UserProfile } from './auth.types';

interface ExtendedAuthState extends AuthState {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const useAuthStore = create<ExtendedAuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  
  setAuth: (user, accessToken, refreshToken) => {
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },
  
  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
  },

  setUser: (user) => {
    set({ user });
  },
  
  logout: async () => {
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  refreshUserProfile: async () => {
    try {
      const { accessToken } = get();
      if (!accessToken) return;

      // TODO: Добавить API запрос для обновления профиля
      // const response = await apiClient.get('/auth/profile');
      // set({ user: response.data });
      
      console.log('Profile refreshed');
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  },
}));
