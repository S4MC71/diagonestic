import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, setTokens, clearTokens, getToken } from '../lib/api';

interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: string;
  tenantId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Prevents checkAuth from clearing a freshly-set login state
  const justLoggedIn = useRef(false);

  // On mount: verify existing token
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get<{ data: { user: AuthUser } }>('/api/auth/me');
      const authUser = res.data.user;

      // Only allow SUPER_ADMIN in this panel
      if (authUser.role !== 'SUPER_ADMIN') {
        clearTokens();
        setUser(null);
      } else {
        setUser(authUser);
      }
    } catch {
      // Don't clear if we just logged in (race condition guard)
      if (!justLoggedIn.current) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<void> => {
    const res = await api.post<{ data: { accessToken: string; refreshToken: string; user: AuthUser } }>(
      '/api/auth/login',
      { username, password }
    );

    const { accessToken, refreshToken, user: loggedUser } = res.data;

    if (loggedUser.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied. This panel is for Super Admins only.');
    }

    justLoggedIn.current = true;
    setTokens(accessToken, refreshToken);
    setUser(loggedUser);
    setIsLoading(false);
    // Reset flag after a short delay
    setTimeout(() => { justLoggedIn.current = false; }, 2000);
  };

  const logout = () => {
    justLoggedIn.current = false;
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
