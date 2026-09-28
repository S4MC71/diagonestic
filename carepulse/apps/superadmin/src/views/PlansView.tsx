import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react';
import { api } from '../lib/api';

const MODULE_OPTIONS = [
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

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  maxUsers: number;
  modules: string[];
  isActive: boolean;
  tenantCount: number;
  createdAt: string;
}

interface PlanFormProps {
  plan?: Plan;
  onClose: () => void;
  onSaved: () => void;
}

const PlanFormModal: React.FC<PlanFormProps> = ({ plan, onClose, onSaved }) => {
  const [name, setName] = useState(plan?.name ?? '');
  const [priceMonthly, setPriceMonthly] = useState(plan?.priceMonthly ?? 0);
  const [priceYearly, setPriceYearly] = useState(plan?.priceYearly ?? 0);
  const [maxUsers, setMaxUsers] = useState(plan?.maxUsers ?? 5);
  const [selectedModules, setSelectedModules] = useState<string[]>(plan?.modules ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleModule = (key: string) =>
    setSelectedModules(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModules.length === 0) { setError('Select at least one module'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = { name, priceMonthly, priceYearly: priceYearly || undefined, maxUsers, modules: selectedModules };
      if (plan) {
        await api.put(`/api/superadmin/plans/${plan.id}`, payload);
      } else {
        await api.post('/api/superadmin/plans', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">{plan ? 'Edit Plan' : 'Create Plan'}</span>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-alert">{error}</div>}

            <div className="form-group">
              <label className="form-label">Plan Name *</label>
              <input className="input" placeholder="Pro" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Monthly Price (BDT) *</label>
                <input className="input" type="number" min={0} value={priceMonthly} onChange={e => setPriceMonthly(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Yearly Price (BDT)</label>
                <input className="input" type="number" min={0} value={priceYearly} onChange={e => setPriceYearly(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Users *</label>
                <input className="input" type="number" min={1} value={maxUsers} onChange={e => setMaxUsers(Number(e.target.value))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Included Modules *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {MODULE_OPTIONS.map(mod => {
                  const selected = selectedModules.includes(mod.key);
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() => toggleModule(mod.key)}
                      className={`badge ${selected ? 'badge-active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        padding: '5px 12px',
                        border: selected ? '1px solid var(--success)' : '1px solid var(--border-light)',
                        background: selected ? 'var(--success-bg)' : 'var(--bg-elevated)',
                        color: selected ? 'var(--success)' : 'var(--text-secondary)',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {selected && <Check size={11} />}
                      {mod.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (plan ? 'Save Changes' : <><Plus size={15} /> Create Plan</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const PlansView: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: { plans: Plan[] } }>('/api/superadmin/plans');
      setPlans(res.data.plans);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deletePlan = async (plan: Plan) => {
    if (plan.tenantCount > 0) {
      alert(`Cannot delete: ${plan.tenantCount} tenant(s) are on this plan.`);
      return;
    }
    if (!confirm(`Delete plan "${plan.name}"?`)) return;
    await api.del(`/api/superadmin/plans/${plan.id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Plans & Packages</h1>
          <p className="page-subtitle">Manage subscription plans and their modules</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Plan
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)', width: 28, height: 28 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {plans.map(plan => (
            <div key={plan.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {plan.tenantCount} tenant{plan.tenantCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditPlan(plan)} title="Edit"><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => deletePlan(plan)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>৳{(plan.priceMonthly).toLocaleString()}</div>
                </div>
                {plan.priceYearly ? (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Yearly</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>৳{(plan.priceYearly).toLocaleString()}</div>
                  </div>
                ) : null}
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max Users</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.maxUsers}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(plan.modules as string[]).map(key => {
                  const mod = MODULE_OPTIONS.find(m => m.key === key);
                  return (
                    <span key={key} className="badge badge-blue" style={{ fontSize: 11 }}>
                      {mod?.label ?? key}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <PlanFormModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editPlan && <PlanFormModal plan={editPlan} onClose={() => setEditPlan(null)} onSaved={load} />}
    </div>
  );
};
