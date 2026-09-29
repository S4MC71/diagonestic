import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Building2, Users, CreditCard, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Shield,
} from 'lucide-react';
import { api } from '../lib/api';

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

const MODULE_LIST = [
  { key: 'patients',        label: 'Patients',         icon: '👥' },
  { key: 'clinical',        label: 'Clinical',         icon: '🩺' },
  { key: 'lab',             label: 'Laboratory',       icon: '🔬' },
  { key: 'pharmacy',        label: 'Pharmacy',         icon: '💊' },
  { key: 'home_collection', label: 'Home Collection',  icon: '🏠' },
  { key: 'send_out',        label: 'Send-Out Lab',     icon: '📦' },
  { key: 'finance',         label: 'Finance',          icon: '💰' },
  { key: 'commissions',     label: 'Commissions',      icon: '🤝' },
  { key: 'inventory',       label: 'Inventory',        icon: '📋' },
  { key: 'accounting',      label: 'Accounting',       icon: '📊' },
  { key: 'recall',          label: 'Recall',           icon: '🔔' },
  { key: 'whatsapp',        label: 'WhatsApp',         icon: '💬' },
];

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
  const [tenant, setTenant]           = useState<TenantDetail | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [toastMsg, setToastMsg]       = useState('');
  const [activeTab, setActiveTab]     = useState<'modules' | 'users' | 'payments'>('modules');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchTenant = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get<{ data: { tenant: TenantDetail } }>(`/api/superadmin/tenants/${tenantId}`);
      setTenant(res.data.tenant);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load tenant');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchTenant(); }, [fetchTenant]);

  const handleModuleToggle = async (moduleKey: string, currentEnabled: boolean) => {
    if (togglingModule) return;
    setTogglingModule(moduleKey);
    try {
      await api.patch(`/api/superadmin/tenants/${tenantId}/modules`, {
        moduleKey,
        isEnabled: !currentEnabled,
      });
      setTenant((prev) => {
        if (!prev) return prev;
        const existing = prev.modules.find((m) => m.moduleKey === moduleKey);
        if (existing) {
          return {
            ...prev,
            modules: prev.modules.map((m) =>
              m.moduleKey === moduleKey ? { ...m, isEnabled: !currentEnabled } : m
            ),
          };
        }
        return {
          ...prev,
          modules: [...prev.modules, { moduleKey, isEnabled: !currentEnabled }],
        };
      });
      showToast(`${moduleKey} ${!currentEnabled ? 'enabled' : 'disabled'}`);
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Toggle failed');
    } finally {
      setTogglingModule(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (updatingStatus) return;
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

  const isModuleEnabled = (key: string) =>
    tenant?.modules.find((m) => m.moduleKey === key)?.isEnabled ?? false;

  const formatAmount = (n: number) => `৳${(n / 100).toLocaleString('en-BD')}`;
  const formatDate   = (d: string) => new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#94a3b8' }}>
        <RefreshCw size={20} className="spin" />
        Loading tenant details...
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="empty-state" style={{ marginTop: 60 }}>
        <AlertTriangle size={40} color="#ef4444" />
        <p className="empty-state-title">{error || 'Tenant not found'}</p>
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

        {/* Status Change */}
        <div style={{ display: 'flex', gap: 8 }}>
          {tenant.status !== 'ACTIVE' && (
            <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => handleStatusChange('ACTIVE')} disabled={updatingStatus}>
              <CheckCircle size={14} /> Activate
            </button>
          )}
          {tenant.status !== 'SUSPENDED' && (
            <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => handleStatusChange('SUSPENDED')} disabled={updatingStatus}>
              <XCircle size={14} /> Suspend
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
            {tab === 'modules' ? `Modules (${MODULE_LIST.length})` : tab === 'users' ? `Users (${tenant.users.length})` : `Payments (${tenant.subscriptionPayments.length})`}
          </button>
        ))}
      </div>

      {/* ── Tab: Modules ────────────────────────────────────── */}
      {activeTab === 'modules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {MODULE_LIST.map(({ key, label, icon }) => {
            const enabled  = isModuleEnabled(key);
            const toggling = togglingModule === key;
            return (
              <div
                key={key}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', cursor: 'pointer',
                  border: `1px solid ${enabled ? 'rgba(59,130,246,0.3)' : '#1e293b'}`,
                  background: enabled ? 'rgba(59,130,246,0.05)' : '#111827',
                  transition: 'all 0.2s',
                }}
                onClick={() => !toggling && handleModuleToggle(key, enabled)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: enabled ? '#f1f5f9' : '#64748b' }}>{label}</div>
                    <div style={{ fontSize: 11, color: enabled ? '#3b82f6' : '#475569' }}>
                      {enabled ? 'Enabled' : 'Disabled'}
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
    </div>
  );
};
