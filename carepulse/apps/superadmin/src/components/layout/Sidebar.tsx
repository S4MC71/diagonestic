import React from 'react';
import {
  LayoutDashboard, Building2, CreditCard, Headphones, Settings, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type View = 'dashboard' | 'tenants' | 'plans' | 'billing' | 'support' | 'settings';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems: { key: View; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
  { key: 'tenants',   label: 'Tenants',    icon: <Building2 size={16} /> },
  { key: 'plans',     label: 'Plans',      icon: <CreditCard size={16} /> },
  { key: 'support',   label: 'Support',    icon: <Headphones size={16} /> },
  { key: 'settings',  label: 'Settings',   icon: <Settings size={16} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={18} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">CarePulse</span>
          <span className="sidebar-logo-badge">SuperAdmin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Management</span>
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${currentView === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.username}</div>
        </div>
        <button className="nav-item" onClick={logout} style={{ width: '100%' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
