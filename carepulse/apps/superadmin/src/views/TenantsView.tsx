import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, RefreshCw, X, Building2,
  ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Tenant {
  id: string;
  slug: string;
  name: string;
  bengaliName?: string;
  phone?: string;
  email?: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  plan?: { id: string; name: string } | null;
  planExpiresAt?: string;
  userCount: number;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  modules: string[];
}

interface TenantDetail extends Tenant {
  modules: { moduleKey: string; isEnabled: boolean }[];
  users: { id: string; name: string; username: string; role: string; isActive: boolean }[];
}

// ─── Module definitions ───────────────────────────────────────────────────
const ALL_MODULES = [
  { key: 'patients',        label: 'Patients' },
  { key: 'clinical',        label: 'Clinical' },
  { key: 'lab',             label: 'Laboratory' },
  { key: 'pharmacy',        label: 'Pharmacy' },
  { key: 'home_collection', label: 'Home Collection' },
  { key: 'send_out',        label: 'Send-Out Lab' },
  { key: 'finance',         label: 'Finance' },
  { key: 'commissions',     label: 'Commissions' },
  { key: 'inventory',       label: 'Inventory' },
  { key: 'accounting',      label: 'Accounting' },
  { key: 'recall',          label: 'Recall' },
  { key: 'whatsapp',        label: 'WhatsApp' },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active', TRIAL: 'Trial', SUSPENDED: 'Suspended', EXPIRED: 'Expired',
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: 'badge-active', TRIAL: 'badge-blue', SUSPENDED: 'badge-suspended', EXPIRED: 'badge-expired',
};

// ─── Create Tenant Modal ──────────────────────────────────────────────────
interface CreateModalProps {
  plans: Plan[];
  onClose: () => void;
  onCreated: () => void;
}

interface DynamicModule {
  key: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  isActive: boolean;
}

