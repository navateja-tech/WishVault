import { useAuthStore } from '@/features/auth/store/authStore';

// Access EXPO_PUBLIC_API_URL or default to localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  json?: any;
  skipAuth?: boolean;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  // Add Auth Token
  const state = useAuthStore.getState();
  if (state.accessToken && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${state.accessToken}`);
  }

  // Set defaults
  if (options.json) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.json);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized (Expired token)
    if (response.status === 401 && !options.skipAuth && state.accessToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const freshTokens = await refreshSession();
          isRefreshing = false;
          onRefreshed(freshTokens.access_token);
        } catch (refreshErr) {
          isRefreshing = false;
          await state.clearSession();
          throw new ApiError(401, 'Session expired. Please log in again.');
        }
      }

      // Wait for refresh to complete and retry the request
      const retryPromise = new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      const newToken = await retryPromise;
      headers.set('Authorization', `Bearer ${newToken}`);
      const retryResponse = await fetch(url, { ...config, headers });
      return await handleResponse(retryResponse);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Network request failed. Please check your connection.');
  }
}

async function handleResponse(response: Response) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }

  if (!response.ok) {
    const message = data.detail || data.message || 'An error occurred';
    throw new ApiError(response.status, message, data);
  }

  return data;
}

async function refreshSession(): Promise<{ access_token: string; refresh_token: string }> {
  // Retrieve refresh token from SecureStore or state
  const state = useAuthStore.getState();
  // Fetch refresh token from secure store via authStore structure, or if we need a direct SecureStore read:
  const tokenUrl = `${API_BASE_URL}/auth/refresh`;
  
  // Since tokens are stored in SecureStore via authStore keys, we load the refresh token
  // For safety, let's grab it via secure store import
  const SecureStore = require('expo-secure-store');
  const userStr = await SecureStore.getItemAsync('univault_user_data');
  const refreshToken = await SecureStore.getItemAsync('univault_access_token'); // In our authStore setSession we save the access token, let's verify what keys we used.
  
  // Wait, let's check what we did in `authStore.ts` setSession:
  // we did:
  // await SecureStore.setItemAsync('univault_access_token', token);
  // await SecureStore.setItemAsync('univault_user_data', JSON.stringify(user));
  // Wait! In Milestone 1, we returned both `access_token` and `refresh_token`.
  // But in our Zustand store, we didn't save the `refresh_token` to SecureStore yet!
  // Let's make sure our Zustand store saves both access_token and refresh_token so that we can refresh correctly!
  // Let's read the store's current logic and modify it if needed.
  // Actually, let's check what tokens we store: we should store refresh_token in SecureStore as 'univault_refresh_token'.
  const savedRefreshToken = await SecureStore.getItemAsync('univault_refresh_token');

  if (!savedRefreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: savedRefreshToken }),
  });

  if (!response.ok) {
    throw new Error('Refresh token invalid');
  }

  const tokens = await response.json();
  const user = userStr ? JSON.parse(userStr) : state.user;
  
  // Save new session
  await state.setSession(tokens.access_token, user);
  await SecureStore.setItemAsync('univault_refresh_token', tokens.refresh_token);

  return tokens;
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'GET' }),
  post: (path: string, json?: any, options?: RequestOptions) => request(path, { ...options, method: 'POST', json }),
  patch: (path: string, json?: any, options?: RequestOptions) => request(path, { ...options, method: 'PATCH', json }),
  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'DELETE' }),
};
export { ApiError };
