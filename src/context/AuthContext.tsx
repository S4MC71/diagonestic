/**
 * Task 5.2 — Tenant App Auth Context
 * Handles login/logout, token persistence, and /api/auth/me verification.
 * Sits alongside the existing AppContext — does NOT replace it.
 * AppContext still manages all UI state & mock-compatible data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setTokens, clearTokens, getToken } from '../lib/api';

// The shape returned by /api/auth/me and /api/auth/login
export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string; // TENANT_ADMIN | RECEPTIONIST | LAB_TECHNICIAN | ...
  tenantId: string | null;
  modules?: string[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    modules?: string[];
  } | null;
}

interface AuthContextType {
  authUser: AuthUser | null;
  modules: string[];
  hasModule: (moduleKey?: string) => boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('cp_auth_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.username === 'lifecare_admin' || parsed?.tenant?.slug === 'lifecare') {
        localStorage.removeItem('cp_auth_user');
        localStorage.removeItem('cp_modules');
        localStorage.removeItem('cp_tenant');
        clearTokens();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [modules, setModules] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cp_modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Helper to test if a given module is enabled for the logged-in tenant
  const hasModule = useCallback(
    (moduleKey?: string): boolean => {
      // If no moduleKey specified, it's a core universal item (Dashboard, Settings, etc.)
      if (!moduleKey) return true;
      return modules.includes(moduleKey);
    },
    [modules]
  );

  // On app mount — verify existing token
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsAuthLoading(false);
      return;
    }
    try {
      const res = await api.get<{ data: { user: AuthUser; modules?: string[] } }>('/api/auth/me');
      const user = res.data.user;
      const userModules = res.data.modules || user.modules || user.tenant?.modules || [];
      setAuthUser(user);
      setModules(userModules);
      localStorage.setItem('cp_auth_user', JSON.stringify(user));
      localStorage.setItem('cp_modules', JSON.stringify(userModules));
      if (user.tenant) {
        localStorage.setItem('cp_tenant', JSON.stringify(user.tenant));
      }
    } catch {
      clearTokens();
      localStorage.removeItem('cp_auth_user');
      localStorage.removeItem('cp_modules');
      localStorage.removeItem('cp_tenant');
      setAuthUser(null);
      setModules([]);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<void> => {
    const res = await api.post<{
      data: {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
        modules?: string[];
      };
    }>('/api/auth/login', { username, password });

    const { accessToken, refreshToken, user, modules: returnedModules } = res.data;

    // Tenant panel: block SUPER_ADMIN and ADMIN_L2 from logging in here
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_L2') {
      throw new Error('Super Admins must use the SuperAdmin panel.');
    }

    const userModules = returnedModules || user.modules || user.tenant?.modules || [];

    setTokens(accessToken, refreshToken);
    setAuthUser(user);
    setModules(userModules);

    localStorage.setItem('cp_auth_user', JSON.stringify(user));
    localStorage.setItem('cp_modules', JSON.stringify(userModules));
    if (user.tenant) {
      localStorage.setItem('cp_tenant', JSON.stringify(user.tenant));
    }
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem('cp_auth_user');
    localStorage.removeItem('cp_modules');
    localStorage.removeItem('cp_tenant');
    setAuthUser(null);
    setModules([]);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        modules,
        hasModule,
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
