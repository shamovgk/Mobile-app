import apiClient from '../client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
}

export const authApi = {
  login: async (dto: LoginDto) => {
    const response = await apiClient.post('/auth/login', dto);
    return response.data;
  },

  register: async (dto: RegisterDto) => {
    const response = await apiClient.post('/auth/register', dto);
    return response.data;
  },

  loginAsGuest: async () => {
    const response = await apiClient.post('/auth/guest');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  refreshTokens: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
