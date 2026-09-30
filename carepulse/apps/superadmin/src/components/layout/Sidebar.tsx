import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Headphones,
  Settings,
  LogOut,
  Shield,
  Boxes,
  Users2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

interface NavItemDef {
  key: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
}

const navItems: NavItemDef[] = [
  { key: 'dashboard', path: '/dashboard', label: 'Dashboard',   icon: <LayoutDashboard size={16} /> },
  { key: 'tenants',   path: '/tenants',   label: 'Tenants',     icon: <Building2 size={16} /> },
  { key: 'plans',     path: '/plans',     label: 'Plans',       icon: <CreditCard size={16} />, superAdminOnly: true },
  { key: 'modules',   path: '/modules',   label: 'Modules',     icon: <Boxes size={16} />,      superAdminOnly: true },
  { key: 'admins',    path: '/admins',    label: 'Admin Team',  icon: <Users2 size={16} />,     superAdminOnly: true },
  { key: 'support',   path: '/support',   label: 'Support',     icon: <Headphones size={16} /> },
  { key: 'settings',  path: '/settings',  label: 'Settings',    icon: <Settings size={16} /> },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const visibleItems = navItems.filter((item) => !item.superAdminOnly || isSuperAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        className="sidebar-logo"
        onClick={() => navigate('/dashboard')}
        style={{ cursor: 'pointer' }}
        title="Go to Dashboard"
      >
        <div className="sidebar-logo-icon">
          <Shield size={18} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">CarePulse</span>
          <span className="sidebar-logo-badge">
            {isSuperAdmin ? 'SuperAdmin' : 'Admin L2'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Management</span>
        {visibleItems.map((item) => {
          const isActive = item.key === 'tenants'
            ? (path === '/tenants' || path.startsWith('/tenants/'))
            : path === item.path;

          return (
            <button
              key={item.key}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          style={{
            padding: '10px 12px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{user?.name}</span>
            <span
              style={{
                fontSize: 10,
                padding: '1px 5px',
                borderRadius: 4,
                background: isSuperAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                color: isSuperAdmin ? '#f59e0b' : '#60a5fa',
                fontWeight: 700,
              }}
            >
              {isSuperAdmin ? 'SUPER' : 'L2'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user?.username}</div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ width: '100%' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
