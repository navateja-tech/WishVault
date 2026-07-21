import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  clearSession: () => Promise<void>;
  initSession: () => Promise<void>;
}

const TOKEN_KEY = 'univault_access_token';
const USER_KEY = 'univault_user_data';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: async (token: string, user: User) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      set({ accessToken: token, user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Error saving session', error);
    }
  },

  clearSession: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Error clearing session', error);
    }
  },

  initSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ accessToken: token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing session', error);
      set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
