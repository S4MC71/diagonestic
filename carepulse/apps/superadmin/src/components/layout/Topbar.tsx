import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

interface TopbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  const { view, moduleKey, navigate } = useRouter();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Build breadcrumbs dynamically
  const renderBreadcrumbs = () => {
    switch (view) {
      case 'dashboard':
        return (
          <>
            <span className="breadcrumb-item current">Overview</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Executive Dashboard</span>
          </>
        );

      case 'tenants':
        return (
          <>
            <span className="breadcrumb-item">Tenants & Growth</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Diagnostic Centers</span>
          </>
        );

      case 'tenant-detail':
        return (
          <>
            <span className="breadcrumb-item clickable" onClick={() => navigate('/tenants')}>
              Diagnostic Centers
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Center Details</span>
          </>
        );

      case 'plans':
        return (
          <>
            <span className="breadcrumb-item">Tenants & Growth</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Plans & Billing</span>
          </>
        );

      case 'modules':
        return (
          <>
            <span className="breadcrumb-item">Platform Architecture</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Module Registry</span>
          </>
        );

      case 'module-builder':
        return (
          <>
            <span className="breadcrumb-item clickable" onClick={() => navigate('/modules')}>
              Module Registry
            </span>
            <span className="breadcrumb-separator">/</span>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: 'var(--accent-light)',
                background: 'var(--accent-glow)',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {moduleKey}
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current" style={{ color: 'var(--accent-light)' }}>
              Form Builder Studio
            </span>
          </>
        );

      case 'admins':
        return (
          <>
            <span className="breadcrumb-item">Platform Architecture</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Admin Team</span>
          </>
        );

      case 'support':
        return (
          <>
            <span className="breadcrumb-item">System</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">Help & Support</span>
          </>
        );

      case 'settings':
        return (
          <>
            <span className="breadcrumb-item">System</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">System Settings</span>
          </>
        );

      default:
        return <span className="breadcrumb-item current">CarePulse SuperAdmin</span>;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-collapse-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <nav className="breadcrumb" aria-label="Breadcrumb">
          {renderBreadcrumbs()}
        </nav>
      </div>

      <div className="topbar-right">
        {/* Environment / Security Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 99,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-light)" />
          <span>CarePulse Core</span>
        </div>

        {/* User Chip */}
        <div className="user-chip">
          <div className="user-chip-avatar">{getInitials(user?.name)}</div>
          <span className="user-chip-name">{user?.name?.split(' ')[0] || 'Admin'}</span>
          <span className="user-chip-role">
            {isSuperAdmin ? 'SUPER' : 'LEVEL 2'}
          </span>
        </div>
      </div>
    </header>
  );
};
