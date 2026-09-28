/**
 * Task 5.4 — Role Guard (Frontend)
 * Shows content only if current user has one of the allowed roles.
 *
 * Usage:
 *   <RoleGuard allowedRoles={['TENANT_ADMIN', 'ACCOUNTANT']}>
 *     <AccountingView />
 *   </RoleGuard>
 *
 *   // Inline hide (no fallback):
 *   <RoleGuard allowedRoles={['TENANT_ADMIN']} fallback={null}>
 *     <DeleteButton />
 *   </RoleGuard>
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  /** What to show when role doesn't match. Default: access denied card. Pass null to render nothing. */
  fallback?: React.ReactNode;
}

const DefaultDenied: React.FC = () => (
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
    <div style={{ fontSize: '48px' }}>⛔</div>
    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
      Access Denied
    </h2>
    <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '360px', margin: 0 }}>
      You don't have permission to view this section. Contact your admin if you think this is a mistake.
    </p>
  </div>
);

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { authUser, isAuthLoading } = useAuth();

  if (isAuthLoading) return null;

  const hasRole = authUser && allowedRoles.includes(authUser.role);

  if (!hasRole) {
    if (fallback === null) return null;
    return <>{fallback ?? <DefaultDenied />}</>;
  }

  return <>{children}</>;
};

// ─── Convenience hook ─────────────────────────────────────────────────────────
export function useRole(): string | null {
  const { authUser } = useAuth();
  return authUser?.role ?? null;
}

export function useHasRole(roles: string[]): boolean {
  const { authUser } = useAuth();
  return authUser ? roles.includes(authUser.role) : false;
}
