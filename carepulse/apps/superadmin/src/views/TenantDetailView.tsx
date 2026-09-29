import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Building2, Users, CreditCard, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Shield, Trash2, X, AlertOctagon
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────
interface TenantDetail {
  id: string;
  name: string;
  bengaliName?: string;
  slug: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  phone?: string;
  email?: string;
  address?: string;
  planId?: string;
  planExpiresAt?: string;
  createdAt: string;
  plan?: { id: string; name: string; priceMonthly: number };
  modules: { moduleKey: string; isEnabled: boolean }[];
  users: { id: string; name: string; username: string; role: string; isActive: boolean }[];
  subscriptionPayments: {
    id: string; amount: number; method: string; status: string;
    billingCycle: string; paidAt: string;
    plan?: { name: string };
  }[];
  _count?: { users: number };
}

interface DynamicModuleItem {
  key: string;
  label: string;
  icon: string;
  category: string;
  isActive: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:    { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', label: 'Active' },
  TRIAL:     { bg: 'rgba(234,179,8,0.15)',  color: '#eab308', label: 'Trial' },
  SUSPENDED: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: 'Suspended' },
  EXPIRED:   { bg: 'rgba(107,114,128,0.15)',color: '#6b7280', label: 'Expired' },
};

const ROLE_LABELS: Record<string, string> = {
  TENANT_ADMIN: 'Admin', CENTER_MANAGER: 'Manager', RECEPTIONIST: 'Receptionist',
  LAB_TECHNICIAN: 'Lab Tech', DOCTOR: 'Doctor', PHARMACIST: 'Pharmacist',
  ACCOUNTANT: 'Accountant', PHLEBOTOMIST: 'Phlebotomist', STORE_MANAGER: 'Store',
};

// ─── Props ────────────────────────────────────────────────────
interface Props {
  tenantId: string;
  onBack: () => void;
}

