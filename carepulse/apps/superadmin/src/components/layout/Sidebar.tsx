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
  Users2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

interface NavItemDef {
  key: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
  matchPrefix?: string;
}

interface NavGroup {
  label: string;
  items: NavItemDef[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Tenants & Growth',
    items: [
      {
        key: 'tenants',
        path: '/tenants',
        label: 'Diagnostic Centers',
        icon: <Building2 size={18} />,
        matchPrefix: '/tenants',
      },
      {
        key: 'plans',
        path: '/plans',
        label: 'Plans & Billing',
        icon: <CreditCard size={18} />,
        superAdminOnly: true,
      },
    ],
  },
  {
    label: 'Platform Architecture',
    items: [
      {
        key: 'modules',
        path: '/modules',
        label: 'Module Registry',
        icon: <Boxes size={18} />,
        superAdminOnly: true,
        matchPrefix: '/modules',
      },
      {
        key: 'admins',
        path: '/admins',
        label: 'Admin Team',
        icon: <Users2 size={18} />,
        superAdminOnly: true,
      },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'support', path: '/support', label: 'Help & Support', icon: <Headphones size={18} /> },
      { key: 'settings', path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Logo Header */}
      <div
        className="sidebar-logo"
        onClick={() => navigate('/dashboard')}
        title="Go to Dashboard"
      >
        <div className="sidebar-logo-icon">
          <Shield size={19} color="#ffffff" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">CarePulse</span>
          <span className="sidebar-logo-badge">
            {isSuperAdmin ? 'SuperAdmin' : 'Admin L2'}
          </span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} style={{ marginBottom: 4 }}>
              <div className="sidebar-section-label">{group.label}</div>
              {visibleItems.map((item) => {
                const isActive = item.matchPrefix
                  ? path === item.path || path.startsWith(item.matchPrefix)
                  : path === item.path;

                return (
                  <button
                    key={item.key}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    data-tooltip={item.label}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    <span className="nav-item-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Area with Collapse Toggle & User Profile */}
      <div className="sidebar-footer">
        {onToggleCollapse && (
          <button
            className="nav-item"
            onClick={onToggleCollapse}
            style={{ marginBottom: 6, justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            data-tooltip={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className="nav-item-label">Collapse Menu</span>
          </button>
        )}

        {!collapsed && (
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Administrator'}
              </span>
              <span
                style={{
                  fontSize: 9,
                  padding: '1px 6px',
                  borderRadius: 99,
                  background: isSuperAdmin ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)',
                  color: isSuperAdmin ? 'var(--accent-light)' : 'var(--info)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                {isSuperAdmin ? 'SUPER' : 'L2'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              @{user?.username}
            </div>
          </div>
        )}

        <button
          className="nav-item"
          onClick={handleLogout}
          data-tooltip="Sign Out"
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            color: 'var(--danger)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={16} />
          <span className="nav-item-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
