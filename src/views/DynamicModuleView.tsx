import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
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
  RefreshCw,
  FileText,
  Trash2,
  Eye,
  X,
  Filter,
  ChevronRight,
  Database,
  AlertCircle,
  Tag,
  Check,
  Calendar,
  User,
  Sliders,
} from 'lucide-react';

interface Props {
  moduleKey: string;
}

export interface FieldDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'status';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface ModuleSchema {
  fields: FieldDef[];
  tableColumns: string[];
}

export interface CustomRecord {
  id: string;
  recordId: string;
  title: string;
  status: string;
  data: Record<string, any>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
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
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Schema & metadata state
  const [moduleMetadata, setModuleMetadata] = useState<any>(null);
  const [schema, setSchema] = useState<ModuleSchema>({ fields: [], tableColumns: [] });

  // Records state
  const [records, setRecords] = useState<CustomRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<CustomRecord | null>(null);

  // Form values state for dynamic inputs
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [recordTitle, setRecordTitle] = useState('');
  const [recordStatus, setRecordStatus] = useState('Active');
  const [formError, setFormError] = useState('');

  // Fetch module schema and details
  const fetchModuleSchema = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{
        success: boolean;
        data: {
          module: any;
          schema: ModuleSchema;
          stats: { totalRecords: number };
        };
      }>(`/api/tenant/custom-modules/${moduleKey}/schema`);

