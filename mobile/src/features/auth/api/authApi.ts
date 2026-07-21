import { api } from '@/services/api';
import { LoginFormData, RegisterFormData } from '../schemas/authSchemas';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthTokens> => {
    return await api.post('/auth/login', data, { skipAuth: true });
  },

  register: async (data: RegisterFormData): Promise<AuthTokens> => {
    const { confirmPassword, ...registerPayload } = data;
    return await api.post('/auth/register', registerPayload, { skipAuth: true });
  },

  getMe: async (): Promise<UserProfile> => {
    return await api.get('/auth/me');
  },

  updateProfile: async (payload: { full_name?: string; avatar_url?: string }): Promise<UserProfile> => {
    return await api.patch('/auth/me', payload);
  },
};
