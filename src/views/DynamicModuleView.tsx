import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  Sparkles,
  CheckCircle,
  Clock,
  Shield,
  Layers,
  Search,
  Plus,
  Download,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  FileText
} from 'lucide-react';

interface Props {
  moduleKey: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  CLINICAL: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  LAB:      { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' },
  PHARMACY: { bg: 'rgba(236,72,153,0.1)', color: '#ec4899', border: 'rgba(236,72,153,0.25)' },
  FINANCE:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  ADMIN:    { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
  GENERAL:  { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' },
};

export const DynamicModuleView: React.FC<Props> = ({ moduleKey }) => {
  const { moduleDefs, authUser } = useAuth();
  const { tenantSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'config' | 'logs'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  // Local sample records stored in component state for demonstration
  const [records, setRecords] = useState<Array<{ id: string; title: string; createdAt: string; status: string; notes: string }>>([
    {
      id: 'REC-001',
      title: 'Initial Module Calibration Record',
      createdAt: new Date().toLocaleDateString(),
      status: 'Active',
      notes: 'Automated system setup record verified for current tenant workspace.'
    }
  ]);

  const def = moduleDefs[moduleKey];
  const label = def?.label || moduleKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const category = (def?.category || 'GENERAL').toUpperCase();
  const catStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS['GENERAL'];

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordName.trim()) {
      showToast('Please provide a title for the record.');
      return;
    }
    const newRec = {
      id: `REC-00${records.length + 1}`,
      title: recordName.trim(),
      createdAt: new Date().toLocaleDateString(),
      status: 'Active',
      notes: recordNotes.trim() || 'No additional notes entered.'
    };
    setRecords([newRec, ...records]);
    setRecordName('');
    setRecordNotes('');
    setIsNewRecordModalOpen(false);
    showToast(`Record "${newRec.title}" created successfully!`);
  };

  const filteredRecords = records.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: catStyle.bg,
            border: `1px solid ${catStyle.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: catStyle.color
          }}>
            <Boxes size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {label}
              </h1>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: catStyle.bg,
                color: catStyle.color,
                border: `1px solid ${catStyle.border}`
              }}>
                {category}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(16,185,129,0.1)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <CheckCircle size={11} /> Active
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              Operational workspace for <strong style={{ color: '#334155' }}>{tenantSettings.name || 'Diagnostic Center'}</strong>.
              Module key: <code style={{ fontSize: 11, color: '#64748b' }}>{moduleKey}</code>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => showToast('Module audit log exported to CSV.')}
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Export Data
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsNewRecordModalOpen(true)}
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> Add Record
          </button>
        </div>
      </div>

      {/* ── Key Stats ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            OPERATIONAL STATUS
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Active & Synced
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Enabled by Center Admin</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            TOTAL RECORDS
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {records.length}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Logged items in module catalog</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ACCESS CONTROL
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={16} /> Role Guarded
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Current Role: {authUser?.role || 'Staff'}</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            DATA PROTOCOL
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={16} /> Multi-Tenant Encrypted
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Scoped to slug /{authUser?.tenant?.slug || 'tenant'}</div>
        </div>
      </div>

      {/* ── Tabbed View ───────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', padding: '0 16px', background: '#f8fafc' }}>
          {[
            { id: 'records', label: 'Operational Records' },
            { id: 'config', label: 'Module Configuration' },
            { id: 'logs', label: 'Activity Logs' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === t.id ? '2px solid #059669' : '2px solid transparent',
                color: activeTab === t.id ? '#059669' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {activeTab === 'records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 280 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 32, fontSize: 13, height: 36 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => showToast('Records refreshed.')}
                    style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '10px 14px' }}>Record ID</th>
                      <th style={{ padding: '10px 14px' }}>Title & Description</th>
                      <th style={{ padding: '10px 14px' }}>Created Date</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '36px 14px', color: '#94a3b8' }}>
                          <Boxes size={32} style={{ margin: '0 auto 8px', opacity: 0.5, display: 'block' }} />
                          No records found matching "{searchQuery}".
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#334155' }}>
                            {r.id}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.title}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.notes}</div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>
                            {r.createdAt}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 12,
                              background: '#dcfce7',
                              color: '#15803d'
                            }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => showToast(`Record ${r.id} details viewed.`)}
                              style={{ fontSize: 12 }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px 20px',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#334155'
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Configuration & Parameter Mapping
                </h3>
                <p style={{ margin: 0 }}>
                  This module is dynamically loaded and provisioned for <strong>{tenantSettings.name || 'this center'}</strong>.
                  Parameters and schemas configured by your SuperAdmin are reflected here in real time.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Module Key</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4, fontFamily: 'monospace' }}>{moduleKey}</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Section Category</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: catStyle.color, marginTop: 4 }}>{category}</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Auto-Save Ledger</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginTop: 4 }}>Enabled</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                <Clock size={14} style={{ color: '#64748b' }} />
                <span style={{ color: '#334155', fontWeight: 600 }}>System Event:</span>
                <span style={{ color: '#64748b' }}>Module "{label}" synchronized with cloud catalog.</span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>Just now</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                <CheckCircle size={14} style={{ color: '#10b981' }} />
                <span style={{ color: '#334155', fontWeight: 600 }}>Authorization:</span>
                <span style={{ color: '#64748b' }}>Access verified for user @{authUser?.username}.</span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>Active session</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Record Modal ──────────────────────────────────── */}
      {isNewRecordModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsNewRecordModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">Create New {label} Record</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsNewRecordModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddRecord}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Record Title / Identifier *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`e.g. Daily ${label} Entry`}
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes & Specifications</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter record details or operational notes..."
                    value={recordNotes}
                    onChange={(e) => setRecordNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewRecordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
