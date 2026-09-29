import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  HelpCircle,
  ChevronDown,
  Lock,
  LogOut,
  Building2,
  CheckCircle2,
  Sparkles,
  Menu
} from 'lucide-react';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  recall: 'Patient Recall',
  prescriptions: 'Prescriptions',
  'new-prescription': 'New Prescription',
  chambers: 'Doctor Chambers',
  appointments: 'Appointments',
  investigations: 'Investigations Catalog',
  doctors: 'Doctors & Commissions',
  samples: 'Sample Collection',
  'home-collection': 'Home Collection',
  'sendout-vendors': 'Send-Out Lab Vendors',
  inventory: 'Clinical Inventory',
  drugs: 'Drugs Directory',
  'report-templates': 'Report Templates',
  'lab-reports': 'Reports',
  'pharmacy-overview': 'Pharmacy Overview',
  'pharmacy-pos': 'Counter',
  'pharmacy-sales': 'Pharmacy Sales',
  'pharmacy-products': 'Pharmacy Products',
  'pharmacy-purchases': 'Pharmacy Purchases',
  'pharmacy-suppliers': 'Pharmacy Suppliers',
  'pharmacy-reports': 'Pharmacy Reports',
  invoices: 'Invoices & Billing',
  'new-invoice': 'New Diagnostic Invoice',
  payments: 'Payments Received',
  commissions: 'Doctor Referral Commissions',
  accounting: 'Accounting & Expenses',
  users: 'Users',
  roles: 'Roles & Permissions',
  subscription: 'Subscription',
  practice: 'Staff Practice Room',
  'action-inbox': "Owner's Action Inbox",
  tutorials: 'Tutorials',
  support: 'Support',
  settings: 'Center Settings'
};

export const Topbar: React.FC = () => {
  const { currentView, setCurrentView, tenantSettings, currentUser, setCurrentUser, showToast, toggleSidebar } = useApp();
  const { authUser, logout: authLogout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert('New password and confirm password do not match!');
      return;
    }
    setShowPasswordModal(false);
    showToast('Password updated successfully!');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    authLogout();
    setCurrentView('login');
    setShowProfileMenu(false);
  };

  // Dynamic Center Name & Avatar
  const activeTenantName = authUser?.tenant?.name || tenantSettings?.name || 'Diagnostic Center';

  const getInitials = (text: string, fallback = 'DC'): string => {
    if (!text) return fallback;
    const clean = text.trim();
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Admin Display Name: show actual Admin Name (NOT the center/tenant name like "medinova")
  const getAdminDisplayName = (): string => {
    const tenantSlug = authUser?.tenant?.slug?.toLowerCase();
    const tenantName = authUser?.tenant?.name?.toLowerCase();

    // 1. Check personal name first
    const candName = authUser?.name?.trim() || currentUser?.name?.trim();
    if (candName) {
      const lower = candName.toLowerCase();
      if ((!tenantSlug || lower !== tenantSlug) && (!tenantName || lower !== tenantName)) {
        return candName;
      }
    }

    // 2. Check username
    const rawUsername = authUser?.username?.trim() || currentUser?.username?.trim();
    if (rawUsername) {
      const lower = rawUsername.toLowerCase();
      if ((!tenantSlug || lower !== tenantSlug) && (!tenantName || lower !== tenantName)) {
        if (lower.endsWith('_admin')) {
          const prefix = rawUsername.slice(0, -6);
          if (prefix.toLowerCase() !== tenantSlug && prefix.toLowerCase() !== tenantName) {
            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
          }
        } else {
          return rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
        }
      }
    }

    return 'Administrator';
  };

  const formatRole = (role?: string): string => {
    if (!role) return 'Administrator';
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrator',
      ADMIN_L2: 'Operations Admin',
      TENANT_ADMIN: 'Administrator',
      CENTER_MANAGER: 'Center Manager',
      RECEPTIONIST: 'Receptionist',
      LAB_TECHNICIAN: 'Lab Technologist',
      DOCTOR: 'Consultant Doctor',
      PHARMACIST: 'Pharmacist',
      ACCOUNTANT: 'Accountant',
      PHLEBOTOMIST: 'Phlebotomist',
      STORE_MANAGER: 'Storekeeper',
    };
    return roleMap[role] || role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const adminDisplayName = getAdminDisplayName();
  const tenantInitials = getInitials(activeTenantName, 'DC');
  const adminInitials = getInitials(adminDisplayName, 'AD');

  return (
    <header className="topbar">
      {/* Left side */}
      <div className="topbar-left">
        <button
          className="mobile-menu-btn icon-btn"
          onClick={toggleSidebar}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div
          className="tenant-badge"
          onClick={() => setCurrentView('settings')}
          title={`${activeTenantName} (Click to manage Diagnostic Center Settings)`}
        >
          <div className="tenant-avatar">{tenantInitials}</div>
          <span className="tenant-title">{activeTenantName}</span>
          <ChevronDown size={14} color="#059669" style={{ flexShrink: 0, opacity: 0.8 }} />
        </div>

        <div className="page-title-crumb">
          <span>{VIEW_TITLES[currentView] || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="topbar-right">
        {/* Quick keyboard search indicator */}
        <div
          className="search-hint-pill"
          onClick={() => {
            setCurrentView('new-invoice');
            showToast('Ready to issue new diagnostic invoice');
          }}
          title="Click or press / to search and invoice"
        >
          <span>Search or New Bill</span>
          <kbd>/</kbd>
        </div>

        {/* Notification Bell */}
        <button
          className="icon-btn"
          title="Notifications"
          onClick={() => showToast('All laboratory instruments operational. No active alerts.')}
        >
          <Bell size={18} />
        </button>

        {/* Support Link */}
        <button
          className="icon-btn"
          title="Support & Feedback"
          onClick={() => setCurrentView('support')}
        >
          <HelpCircle size={18} />
        </button>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-pill"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={`Signed in as ${adminDisplayName} (${formatRole(authUser?.role || currentUser?.role)})`}
          >
            <div className="user-avatar">
              {adminInitials}
            </div>
            <div className="user-meta">
              <div className="user-name">{adminDisplayName}</div>
              <div className="user-role">{formatRole(authUser?.role || currentUser?.role)}</div>
            </div>
            <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                background: '#ffffff',
                border: '1px solid var(--slate-200)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                width: '240px',
                padding: '6px',
                zIndex: 100
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--slate-100)',
                  fontSize: '12px',
                  color: 'var(--slate-500)'
                }}
              >
                Signed in as{' '}
                <strong style={{ color: 'var(--slate-800)', display: 'block', fontSize: '13px' }}>
                  {adminDisplayName}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--slate-400)', display: 'block', marginTop: '2px' }}>
                  {formatRole(authUser?.role || currentUser?.role)} • {activeTenantName}
                </span>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--slate-100)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowPasswordModal(true);
                }}
              >
                <Lock size={15} color="#64748b" />
                Change Password
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--slate-100)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => {
                  setShowProfileMenu(false);
                  setCurrentView('settings');
                }}
              >
                <Building2 size={15} color="#64748b" />
                Diagnostic Center Profile
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--slate-100)',
                  margin: '4px 0'
                }}
              />

              <div
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#dc2626',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={handleSignOut}
              >
                <LogOut size={15} color="#dc2626" />
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Change Password</h3>
              <button className="icon-btn" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Current Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter current password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new strong password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
