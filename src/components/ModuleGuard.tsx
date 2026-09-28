/**
 * Task 5.3 — Module Guard
 * Fetches enabled modules from /api/tenant/modules and hides/shows
 * content based on whether a module is active for the tenant.
 *
 * Usage:
 *   <ModuleGuard moduleKey="pharmacy">
 *     <PharmacyView />
 *   </ModuleGuard>
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Module context (cache enabled modules globally) ─────────────────────────
interface ModuleConfig {
  enabled: boolean;
  config?: Record<string, unknown>;
}

interface ModuleContextType {
  modules: Record<string, ModuleConfig>;
  isModuleEnabled: (key: string) => boolean;
  isLoading: boolean;
  refetch: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [modules, setModules] = useState<Record<string, ModuleConfig>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    if (!isAuthenticated) {
      setModules({});
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get<{ data: { modules: Record<string, ModuleConfig> } }>(
        '/api/tenant/modules'
      );
      setModules(res.data.modules);
    } catch {
      setModules({});
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const isModuleEnabled = (key: string): boolean => {
    // If modules haven't loaded yet, optimistically allow to avoid flicker
    if (isLoading) return true;
    return modules[key]?.enabled === true;
  };

  return (
    <ModuleContext.Provider value={{ modules, isModuleEnabled, isLoading, refetch: fetchModules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export function useModules(): ModuleContextType {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error('useModules must be used within ModuleProvider');
  return ctx;
}

// ─── ModuleGuard Component ────────────────────────────────────────────────────
interface ModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback: React.FC<{ moduleKey: string }> = ({ moduleKey }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '12px',
      textAlign: 'center',
      padding: '32px',
    }}
  >
    <div style={{ fontSize: '48px' }}>🔒</div>
    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
      Module Not Available
    </h2>
    <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '380px', margin: 0 }}>
      The <strong>{moduleKey}</strong> module is not included in your current plan.
      Contact your administrator to upgrade your subscription.
    </p>
    <a
      href="#support"
      style={{
        marginTop: '8px',
        padding: '8px 20px',
        background: '#059669',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      Contact Support
    </a>
  </div>
);

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleKey,
  children,
  fallback,
}) => {
  const { isModuleEnabled, isLoading } = useModules();

  if (isLoading) return null; // Wait silently

  if (!isModuleEnabled(moduleKey)) {
    return <>{fallback ?? <DefaultFallback moduleKey={moduleKey} />}</>;
  }

  return <>{children}</>;
};
