import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

export type SuperAdminView =
  | 'dashboard'
  | 'tenants'
  | 'tenant-detail'
  | 'plans'
  | 'modules'
  | 'admins'
  | 'billing'
  | 'support'
  | 'settings'
  | 'login'
  | 'not-found';

export interface RouteState {
  path: string;
  view: SuperAdminView;
  tenantId?: string;
  securityNotice: string | null;
}

interface RouterContextType {
  path: string;
  view: SuperAdminView;
  tenantId?: string;
  securityNotice: string | null;
  clearSecurityNotice: () => void;
  navigate: (targetPath: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const SUPER_ADMIN_ONLY_VIEWS: Set<SuperAdminView> = new Set(['plans', 'modules', 'admins']);

/**
 * Validates and parses the pathname into a structured, safe view.
 * Prevents directory traversal, XSS in URL parameters, and unauthorized routes.
 */
function parsePath(rawPath: string): { view: SuperAdminView; tenantId?: string; normalizedPath: string } {
  // Normalize: strip search params, hashes, and trailing slashes
  const clean = (rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/').toLowerCase();

  if (clean === '/' || clean === '/dashboard') {
    return { view: 'dashboard', normalizedPath: '/dashboard' };
  }
  if (clean === '/tenants') {
    return { view: 'tenants', normalizedPath: '/tenants' };
  }

  // Deep route: /tenants/:id (allows alphanumeric, underscores, hyphens)
  const tenantMatch = rawPath.split('?')[0].split('#')[0].match(/^\/tenants\/([a-zA-Z0-9_-]{2,64})$/);
  if (tenantMatch) {
    const rawId = tenantMatch[1];
    return { view: 'tenant-detail', tenantId: rawId, normalizedPath: `/tenants/${rawId}` };
  }

  if (clean === '/plans') {
    return { view: 'plans', normalizedPath: '/plans' };
  }
  if (clean === '/modules') {
    return { view: 'modules', normalizedPath: '/modules' };
  }
  if (clean === '/admins') {
    return { view: 'admins', normalizedPath: '/admins' };
  }
  if (clean === '/support') {
    return { view: 'support', normalizedPath: '/support' };
  }
  if (clean === '/settings') {
    return { view: 'settings', normalizedPath: '/settings' };
  }
  if (clean === '/billing') {
    return { view: 'billing', normalizedPath: '/billing' };
  }
  if (clean === '/login') {
    return { view: 'login', normalizedPath: '/login' };
  }

  return { view: 'not-found', normalizedPath: clean };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/dashboard');
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  const clearSecurityNotice = useCallback(() => setSecurityNotice(null), []);

  /**
   * Internal URL navigation method using HTML5 History API.
   * Blocks open-redirect vulnerabilities by strictly validating internal paths.
   */
  const navigate = useCallback((targetPath: string, options?: { replace?: boolean }) => {
    // Security check: Must be an internal path starting with a single '/'
    if (!targetPath.startsWith('/') || targetPath.startsWith('//') || targetPath.includes('\\')) {
      targetPath = '/dashboard';
    }

    if (options?.replace) {
      window.history.replaceState(null, '', targetPath);
    } else {
      window.history.pushState(null, '', targetPath);
    }

    setCurrentPath(targetPath);
  }, []);

  // Listen for browser Back/Forward (popstate) actions
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse current route
  const parsed = useMemo(() => parsePath(currentPath), [currentPath]);

  // Security Guards: Authentication & Role-Based Access Control
  useEffect(() => {
    if (isLoading) return;

    // 1. Unauthenticated Guard
    if (!user) {
      if (parsed.view !== 'login') {
        // Save intended destination for post-login redirection
        if (currentPath !== '/' && currentPath !== '/dashboard') {
          sessionStorage.setItem('cp_sa_intended_path', currentPath);
        }
        window.history.replaceState(null, '', '/login');
        setCurrentPath('/login');
      }
      return;
    }

    // 2. Already Authenticated visiting /login
    if (user && parsed.view === 'login') {
      const intended = sessionStorage.getItem('cp_sa_intended_path');
      sessionStorage.removeItem('cp_sa_intended_path');
      const dest = intended && intended.startsWith('/') && !intended.startsWith('//') ? intended : '/dashboard';
      window.history.replaceState(null, '', dest);
      setCurrentPath(dest);
      return;
    }

    // 3. Role-Based Access Control (RBAC) Guard for SUPER_ADMIN only views
    if (user && user.role !== 'SUPER_ADMIN' && SUPER_ADMIN_ONLY_VIEWS.has(parsed.view)) {
      setSecurityNotice(`Access Denied: Section "/${parsed.view}" requires SuperAdmin privileges.`);
      window.history.replaceState(null, '', '/dashboard');
      setCurrentPath('/dashboard');
    }
  }, [user, isLoading, parsed.view, currentPath]);

  return (
    <RouterContext.Provider
      value={{
        path: currentPath,
        view: parsed.view,
        tenantId: parsed.tenantId,
        securityNotice,
        clearSecurityNotice,
        navigate,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