      if (res.data) {
        setModuleMetadata(res.data.module);
        setSchema(res.data.schema || { fields: [], tableColumns: [] });
      }
    } catch (err) {
      console.warn(`Could not load custom schema for ${moduleKey}, using fallback`, err);
    } finally {
      setLoading(false);
    }
  }, [moduleKey]);

  // Fetch tenant custom records
  const fetchRecords = useCallback(async () => {
    try {
      setRecordsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await api.get<{
        success: boolean;
        data: {
          records: CustomRecord[];
          total: number;
        };
      }>(`/api/tenant/custom-modules/${moduleKey}/records?${params.toString()}`);

      if (res.data) {
        setRecords(res.data.records || []);
        setTotalRecords(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch custom records:', err);
    } finally {
      setRecordsLoading(false);
    }
  }, [moduleKey, searchQuery, statusFilter]);

  useEffect(() => {
    fetchModuleSchema();
  }, [fetchModuleSchema]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Initialize form data when opening modal
  const openAddModal = () => {
    const initial: Record<string, any> = {};
    if (schema.fields && schema.fields.length > 0) {
      schema.fields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          initial[f.id] = f.defaultValue;
        } else if (f.type === 'select' && f.options && f.options.length > 0) {
          initial[f.id] = f.options[0];
        } else if (f.type === 'status' && f.options && f.options.length > 0) {
          initial[f.id] = f.options[0];
        } else if (f.type === 'checkbox') {
          initial[f.id] = false;
        } else {
          initial[f.id] = '';
        }
      });
    }

    setFormData(initial);
    setRecordTitle('');
    setRecordStatus('Active');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Submit new custom record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Check required fields
    if (schema.fields && schema.fields.length > 0) {
      for (const field of schema.fields) {
        if (field.required) {
          const val = formData[field.id];
          if (val === undefined || val === null || val === '') {
            setFormError(`"${field.label}" is required.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; data: { record: CustomRecord } }>(
        `/api/tenant/custom-modules/${moduleKey}/records`,
        {
          title: recordTitle.trim() || undefined,
          status: recordStatus,
          data: formData,
        }
      );

      if (res.data?.record) {
        showToast(`Record "${res.data.record.recordId}" created successfully!`);
        setIsAddModalOpen(false);
        await fetchRecords();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a record
  const handleDeleteRecord = async (record: CustomRecord) => {
    if (!window.confirm(`Are you sure you want to delete record ${record.recordId} ("${record.title}")?`)) {
      return;
    }

    try {
      await api.del(`/api/tenant/custom-modules/${moduleKey}/records/${record.id}`);
      showToast(`Record ${record.recordId} deleted.`);
      await fetchRecords();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record.');
    }
  };

  // Export records to CSV
  const handleExportData = () => {
    if (records.length === 0) {
      showToast('No records available to export.');
      return;
    }

    const headers = ['Record ID', 'Title', 'Status', 'Created At'];
    const customFieldIds = (schema.fields || []).map((f) => f.id);
    const customFieldLabels = (schema.fields || []).map((f) => f.label);
    const allHeaders = [...headers, ...customFieldLabels];

    const rows = records.map((r) => {
      const base = [
        `"${r.recordId}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${new Date(r.createdAt).toLocaleDateString()}"`,
      ];
      const customVals = customFieldIds.map((id) => {
        const val = r.data ? r.data[id] : '';
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      });
      return [...base, ...customVals].join(',');
    });

    const csvContent = [allHeaders.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${moduleKey}_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Records exported to CSV successfully!');
  };

  const def = moduleDefs[moduleKey];
  const label = moduleMetadata?.label || def?.label || moduleKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const icon = moduleMetadata?.icon || def?.icon || '📦';
  const category = (moduleMetadata?.category || def?.category || 'GENERAL').toUpperCase();
  const catStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS['GENERAL'];

  // Columns to display in the table
  const activeColumns: FieldDef[] =
    schema.tableColumns && schema.tableColumns.length > 0
      ? schema.tableColumns
          .map((colId) => (schema.fields || []).find((f) => f.id === colId))
          .filter((f): f is FieldDef => !!f)
      : (schema.fields || []).slice(0, 4);

  // Status badge style helper
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bg = '#e2e8f0';
    let color = '#475569';

    if (s.includes('active') || s.includes('pass') || s.includes('complete') || s.includes('delivered') || s.includes('verified') || s.includes('available')) {
      bg = '#dcfce7';
      color = '#15803d';
    } else if (s.includes('pending') || s.includes('scheduled') || s.includes('progress') || s.includes('standby')) {
      bg = '#fef3c7';
      color = '#b45309';
    } else if (s.includes('fail') || s.includes('cancel') || s.includes('expired') || s.includes('emergency')) {
      bg = '#fee2e2';
      color = '#b91c1c';
    }

    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 12,
          background: bg,
          color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: catStyle.bg,
              border: `1px solid ${catStyle.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {label}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: catStyle.bg,
                  color: catStyle.color,
                  border: `1px solid ${catStyle.border}`,
                }}
              >
                {category}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(16,185,129,0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CheckCircle size={11} /> Active
              </span>
              {schema.fields && schema.fields.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(99,102,241,0.1)',
                    color: '#6366f1',
                    border: '1px solid rgba(99,102,241,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Sliders size={11} /> {schema.fields.length} Custom Fields
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              {moduleMetadata?.description ||
                `Operational workspace for ${tenantSettings.name || 'Diagnostic Center'}.`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportData}
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
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
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Enabled for this center</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            TOTAL RECORDS
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {totalRecords}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Live database items</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CUSTOM SCHEMA
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sliders size={16} /> {(schema.fields || []).length} Fields Active
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            {(schema.fields || []).filter((f) => f.type === 'select').length} Dropdown Box(es)
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            DATA SECURITY
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={16} /> Tenant-Scoped DB
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Isolated Postgres Schema</div>
        </div>
      </div>

      {/* ── Tabbed View ───────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', padding: '0 16px', background: '#f8fafc' }}>
          {[
            { id: 'records', label: `Operational Records (${totalRecords})` },
            { id: 'config', label: 'Schema & Field Mapping' },
            { id: 'logs', label: 'Security & Access Logs' },
          ].map((t) => (
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
                transition: 'all 0.15s',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                  <div style={{ position: 'relative', width: 280 }}>
                    <Search
                      size={15}
                      style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search by ID or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: 32, fontSize: 13, height: 36 }}
                    />
                  </div>

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 'auto', height: 36, fontSize: 13 }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={fetchRecords}
                    style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={13} className={recordsLoading ? 'spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {/* Dynamic Records Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '10px 14px' }}>Record ID</th>
                      <th style={{ padding: '10px 14px' }}>Title</th>
                      {activeColumns.map((col) => (
                        <th key={col.id} style={{ padding: '10px 14px' }}>
                          {col.label}
                        </th>
                      ))}
                      <th style={{ padding: '10px 14px' }}>Date</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsLoading ? (
                      <tr>
                        <td colSpan={5 + activeColumns.length} style={{ textAlign: 'center', padding: '36px 14px', color: '#64748b' }}>
                          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                          Loading live records...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={5 + activeColumns.length} style={{ textAlign: 'center', padding: '40px 14px', color: '#94a3b8' }}>
                          <Boxes size={36} style={{ margin: '0 auto 10px', opacity: 0.4, display: 'block' }} />
                          <div style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>No records found</div>
                          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px' }}>
                            Click "+ Add Record" to add your first operational entry.
                          </p>
                          <button type="button" className="btn btn-primary btn-sm" onClick={openAddModal}>
                            <Plus size={13} /> Add Record Now
                          </button>
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#0369a1' }}>
                            {r.recordId}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                            {r.title}
                          </td>
                          {activeColumns.map((col) => {
                            const val = r.data ? r.data[col.id] : undefined;
                            let displayVal = val;
                            if (typeof val === 'boolean') {
                              displayVal = val ? 'Yes' : 'No';
                            } else if (val === undefined || val === null || val === '') {
                              displayVal = '-';
                            }
                            return (
                              <td key={col.id} style={{ padding: '12px 14px', color: '#334155' }}>
                                {col.type === 'status' ? renderStatusBadge(String(displayVal)) : String(displayVal)}
                              </td>
                            );
                          })}
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 12 }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {renderStatusBadge(r.status)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setViewingRecord(r)}
                                title="View Record Details"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleDeleteRecord(r)}
                                title="Delete Record"
                                style={{ padding: '4px 8px', color: '#ef4444' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '16px 20px',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#334155',
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Interactive Form & Field Schema
                </h3>
                <p style={{ margin: 0 }}>
                  This module was designed in the SuperAdmin Module Builder. Fields below are dynamically rendered into your
                  forms and data tables in real time.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Configured Dynamic Fields ({(schema.fields || []).length})
                </span>

                {(schema.fields || []).length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
                    No custom fields configured yet. You can ask SuperAdmin to design custom dropdown boxes, datepickers, and inputs for this module.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {(schema.fields || []).map((f) => (
                      <div
                        key={f.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: 14,
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{f.label}</span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: '#eff6ff',
                              color: '#2563eb',
                            }}
                          >
                            {f.type}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          ID: <code style={{ color: '#0284c7' }}>{f.id}</code> {f.required && '• Required'}
                        </div>
                        {f.options && f.options.length > 0 && (
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                            <strong>Dropdown Options ({f.options.length}):</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                              {f.options.map((opt) => (
                                <span
                                  key={opt}
                                  style={{
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: '#f1f5f9',
                                    fontSize: 11,
                                  }}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                <Clock size={14} style={{ color: '#64748b' }} />
                <span style={{ color: '#334155', fontWeight: 600 }}>System Sync:</span>
                <span style={{ color: '#64748b' }}>Schema and records synced with central database.</span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>Live</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                <CheckCircle size={14} style={{ color: '#10b981' }} />
                <span style={{ color: '#334155', fontWeight: 600 }}>Authorization:</span>
                <span style={{ color: '#64748b' }}>Access verified for user @{authUser?.username} ({authUser?.role}).</span>
                <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>Active Session</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dynamic "+ Add Record" Modal ───────────────────────── */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="modal-title">Create New {label} Record</span>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                {/* Title and Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Record Title / Identifier</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`e.g. Daily ${label} Entry`}
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Record Status</label>
                    <select
                      className="form-select"
                      value={recordStatus}
                      onChange={(e) => setRecordStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic custom fields configured in SuperAdmin builder */}
                {schema.fields && schema.fields.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Module Fields ({schema.fields.length})
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {schema.fields.map((f) => {
                        const isFullWidth = f.type === 'textarea' || (f.label.length > 25);
                        return (
                          <div
                            key={f.id}
                            className="form-group"
                            style={{ gridColumn: isFullWidth ? 'span 2' : 'span 1' }}
                          >
                            <label className="form-label">
                              {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>

                            {f.type === 'select' ? (
                              <select
                                className="form-select"
                                value={formData[f.id] ?? ''}
                                onChange={(e) => handleFieldChange(f.id, e.target.value)}
                                required={f.required}
                              >
                                <option value="">Select {f.label}...</option>
                                {(f.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : f.type === 'status' ? (
                              <select
                                className="form-select"
                                value={formData[f.id] ?? ''}
                                onChange={(e) => handleFieldChange(f.id, e.target.value)}
                                required={f.required}
                                style={{ fontWeight: 600 }}
                              >
                                {(f.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    ● {opt}
                                  </option>
                                ))}
                              </select>
                            ) : f.type === 'textarea' ? (
                              <textarea
                                className="form-input"
                                rows={3}
                                value={formData[f.id] ?? ''}
                                onChange={(e) => handleFieldChange(f.id, e.target.value)}
                                placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                                required={f.required}
                              />
                            ) : f.type === 'checkbox' ? (
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 6 }}>
                                <input
                                  type="checkbox"
                                  checked={!!formData[f.id]}
                                  onChange={(e) => handleFieldChange(f.id, e.target.checked)}
                                />
                                <span style={{ fontSize: 13, color: '#334155' }}>{f.label}</span>
                              </label>
                            ) : (
                              <input
                                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                                className="form-input"
                                value={formData[f.id] ?? ''}
                                onChange={(e) => handleFieldChange(f.id, e.target.value)}
                                placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                                required={f.required}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px dashed #cbd5e1',
                      fontSize: 13,
                      color: '#64748b',
                    }}
                  >
                    No custom fields configured for this module yet. You can design dropdown boxes and inputs from the SuperAdmin Module Builder!
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Record Details Modal ──────────────────────────── */}
      {viewingRecord && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewingRecord(null)}>
          <div className="modal" style={{ maxWidth: 540, width: '100%' }}>
            <div className="modal-header">
              <div>
                <span className="modal-title">Record Details: {viewingRecord.recordId}</span>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Created on {new Date(viewingRecord.createdAt).toLocaleString()}
                </div>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setViewingRecord(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Record ID</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0369a1', marginTop: 2, fontFamily: 'monospace' }}>
                    {viewingRecord.recordId}
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ marginTop: 2 }}>{renderStatusBadge(viewingRecord.status)}</div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Title</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{viewingRecord.title}</div>
              </div>

              {/* Custom fields data */}
              {viewingRecord.data && Object.keys(viewingRecord.data).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Field Values
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {Object.entries(viewingRecord.data).map(([key, val]) => {
                      const f = (schema.fields || []).find((x) => x.id === key);
                      const fieldLabel = f?.label || key.replace(/_/g, ' ');
                      return (
                        <div key={key} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', background: '#f8fafc' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{fieldLabel}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                            {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '-')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setViewingRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
