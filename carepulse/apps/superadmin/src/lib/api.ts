/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'cp_sa_token';
const REFRESH_KEY = 'cp_sa_refresh';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });

  // Token expired — attempt refresh once
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
    } else {
      // Refresh failed — force logout
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }

  return json as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
};
