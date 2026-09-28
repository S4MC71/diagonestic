/**
 * Task 5.2 — Tenant App Auth Context
 * Handles login/logout, token persistence, and /api/auth/me verification.
 * Sits alongside the existing AppContext — does NOT replace it.
 * AppContext still manages all UI state & mock-compatible data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setTokens, clearTokens, getToken } from '../lib/api';

// The shape returned by /api/auth/me
export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string;          // TENANT_ADMIN | RECEPTIONIST | LAB_TECHNICIAN | ...
  tenantId: string | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}

interface AuthContextType {
  authUser: AuthUser | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // On app mount — verify existing token
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsAuthLoading(false);
      return;
    }
    try {
      const res = await api.get<{ data: { user: AuthUser } }>('/api/auth/me');
      setAuthUser(res.data.user);
    } catch {
      clearTokens();
      setAuthUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (username: string, password: string): Promise<void> => {
    const res = await api.post<{
      data: { accessToken: string; refreshToken: string; user: AuthUser };
    }>('/api/auth/login', { username, password });

    const { accessToken, refreshToken, user } = res.data;

    // Tenant panel: block SUPER_ADMIN from logging in here
    if (user.role === 'SUPER_ADMIN') {
      throw new Error('Super Admins must use the SuperAdmin panel.');
    }

    setTokens(accessToken, refreshToken);
    setAuthUser(user);
  };

  const logout = () => {
    clearTokens();
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        isAuthLoading,
        isAuthenticated: authUser !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