export const TenantDetailView: React.FC<Props> = ({ tenantId, onBack }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [availableModules, setAvailableModules] = useState<DynamicModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'modules' | 'users' | 'payments'>('modules');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // 3-Step Danger Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3>(1);
  const [deleteReason, setDeleteReason] = useState('');
  const [slugConfirmationInput, setSlugConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchTenant = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [resTenant, resModules] = await Promise.all([
        api.get<{ data: { tenant: TenantDetail } }>(`/api/superadmin/tenants/${tenantId}`),
        api.get<{ data: { modules: DynamicModuleItem[] } }>('/api/superadmin/modules')
      ]);
      setTenant(resTenant.data.tenant);
      setAvailableModules(resModules.data.modules || []);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load tenant details');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const handleModuleToggle = async (moduleKey: string, currentEnabled: boolean) => {
    setTogglingModule(moduleKey);
    try {
      await api.patch(`/api/superadmin/tenants/${tenantId}/modules`, {
        moduleKey,
        isEnabled: !currentEnabled,
      });

      setTenant((prev) => {
        if (!prev) return prev;
        const exists = prev.modules.some((m) => m.moduleKey === moduleKey);
        const updated = exists
          ? prev.modules.map((m) => m.moduleKey === moduleKey ? { ...m, isEnabled: !currentEnabled } : m)
          : [...prev.modules, { moduleKey, isEnabled: !currentEnabled }];
        return { ...prev, modules: updated };
      });

      showToast(`Module "${moduleKey}" ${!currentEnabled ? 'enabled' : 'disabled'}`);
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Toggle failed');
    } finally {
      setTogglingModule(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/api/superadmin/tenants/${tenantId}/status`, { status: newStatus });
      setTenant((prev) => prev ? { ...prev, status: newStatus as TenantDetail['status'] } : prev);
      showToast(`Status updated to ${newStatus}`);
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteStep(1);
    setDeleteReason('');
    setSlugConfirmationInput('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    if (slugConfirmationInput.trim().toLowerCase() !== tenant.slug.toLowerCase()) {
      setDeleteError(`Slug does not match "${tenant.slug}". Please type carefully.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/api/superadmin/tenants/${tenant.id}`, {
        confirmationSlug: slugConfirmationInput.trim(),
        reason: deleteReason.trim(),
      });
      setIsDeleteModalOpen(false);
      showToast(`Diagnostic Center "${tenant.name}" has been permanently purged.`);
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete organization');
      setIsDeleting(false);
    }
  };

  const isModuleEnabled = (key: string) =>
    tenant?.modules.find((m) => m.moduleKey === key)?.isEnabled ?? false;

  const formatAmount = (n: number) => `৳${(n / 100).toLocaleString('en-BD')}`;
  const formatDate   = (d: string) => new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#94a3b8' }}>
        <RefreshCw size={20} className="spin" />
        Loading diagnostic center details...
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="empty-state" style={{ marginTop: 60 }}>
        <AlertTriangle size={40} color="#ef4444" />
        <p className="empty-state-title">{error || 'Diagnostic center not found'}</p>
        <button className="btn btn-secondary" onClick={onBack}>← Go Back</button>
      </div>
    );
  }

  const st = STATUS_COLORS[tenant.status] ?? STATUS_COLORS['TRIAL'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 10, padding: '12px 20px', color: '#f1f5f9',
          fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle size={16} color="#22c55e" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <button
          className="btn btn-ghost"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', marginTop: 2 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
              {tenant.name}
            </h2>
            {tenant.bengaliName && (
              <span style={{ color: '#94a3b8', fontSize: 14 }}>({tenant.bengaliName})</span>
            )}
            <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
              {st.label}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            slug: <code style={{ color: '#94a3b8' }}>{tenant.slug}</code>
            {tenant.plan && <> &nbsp;·&nbsp; Plan: <span style={{ color: '#3b82f6' }}>{tenant.plan.name}</span></>}
            {tenant.planExpiresAt && <> &nbsp;·&nbsp; Expires: {formatDate(tenant.planExpiresAt)}</>}
          </p>
        </div>

        {/* Status Change & Action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {tenant.status !== 'ACTIVE' && (
            <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => handleStatusChange('ACTIVE')} disabled={updatingStatus}>
              <CheckCircle size={14} /> Activate
            </button>
          )}
          {tenant.status !== 'SUSPENDED' && (
            <button className="btn btn-secondary" style={{ fontSize: 13, padding: '7px 14px', color: '#f59e0b' }}
              onClick={() => handleStatusChange('SUSPENDED')} disabled={updatingStatus}>
              <XCircle size={14} /> Suspend
            </button>
          )}
          {isSuperAdmin && (
            <button
              className="btn btn-danger"
              style={{ fontSize: 13, padding: '7px 14px', gap: 6 }}
              onClick={openDeleteModal}
            >
              <Trash2 size={14} /> Delete Center
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { icon: <Users size={18} />, label: 'Total Users', value: tenant.users.length },
          { icon: <Shield size={18} />, label: 'Active Modules', value: tenant.modules.filter((m) => m.isEnabled).length },
          { icon: <CreditCard size={18} />, label: 'Payments', value: tenant.subscriptionPayments.length },
          { icon: <Clock size={18} />, label: 'Member Since', value: formatDate(tenant.createdAt) },
        ].map((card) => (
          <div key={card.label} className="stat-card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, marginBottom: 6 }}>
              {card.icon} {card.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #1e293b', display: 'flex', gap: 0 }}>
        {(['modules', 'users', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab ? '#3b82f6' : '#64748b',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}
          >
            {tab === 'modules' ? `Modules (${availableModules.length})` : tab === 'users' ? `Users (${tenant.users.length})` : `Payments (${tenant.subscriptionPayments.length})`}
          </button>
        ))}
      </div>

      {/* ── Tab: Modules ────────────────────────────────────── */}
      {activeTab === 'modules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {availableModules.map((mod) => {
            const enabled  = isModuleEnabled(mod.key);
            const toggling = togglingModule === mod.key;
            return (
              <div
                key={mod.key}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', cursor: 'pointer',
                  border: `1px solid ${enabled ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                  background: enabled ? 'rgba(59,130,246,0.06)' : 'var(--bg-surface)',
                  transition: 'all 0.2s',
                }}
                onClick={() => !toggling && handleModuleToggle(mod.key, enabled)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{mod.icon || '📦'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: enabled ? '#f1f5f9' : '#64748b' }}>
                      {mod.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: enabled ? '#3b82f6' : '#475569', fontWeight: 500 }}>
                        {enabled ? 'Active for Center' : 'Disabled'}
                      </span>
                      <span style={{ fontSize: 10, background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: 3, color: 'var(--text-muted)' }}>
                        {mod.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ opacity: toggling ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  {enabled
                    ? <ToggleRight size={28} color="#3b82f6" />
                    : <ToggleLeft size={28} color="#475569" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Users ──────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tenant.users.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <Building2 size={32} color="#334155" />
              <p className="empty-state-sub">No users found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Name', 'Username', 'Role', 'Status'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenant.users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14, color: '#e2e8f0' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>@{u.username}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: u.isActive ? '#22c55e' : '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {u.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tab: Payments ───────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tenant.subscriptionPayments.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <CreditCard size={32} color="#334155" />
              <p className="empty-state-sub">No payment history</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Plan', 'Amount', 'Method', 'Cycle', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenant.subscriptionPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#e2e8f0' }}>{p.plan?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#22c55e' }}>{formatAmount(p.amount)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{p.method ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{p.billingCycle}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{formatDate(p.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Danger Zone Card (SUPER_ADMIN only) ─────────────── */}
      {isSuperAdmin && (
        <div
          className="card"
          style={{
            marginTop: 20,
            padding: 24,
            background: 'rgba(239,68,68,0.03)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontWeight: 700, fontSize: 15 }}>
              <AlertOctagon size={18} /> Danger Zone: Delete Organization
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, maxWidth: 600 }}>
              Permanently purges <strong>{tenant.name}</strong>, revoking access for all {tenant.users.length} users and cascading deletion across all clinical data, lab reports, invoices, and settings.
            </p>
          </div>

          <button className="btn btn-danger" onClick={openDeleteModal} style={{ gap: 6, padding: '9px 18px' }}>
            <Trash2 size={16} /> Permanently Delete Center
          </button>
        </div>
      )}

      {/* ── 3-Step Confirmation Modal ───────────────────────── */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isDeleting && setIsDeleteModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 540, border: '1px solid rgba(239,68,68,0.4)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="modal-title" style={{ color: 'var(--danger)', fontSize: 16 }}>
                    Permanent Deletion: Step {deleteStep} of 3
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Safety Confirmation Protocol
                  </div>
                </div>
              </div>
              <button
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecuteDelete}>
              <div className="modal-body" style={{ padding: '20px 24px' }}>
                {deleteError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      fontSize: 13,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={16} /> {deleteError}
                  </div>
                )}

                {/* Step 1: Warning & Impact Analysis */}
                {deleteStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Are you absolutely sure you want to delete {tenant.name}?
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                      This action <strong>CANNOT</strong> be undone. This operation will irrevocably destroy:
                    </p>

                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All <strong>{tenant.users.length} staff and administrator accounts</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All diagnostic test catalogs, sample records, and laboratory reports
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All financial ledgers, bills, invoices, and payment receipts
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All pharmacy inventories and doctor commissions
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Reason for Deletion */}
                {deleteStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Document Audit Reason
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                      Please provide an explanation for purging this diagnostic center (min 5 characters):
                    </p>
                    <textarea
                      className="form-input"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="e.g. Center closed operations, testing sandbox account, requested by owner..."
                      rows={3}
                      style={{ width: '100%', resize: 'none' }}
                      autoFocus
                    />
                  </div>
                )}

                {/* Step 3: Verification by Slug */}
                {deleteStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>
                      Final Safeguard Verification
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                      To confirm permanent purge, please type the center's exact slug{' '}
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#f87171',
                          background: 'rgba(239,68,68,0.15)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        {tenant.slug}
                      </span>{' '}
                      below:
                    </p>
                    <input
                      type="text"
                      className="form-input"
                      value={slugConfirmationInput}
                      onChange={(e) => setSlugConfirmationInput(e.target.value)}
                      placeholder={tenant.slug}
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        borderColor: slugConfirmationInput === tenant.slug ? '#ef4444' : undefined,
                      }}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {deleteStep > 1 ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setDeleteError(''); setDeleteStep((s) => (s - 1) as any); }}
                    disabled={isDeleting}
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                )}

                <div>
                  {deleteStep === 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setDeleteStep(2)}
                    >
                      I Understand the Impact →
                    </button>
                  )}

                  {deleteStep === 2 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        if (deleteReason.trim().length < 5) {
                          setDeleteError('Please provide a meaningful reason (at least 5 characters).');
                          return;
                        }
                        setDeleteError('');
                        setDeleteStep(3);
                      }}
                    >
                      Proceed to Slug Verification →
                    </button>
                  )}

                  {deleteStep === 3 && (
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={slugConfirmationInput.trim().toLowerCase() !== tenant.slug.toLowerCase() || isDeleting}
                    >
                      {isDeleting ? 'Purging All Records...' : 'PERMANENTLY DELETE ORGANIZATION'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
