import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  'lab-reports': 'Lab Reports',
  'pharmacy-overview': 'Pharmacy Overview',
  'pharmacy-pos': 'Pharmacy Counter (POS)',
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
  users: 'Users Management',
  roles: 'Roles & Permissions',
  subscription: 'Subscription & License',
  support: 'Support & Feedback',
  settings: 'Center Settings'
};

export const Topbar: React.FC = () => {
  const { currentView, setCurrentView, tenantSettings, currentUser, setCurrentUser, showToast, toggleSidebar } = useApp();
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
    setCurrentView('login');
    setShowProfileMenu(false);
  };

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

        <div className="tenant-badge" onClick={() => setCurrentView('settings')}>
          <div className="tenant-avatar">JD</div>
          <span className="tenant-title">{tenantSettings.name}</span>
          <ChevronDown size={14} color="#64748b" />
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
          >
            <div className="user-avatar">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'JH'}
            </div>
            <div className="user-meta">
              <div className="user-name">{currentUser?.username || 'jhalakathid_admin'}</div>
              <div className="user-role">{currentUser?.role || 'Global Tenant Admin'}</div>
            </div>
            <ChevronDown size={14} color="#64748b" />
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
                width: '230px',
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
                <strong style={{ color: 'var(--slate-800)', display: 'block' }}>
                  {currentUser?.username || 'jhalakathid_admin'}
                </strong>
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
