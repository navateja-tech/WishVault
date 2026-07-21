import * as SecureStore from 'expo-secure-store';
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
  const state = useAuthStore.getState();
  const tokenUrl = `${API_BASE_URL}/auth/refresh`;

  const userStr = await SecureStore.getItemAsync('univault_user_data');
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
  await state.setSession(tokens.access_token, user, tokens.refresh_token);

  return tokens;
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'GET' }),
  post: (path: string, json?: any, options?: RequestOptions) => request(path, { ...options, method: 'POST', json }),
  patch: (path: string, json?: any, options?: RequestOptions) => request(path, { ...options, method: 'PATCH', json }),
  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'DELETE' }),
};
export { ApiError };
