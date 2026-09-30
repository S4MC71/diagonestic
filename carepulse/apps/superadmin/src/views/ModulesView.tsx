import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  Search,
  AlertCircle,
  Edit3,
  Trash2,
  Power,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { api } from '../lib/api';
import { useRouter } from '../context/RouterContext';
import {
  ModuleSchema,
  HEALTHCARE_PRESETS,
} from '../components/ModuleFormBuilder';

export interface ModuleItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  category: 'CLINICAL' | 'LAB' | 'PHARMACY' | 'FINANCE' | 'ADMIN' | 'GENERAL';
  schema?: ModuleSchema;
  sortOrder: number;
  isActive: boolean;
  enabledTenantsCount?: number;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Modules' },
  { id: 'CLINICAL', label: 'Clinical', color: '#10b981' },
  { id: 'LAB', label: 'Laboratory', color: '#38bdf8' },
  { id: 'PHARMACY', label: 'Pharmacy', color: '#ec4899' },
  { id: 'FINANCE', label: 'Finance', color: '#f59e0b' },
  { id: 'ADMIN', label: 'Administration', color: '#6366f1' },
  { id: 'GENERAL', label: 'General', color: '#8b5cf6' },
];

export const ModulesView: React.FC = () => {
  const { navigate } = useRouter();

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('📦');
  const [formCategory, setFormCategory] = useState<ModuleItem['category']>('GENERAL');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedInitialPreset, setSelectedInitialPreset] = useState<string>('blank');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: { modules: ModuleItem[]; total: number; activeCount: number } }>(
        '/api/superadmin/modules'
      );
      setModules(res.data.modules);
    } catch (err) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const openCreateModal = () => {
    setFormKey('');
    setFormLabel('');
    setFormDesc('');
    setFormIcon('✨');
    setFormCategory('GENERAL');
    setFormSortOrder(modules.length + 1);
    setFormIsActive(true);
    setSelectedInitialPreset('blank');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (mod: ModuleItem) => {
    setEditingModule(mod);
    setFormKey(mod.key);
    setFormLabel(mod.label);
    setFormDesc(mod.description || '');
    setFormIcon(mod.icon || '📦');
    setFormCategory(mod.category);
    setFormSortOrder(mod.sortOrder);
    setFormIsActive(mod.isActive);
    setFormError('');
  };

  const handlePresetSelect = (presetKey: string) => {
    setSelectedInitialPreset(presetKey);
    if (presetKey === 'blank') return;

    const preset = HEALTHCARE_PRESETS[presetKey];
    if (preset) {
      setFormLabel(preset.label);
      setFormKey(presetKey);
      setFormIcon(preset.icon);
      setFormCategory(preset.category);
      setFormDesc(preset.description);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formLabel.trim()) {
      setFormError('Module key and display name are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    let initialSchema: ModuleSchema = { fields: [], tableColumns: [] };
    if (selectedInitialPreset !== 'blank' && HEALTHCARE_PRESETS[selectedInitialPreset]) {
      const p = HEALTHCARE_PRESETS[selectedInitialPreset];
      initialSchema = {
        fields: JSON.parse(JSON.stringify(p.fields)),
        tableColumns: [...p.tableColumns],
      };
    }

    const cleanKey = formKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    try {
      await api.post('/api/superadmin/modules', {
        key: cleanKey,
        label: formLabel.trim(),
        description: formDesc.trim(),
        icon: formIcon.trim() || '📦',
        category: formCategory,
        schema: initialSchema,
        sortOrder: Number(formSortOrder),
        isActive: formIsActive,
      });

      setIsCreateOpen(false);
      await fetchModules();

      // Seamlessly navigate to Visual Builder to customize fields
      navigate(`/modules/${cleanKey}/builder`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    if (!formLabel.trim()) {
      setFormError('Module label is required.');
      return;
    }
    setSubmitting(true);
    setFormError('');

    try {
      await api.patch(`/api/superadmin/modules/${editingModule.key}`, {
        label: formLabel.trim(),
        description: formDesc.trim(),
        icon: formIcon.trim() || '📦',
        category: formCategory,
        sortOrder: Number(formSortOrder),
        isActive: formIsActive,
      });
      setEditingModule(null);
      await fetchModules();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (mod: ModuleItem) => {
    const updatedStatus = !mod.isActive;
    // Optimistic update
    setModules((prev) =>
      prev.map((m) => (m.key === mod.key ? { ...m, isActive: updatedStatus } : m))
    );
    try {
      await api.patch(`/api/superadmin/modules/${mod.key}`, {
        isActive: updatedStatus,
      });
    } catch (err) {
      console.error('Failed to toggle active state', err);
      // Revert on error
      setModules((prev) =>
        prev.map((m) => (m.key === mod.key ? { ...m, isActive: mod.isActive } : m))
      );
    }
  };

  const handleDeleteOrDeactivate = async (mod: ModuleItem) => {
    const confirmMsg =
      mod.enabledTenantsCount && mod.enabledTenantsCount > 0
        ? `Module "${mod.label}" is currently active on ${mod.enabledTenantsCount} diagnostic center(s). Deactivating it will prevent new centers from enabling it. Proceed?`
        : `Are you sure you want to delete module "${mod.label}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/api/superadmin/modules/${mod.key}`);
      await fetchModules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete/deactivate module');
    }
  };

  // Filtered modules
  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && m.isActive) ||
      (statusFilter === 'INACTIVE' && !m.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalActive = modules.filter((m) => m.isActive).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Module Registry & Form Builder
            </h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'var(--accent-glow)',
                color: 'var(--accent-light)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              {totalActive} Active / {modules.length} Total
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Create dynamic clinical and administrative modules with customizable form fields and table columns for tenant portals.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px' }}
        >
          <Plus size={16} />
          <span>New Module</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
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
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by module label, key, or description..."
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  border: isSelected ? '1px solid var(--accent-light)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--accent-glow-strong)' : 'transparent',
                  color: isSelected ? 'var(--accent-light)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 28, height: 28 }} />
          <span>Synchronizing module registry catalog...</span>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Sparkles size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
            No modules match criteria
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Adjust your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {filteredModules.map((mod) => {
            const catMeta = CATEGORIES.find((c) => c.id === mod.category) || { color: '#8b5cf6' };
            const customFieldsCount = (mod.schema?.fields || []).length;
            const tableColsCount = (mod.schema?.tableColumns || []).length;

            return (
              <div
                key={mod.key}
                className="card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: mod.isActive ? '1px solid var(--border)' : '1px solid rgba(239,68,68,0.25)',
                  opacity: mod.isActive ? 1 : 0.72,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                        }}
                      >
                        {mod.icon || '📦'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {mod.label}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              background: 'var(--bg-elevated)',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {mod.key}
                          </span>
                          {customFieldsCount > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                background: 'var(--accent-glow)',
                                color: 'var(--accent-light)',
                                padding: '1px 6px',
                                borderRadius: 4,
                                border: '1px solid rgba(16,185,129,0.25)',
                              }}
                            >
                              {customFieldsCount} fields {tableColsCount > 0 && `• ${tableColsCount} cols`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(mod)}
                      title={mod.isActive ? 'Click to deactivate' : 'Click to activate'}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: mod.isActive ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: mod.isActive ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${mod.isActive ? 'var(--success-border)' : 'var(--danger-border)'}`,
                      }}
                    >
                      <Power size={11} />
                      {mod.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      marginTop: 14,
                      lineHeight: 1.5,
                      minHeight: 38,
                    }}
                  >
                    {mod.description || 'No description configured for this module.'}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: `${catMeta.color}15`,
                        color: catMeta.color,
                        border: `1px solid ${catMeta.color}30`,
                      }}
                    >
                      {mod.category}
                    </span>

                    {mod.enabledTenantsCount !== undefined && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {mod.enabledTenantsCount} center{mod.enabledTenantsCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Visual Form Builder studio button */}
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => navigate(`/modules/${mod.key}/builder`)}
                      title="Open Visual Form & Field Builder Studio"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'var(--accent-glow)',
                        borderColor: 'rgba(16,185,129,0.3)',
                        color: 'var(--accent-light)',
                        fontWeight: 600,
                        padding: '5px 9px',
                      }}
                    >
                      <Sliders size={12} />
                      <span>Design Form</span>
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditModal(mod)}
                      title="Edit Module Metadata"
                      style={{ padding: 6 }}
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDeleteOrDeactivate(mod)}
                      title="Delete or Deactivate"
                      style={{ padding: 6, color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Register New Module ── */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsCreateOpen(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="modal-title">Register Feature Module</span>
                <span className="badge badge-emerald">Step 1 of 2</span>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsCreateOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="error-alert">
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                {/* Preset Starter Selector */}
                <div className="form-group">
                  <label className="form-label">Initialize with Template (Optional)</label>
                  <select
                    className="form-select"
                    value={selectedInitialPreset}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                  >
                    <option value="blank">Blank / Custom Module</option>
                    {Object.entries(HEALTHCARE_PRESETS).map(([key, p]) => (
                      <option key={key} value={key}>
                        {p.icon} {p.name} ({p.fields.length} curated fields)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      placeholder="e.g. 🩻"
                      style={{ textAlign: 'center', fontSize: 18 }}
                      maxLength={4}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Display Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formLabel}
                      onChange={(e) => {
                        setFormLabel(e.target.value);
                        if (!formKey || selectedInitialPreset === 'blank') {
                          setFormKey(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_'));
                        }
                      }}
                      placeholder="e.g. Radiology & Imaging"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">System Key (Unique Slug) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. radiology"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    required
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Lowercase letters, numbers, and underscores only. Permanent identifier.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                    >
                      <option value="CLINICAL">CLINICAL</option>
                      <option value="LAB">LAB</option>
                      <option value="PHARMACY">PHARMACY</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief description of this module's clinical service..."
                    rows={2}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    Active in catalog (visible for tenant provisioning)
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register & Open Visual Studio →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Module Metadata ── */}
      {editingModule && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingModule(null)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="modal-title">Edit Module: {editingModule.label}</span>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setEditingModule(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="error-alert">
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                {/* Direct Link to Studio */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-glow)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sliders size={16} color="var(--accent-light)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Form & Field Designer
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Configure dynamic form inputs and table columns
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => {
                      const k = editingModule.key;
                      setEditingModule(null);
                      navigate(`/modules/${k}/builder`);
                    }}
                  >
                    Open Studio →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      style={{ textAlign: 'center', fontSize: 18 }}
                      maxLength={4}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Display Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Module Key (Permanent)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formKey}
                    disabled
                    style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 0.6 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                    >
                      <option value="CLINICAL">CLINICAL</option>
                      <option value="LAB">LAB</option>
                      <option value="PHARMACY">PHARMACY</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={2}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    Active in catalog
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingModule(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
