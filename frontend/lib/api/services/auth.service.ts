import { apiClient } from '../client';

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    displayName: string;
    avatar: string | null;
    isGuest: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      displayName,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  loginAsGuest: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/guest');
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },
};
