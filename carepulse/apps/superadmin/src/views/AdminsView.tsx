import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Search, Shield, UserCheck, CheckCircle, XCircle, Trash2, AlertCircle, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'ADMIN_L2';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export const AdminsView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN_L2'>('ALL');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN_L2' | 'SUPER_ADMIN'>('ADMIN_L2');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: { admins: AdminUser[] } }>('/api/superadmin/admins');
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || password.length < 8) {
      setFormError('Please fill in all required fields (password min 8 characters).');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/api/superadmin/admins', {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim() || undefined,
        password,
        role,
      });

      setIsCreateOpen(false);
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('ADMIN_L2');
      showToast(`Admin user "${username}" created successfully`);
      await fetchAdmins();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create admin user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    if (admin.id === currentUser?.id) {
      alert('You cannot change your own account status.');
      return;
    }

    const newStatus = !admin.isActive;
    // Optimistic update
    setAdmins((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, isActive: newStatus } : a))
    );

    try {
      await api.patch(`/api/superadmin/admins/${admin.id}/status`, {
        isActive: newStatus,
      });
      showToast(`Admin "${admin.username}" ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      // Revert on error
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, isActive: admin.isActive } : a))
      );
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.id === currentUser?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (!window.confirm(`Permanently remove administrator "${admin.name}" (@${admin.username})?`)) {
      return;
    }

    try {
      await api.delete(`/api/superadmin/admins/${admin.id}`);
      showToast(`Administrator "${admin.username}" deleted.`);
      await fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete admin');
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      (a.email && a.email.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || a.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const superAdminsCount = admins.filter((a) => a.role === 'SUPER_ADMIN').length;
  const adminL2Count = admins.filter((a) => a.role === 'ADMIN_L2').length;
  const activeCount = admins.filter((a) => a.isActive).length;

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never';

  return (
    <div className="view-container">
      {/* Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
            borderRadius: 10, padding: '12px 20px', color: 'var(--text-primary)',
            fontSize: 14, boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <CheckCircle size={16} color="var(--success)" /> {toastMsg}
        </div>
      )}

      {/* Header bar */}
      <div className="view-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="view-title" style={{ fontSize: 24, fontWeight: 700 }}>
              Administrator Accounts
            </h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              Role-Based Access
            </span>
          </div>
          <p className="view-subtitle" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage SuperAdmin executives and SuperAdmin Level 2 center operations managers.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => { setFormError(''); setIsCreateOpen(true); }} style={{ gap: 8 }}>
          <Plus size={16} />
          Create Admin User
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={14} color="#f59e0b" /> Full SuperAdmins
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
            {superAdminsCount}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={14} color="var(--accent)" /> Level 2 Admins
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
            {adminL2Count}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={14} color="var(--success)" /> Active Accounts
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)' }}>
            {activeCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 24,
          background: 'var(--bg-surface)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['ALL', 'SUPER_ADMIN', 'ADMIN_L2'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: roleFilter === r ? 'var(--accent)' : 'var(--bg-elevated)',
                color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
                border: roleFilter === r ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {r === 'ALL' ? 'All Roles' : r === 'SUPER_ADMIN' ? 'SuperAdmin' : 'Admin L2'}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Admins */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-surface)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: 'var(--text-secondary)' }}>
            <RefreshCw size={18} className="spin" /> Loading administrative team...
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No administrative users match your filter.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['User', 'Username', 'Role', 'Status', 'Last Active', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '12px 18px',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((adm) => {
                const isCurrent = adm.id === currentUser?.id;
                const isSA = adm.role === 'SUPER_ADMIN';

                return (
                  <tr key={adm.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isSA ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {adm.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {adm.name}
                            {isCurrent && (
                              <span style={{ fontSize: 10, background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4, color: 'var(--accent)' }}>
                                You
                              </span>
                            )}
                          </div>
                          {adm.email && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{adm.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
                      @{adm.username}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {isSA ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: 'rgba(245,158,11,0.12)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245,158,11,0.3)',
                          }}
                        >
                          <Shield size={12} /> SuperAdmin
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: 'rgba(59,130,246,0.12)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59,130,246,0.3)',
                          }}
                        >
                          <UserCheck size={12} /> Level 2 Admin
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleToggleStatus(adm)}
                        disabled={isCurrent}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: adm.isActive ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: adm.isActive ? 'var(--success)' : 'var(--danger)',
                          border: `1px solid ${adm.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          opacity: isCurrent ? 0.6 : 1,
                          cursor: isCurrent ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {adm.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {adm.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatDate(adm.lastLoginAt)}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {!isCurrent && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteAdmin(adm)}
                          title="Delete Administrator"
                          style={{ color: 'var(--danger)', padding: 6 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Role Comparison Card */}
      <div
        className="card"
        style={{
          marginTop: 24,
          padding: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyRound size={16} color="var(--accent)" /> Permission Structure
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>
              Level 2 Admin (Operations Manager)
            </div>
            <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 18, lineHeight: 1.8 }}>
              <li>✅ Create new diagnostic centers</li>
              <li>✅ Custom toggle modules on centers</li>
              <li>✅ View center details & staff list</li>
              <li>✅ Suspend or Activate diagnostic centers</li>
              <li>❌ <strong>Cannot</strong> delete diagnostic centers</li>
              <li>❌ <strong>Cannot</strong> modify pricing plans</li>
              <li>❌ <strong>Cannot</strong> create or delete modules</li>
              <li>❌ <strong>Cannot</strong> manage other administrators</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
              SuperAdmin (Executive Owner)
            </div>
            <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 18, lineHeight: 1.8 }}>
              <li>✅ Full unrestricted control across everything</li>
              <li>✅ Permanent cascade deletion of diagnostic centers</li>
              <li>✅ Creation & modification of subscription packages</li>
              <li>✅ Module registry creation and system keys</li>
              <li>✅ Provision and manage all administrative accounts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Create Admin User */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsCreateOpen(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <span className="modal-title">Provision Administrator</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsCreateOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariqul Anam"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. tariqul_op"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email (Optional)</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariqul@carepulse.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role Privilege *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div
                      onClick={() => setRole('ADMIN_L2')}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: role === 'ADMIN_L2' ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
                        border: role === 'ADMIN_L2' ? '2px solid var(--accent)' : '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>
                        <UserCheck size={16} /> Admin Level 2
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Create & customize centers. No delete or plan rights.
                      </p>
                    </div>

                    <div
                      onClick={() => setRole('SUPER_ADMIN')}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: role === 'SUPER_ADMIN' ? 'rgba(245,158,11,0.1)' : 'var(--bg-elevated)',
                        border: role === 'SUPER_ADMIN' ? '2px solid #f59e0b' : '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#f59e0b', fontSize: 13 }}>
                        <ShieldAlert size={16} /> SuperAdmin
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Full unrestricted access across all systems.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password * (min 8 characters)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