const CreateTenantModal: React.FC<CreateModalProps> = ({ plans, onClose, onCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: '', slug: '', bengaliName: '', phone: '', email: '', address: '',
    planId: '', adminName: '', adminUsername: '', adminPassword: '',
  });
  const [availableModules, setAvailableModules] = useState<DynamicModule[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingModules, setFetchingModules] = useState(true);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-generate slug from name
  useEffect(() => {
    if (form.name && !form.slug) {
      set('slug', form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [form.name]);

  // Load modules from DB
  useEffect(() => {
    async function loadModules() {
      try {
        setFetchingModules(true);
        const res = await api.get<{ data: { modules: DynamicModule[] } }>('/api/superadmin/modules');
        const active = (res.data.modules || []).filter(m => m.isActive);
        setAvailableModules(active);
        // Default to all active modules if trial/no plan
        setSelectedModules(active.map(m => m.key));
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setFetchingModules(false);
      }
    }
    loadModules();
  }, []);

  // When plan changes, sync default modules from the plan
  const handlePlanChange = (planId: string) => {
    set('planId', planId);
    if (!planId) {
      // Trial: keep all or current selection
      return;
    }
    const chosenPlan = plans.find(p => p.id === planId);
    if (chosenPlan && Array.isArray(chosenPlan.modules)) {
      setSelectedModules(chosenPlan.modules);
    }
  };

  const toggleModule = (key: string) => {
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAllModules = () => setSelectedModules(availableModules.map(m => m.key));
  const deselectAllModules = () => setSelectedModules([]);
  const resetToPlanModules = () => {
    const chosenPlan = plans.find(p => p.id === form.planId);
    if (chosenPlan && Array.isArray(chosenPlan.modules)) {
      setSelectedModules(chosenPlan.modules);
    } else {
      setSelectedModules(availableModules.map(m => m.key));
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Center name is required';
    if (!form.slug.trim()) return 'Center slug is required';
    if (!form.phone.trim()) return 'Phone number is required';
    return '';
  };

  const validateStep3 = () => {
    if (!form.adminName.trim()) return 'Admin name is required';
    if (!form.adminUsername.trim()) return 'Admin username is required';
    if (form.adminPassword.length < 8) return 'Admin password must be at least 8 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err3 = validateStep3();
    if (err3) { setError(err3); return; }

    setError('');
    setLoading(true);
    try {
      await api.post('/api/superadmin/tenants', {
        ...form,
        planId: form.planId || undefined,
        modules: selectedModules,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  // Group modules by category
  const categories = Array.from(new Set(availableModules.map(m => m.category || 'GENERAL')));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">Create New Diagnostic Center</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    height: 4,
                    width: 40,
                    borderRadius: 2,
                    background: s <= step ? 'var(--accent)' : 'var(--border)',
                    transition: 'background 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}>
            {error && <div className="error-alert" style={{ marginBottom: 16 }}>{error}</div>}

            {/* STEP 1: Center Information */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Step 1 of 3: Organization Details
                </p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Center Name *</label>
                    <input className="input" placeholder="e.g. City Diagnostic Center" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug * (Unique Domain ID)</label>
                    <input className="input" placeholder="e.g. city-diagnostic" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bengali Name</label>
                    <input className="input" placeholder="সিটি ডায়াগনস্টিক সেন্টার" value={form.bengaliName} onChange={e => set('bengaliName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Official Email</label>
                    <input className="input" type="email" placeholder="info@citydiagnostic.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subscription Plan</label>
                    <select className="select" value={form.planId} onChange={e => handlePlanChange(e.target.value)}>
                      <option value="">-- Trial Plan (Custom) --</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (৳{(p.priceMonthly / 100).toLocaleString()}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Full Address</label>
                  <input className="input" placeholder="House #, Road #, Area, City" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 2: Granular Module Selection */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Step 2 of 3: Granular Module Customization
                    </p>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Enabled for <strong>{form.name || 'Center'}</strong>: {selectedModules.length} of {availableModules.length} services
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllModules} style={{ fontSize: 11, padding: '4px 8px' }}>
                      Select All
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={deselectAllModules} style={{ fontSize: 11, padding: '4px 8px' }}>
                      Clear All
                    </button>
                    {form.planId && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={resetToPlanModules} style={{ fontSize: 11, padding: '4px 8px' }}>
                        Plan Defaults
                      </button>
                    )}
                  </div>
                </div>

                {fetchingModules ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading module catalog...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {categories.map(cat => {
                      const catModules = availableModules.filter(m => (m.category || 'GENERAL') === cat);
                      if (catModules.length === 0) return null;

                      return (
                        <div key={cat} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                            {cat} Services ({catModules.filter(m => selectedModules.includes(m.key)).length}/{catModules.length})
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                            {catModules.map(mod => {
                              const isChecked = selectedModules.includes(mod.key);
                              return (
                                <label
                                  key={mod.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 10px',
                                    borderRadius: 6,
                                    background: isChecked ? 'rgba(59,130,246,0.1)' : 'var(--bg-surface)',
                                    border: isChecked ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleModule(mod.key)}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                  />
                                  <span style={{ fontSize: 18 }}>{mod.icon || '📦'}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                      {mod.label}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                                      {mod.key}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: First Admin Account & Confirmation */}
            {step === 3 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Step 3 of 3: Primary Center Administrator
                </p>

                {/* Summary Card */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, marginBottom: 16, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Provisioning Overview
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div>Center: <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong></div>
                    <div>Slug: <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{form.slug}</strong></div>
                    <div>Modules: <strong style={{ color: 'var(--success)' }}>{selectedModules.length} enabled</strong></div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Administrator Full Name *</label>
                    <input className="input" placeholder="e.g. Dr. Rafiqul Islam" value={form.adminName} onChange={e => set('adminName', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input className="input" placeholder="e.g. rafiqul_admin" value={form.adminUsername} onChange={e => set('adminUsername', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Initial Password * (min 8 characters)</label>
                    <input className="input" type="password" placeholder="••••••••••••" value={form.adminPassword} onChange={e => set('adminPassword', e.target.value)} required minLength={8} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setError(''); setStep((s) => (s - 1) as any); }}
              >
                ← Back
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              {step < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (step === 1) {
                      const err = validateStep1();
                      if (err) { setError(err); return; }
                    }
                    setError('');
                    setStep((s) => (s + 1) as any);
                  }}
                >
                  Continue →
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : <><Plus size={15} /> Provision Center</>}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Tenant Detail Modal ──────────────────────────────────────────────────
interface DetailModalProps {
  tenantId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const TenantDetailModal: React.FC<DetailModalProps> = ({ tenantId, onClose, onUpdated }) => {
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ data: { tenant: TenantDetail } }>(`/api/superadmin/tenants/${tenantId}`);
      setTenant(res.data.tenant);
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  }, [tenantId, onClose]);

  useEffect(() => { load(); }, [load]);

  const toggleModule = async (moduleKey: string, isEnabled: boolean) => {
    if (!tenant) return;
    setToggling(moduleKey);
    try {
      await api.patch(`/api/superadmin/tenants/${tenantId}/modules`, { moduleKey, isEnabled });
      setTenant((t) => t ? {
        ...t,
        modules: t.modules.some(m => m.moduleKey === moduleKey)
          ? t.modules.map(m => m.moduleKey === moduleKey ? { ...m, isEnabled } : m)
          : [...t.modules, { moduleKey, isEnabled }],
      } : t);
      onUpdated();
    } finally {
      setToggling(null);
    }
  };

  const toggleStatus = async () => {
    if (!tenant) return;
    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Set tenant status to ${newStatus}?`)) return;
    await api.patch(`/api/superadmin/tenants/${tenantId}/status`, { status: newStatus });
    setTenant((t) => t ? { ...t, status: newStatus } : t);
    onUpdated();
  };

  const getModuleState = (key: string) =>
    tenant?.modules.find(m => m.moduleKey === key)?.isEnabled ?? false;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{tenant?.name ?? '...'}</div>
            {tenant && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                /{tenant.slug}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {tenant && (
              <button className={`btn btn-sm ${tenant.status === 'ACTIVE' ? 'btn-danger' : 'btn-ghost'}`} onClick={toggleStatus}>
                {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
              </button>
            )}
            <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)' }} />
            </div>
          ) : tenant && (
            <>
              {/* Info */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Status', value: <span className={`badge ${STATUS_CLASS[tenant.status]}`}>{STATUS_LABELS[tenant.status]}</span> },
                  { label: 'Plan', value: tenant.plan?.name ?? 'Trial' },
                  { label: 'Users', value: tenant.users.length },
                  { label: 'Phone', value: tenant.phone ?? '—' },
                ].map(item => (
                  <div key={item.label} style={{ minWidth: 120 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Module Toggles */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Module Configuration</p>
                <div className="module-grid">
                  {ALL_MODULES.map(mod => {
                    const enabled = getModuleState(mod.key);
                    return (
                      <div key={mod.key} className={`module-card ${enabled ? 'enabled' : ''}`}>
                        <div className="module-info">
                          <span className="module-name">{mod.label}</span>
                          <span className="module-key">{mod.key}</span>
                        </div>
                        <label className="toggle" title={enabled ? 'Click to disable' : 'Click to enable'}>
                          <input
                            type="checkbox"
                            checked={enabled}
                            disabled={toggling === mod.key}
                            onChange={(e) => toggleModule(mod.key, e.target.checked)}
                          />
                          <span className="toggle-track" />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Users */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Staff Accounts ({tenant.users.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tenant.users.map(u => (
                    <div key={u.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{u.username}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge badge-blue" style={{ fontSize: 10 }}>{u.role.replace('_', ' ')}</span>
                        {!u.isActive && <span className="badge badge-suspended" style={{ fontSize: 10 }}>Inactive</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main TenantsView ─────────────────────────────────────────────────────
interface TenantsViewProps {
  onViewTenant?: (id: string) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({ onViewTenant }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const [tenantsRes, plansRes] = await Promise.all([
        api.get<{ data: { tenants: Tenant[]; pagination: { total: number; totalPages: number } } }>(
          `/api/superadmin/tenants?${params}`
        ),
        api.get<{ data: { plans: Plan[] } }>('/api/superadmin/plans'),
      ]);

      setTenants(tenantsRes.data.tenants);
      setTotal(tenantsRes.data.pagination.total);
      setTotalPages(tenantsRes.data.pagination.totalPages);
      setPlans(plansRes.data.plans);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">{total} diagnostic centers registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Tenant
        </button>
      </div>

      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: 10, flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input input-sm"
                style={{ paddingLeft: 32 }}
                placeholder="Search name, slug, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="select input-sm" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={load} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state">
            <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)', width: 28, height: 28 }} />
          </div>
        ) : tenants.length === 0 ? (
          <div className="empty-state">
            <Building2 size={40} className="empty-state-icon" />
            <p className="empty-state-title">No tenants found</p>
            <p className="empty-state-sub">Create your first tenant to get started</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Expires</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      /{t.slug}
                    </div>
                  </td>
                  <td><span className={`badge ${STATUS_CLASS[t.status]}`}>{STATUS_LABELS[t.status]}</span></td>
                  <td>{t.plan?.name ?? <span style={{ color: 'var(--text-muted)' }}>Trial</span>}</td>
                  <td>{t.userCount}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(t.planExpiresAt)}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(t.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => {
                          setSelectedTenantId(t.id);
                          if (onViewTenant) onViewTenant(t.id);
                        }}
                        title="View Details"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span>Page {page} of {totalPages} ({total} total)</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm btn-icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              <button className="btn btn-ghost btn-sm btn-icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTenantModal plans={plans} onClose={() => setShowCreate(false)} onCreated={load} />
      )}
      {selectedTenantId && (
        <TenantDetailModal tenantId={selectedTenantId} onClose={() => setSelectedTenantId(null)} onUpdated={load} />
      )}
    </div>
  );
};
