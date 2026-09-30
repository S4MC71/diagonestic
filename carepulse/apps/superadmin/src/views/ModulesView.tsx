import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  Search,
  Layers,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Power,
  Filter,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  ModuleFormBuilder,
  ModuleSchema,
  PresetTemplate,
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
  { id: 'LAB', label: 'Laboratory', color: '#6366f1' },
  { id: 'PHARMACY', label: 'Pharmacy', color: '#ec4899' },
  { id: 'FINANCE', label: 'Finance', color: '#f59e0b' },
  { id: 'ADMIN', label: 'Administration', color: '#3b82f6' },
  { id: 'GENERAL', label: 'General', color: '#8b5cf6' },
];

export const ModulesView: React.FC = () => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'builder'>('info');

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('📦');
  const [formCategory, setFormCategory] = useState<ModuleItem['category']>('GENERAL');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSchema, setFormSchema] = useState<ModuleSchema>({ fields: [], tableColumns: [] });
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
    setFormSchema({ fields: [], tableColumns: [] });
    setActiveModalTab('info');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (mod: ModuleItem, defaultTab: 'info' | 'builder' = 'info') => {
    setEditingModule(mod);
    setFormKey(mod.key);
    setFormLabel(mod.label);
    setFormDesc(mod.description || '');
    setFormIcon(mod.icon || '📦');
    setFormCategory(mod.category);
    setFormSortOrder(mod.sortOrder);
    setFormIsActive(mod.isActive);

    const rawSchema = (mod as any).schema;
    const initialSchema: ModuleSchema =
      rawSchema && typeof rawSchema === 'object' && Array.isArray(rawSchema.fields)
        ? rawSchema
        : { fields: [], tableColumns: [] };

    setFormSchema(initialSchema);
    setActiveModalTab(defaultTab);
    setFormError('');
  };

  const handleApplyPresetMetadata = (preset: PresetTemplate) => {
    if (!formLabel || formLabel === 'Custom Module' || isCreateOpen) {
      setFormLabel(preset.label);
    }
    if (isCreateOpen && (!formKey || formKey.startsWith('custom'))) {
      setFormKey(preset.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    }
    setFormIcon(preset.icon);
    setFormCategory(preset.category);
    setFormDesc(preset.description);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formLabel.trim()) {
      setFormError('Module key and label are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/api/superadmin/modules', {
        key: formKey.trim().toLowerCase().replace(/\s+/g, '_'),
        label: formLabel.trim(),
        description: formDesc.trim(),
        icon: formIcon.trim() || '📦',
        category: formCategory,
        schema: formSchema,
        sortOrder: Number(formSortOrder),
        isActive: formIsActive,
      });
      setIsCreateOpen(false);
      await fetchModules();
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
        schema: formSchema,
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
    <div className="view-container">
      {/* Header bar */}
      <div className="view-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="view-title" style={{ fontSize: 24, fontWeight: 700 }}>
              Module Registry & Form Builder Studio
            </h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
            >
              Interactive No-Code Engine
            </span>
          </div>
          <p className="view-subtitle" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Create modules, design custom fields (dropdowns, inputs, datepickers), and configure tenant workflows.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal} style={{ gap: 8 }}>
          <Plus size={16} />
          Register New Module
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
            <Layers size={14} color="var(--accent)" /> Total Modules
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {modules.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color="var(--success)" /> Active in Catalog
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)' }}>
            {totalActive}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sliders size={14} color="#8b5cf6" /> Custom Built Modules
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>
            {modules.filter((m) => (m.schema?.fields || []).length > 0).length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div className="search-box" style={{ maxWidth: 360, width: '100%', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by label, key, or description..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: selectedCategory === cat.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: selectedCategory === cat.id ? 'var(--accent-glow)' : 'transparent',
                color: selectedCategory === cat.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading module registry...
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', background: 'var(--bg-surface)' }}>
          <Sparkles size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No modules found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Try adjusting your search query or category filters.
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
            return (
              <div
                key={mod.key}
                className="card"
                style={{
                  padding: 20,
                  background: 'var(--bg-surface)',
                  border: mod.isActive ? '1px solid var(--border)' : '1px solid rgba(239,68,68,0.2)',
                  opacity: mod.isActive ? 1 : 0.7,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
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
                                color: 'var(--accent)',
                                padding: '1px 6px',
                                borderRadius: 4,
                                border: '1px solid rgba(59,130,246,0.2)',
                              }}
                            >
                              {customFieldsCount} fields
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(mod)}
                      title={mod.isActive ? 'Click to deactivate module' : 'Click to activate module'}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: mod.isActive ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: mod.isActive ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${mod.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
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
                    {mod.description || 'No description provided for this service module.'}
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
                    {/* Direct Form Builder button */}
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => openEditModal(mod, 'builder')}
                      title="Interactive Form & Field Designer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 8px',
                        fontSize: 11,
                        color: 'var(--accent)',
                      }}
                    >
                      <Sliders size={12} />
                      <span>Form ({customFieldsCount})</span>
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditModal(mod, 'info')}
                      title="Edit Module Details"
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

      {/* ── Modal: Create Module ───────────────────────────────── */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsCreateOpen(false)}>
          <div className="modal" style={{ maxWidth: 860, width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="modal-title">Register & Design Feature Module</span>
                <span style={{ fontSize: 12, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99 }}>
                  No-Code Builder
                </span>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsCreateOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', padding: '0 24px', background: 'var(--bg-elevated)' }}>
              <button
                type="button"
                onClick={() => setActiveModalTab('info')}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeModalTab === 'info' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: activeModalTab === 'info' ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                ⚙️ 1. Basic Module Info
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('builder')}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeModalTab === 'builder' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: activeModalTab === 'builder' ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🎨 2. Form & Field Designer
                <span style={{ fontSize: 11, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99 }}>
                  {formSchema.fields.length} Fields
                </span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
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

                {activeModalTab === 'info' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Icon / Emoji</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value)}
                          placeholder="e.g. 🔬"
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
                            if (!formKey) {
                              setFormKey(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_'));
                            }
                          }}
                          placeholder="e.g. Radiology & Imaging"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">System Module Key (Unique slug) *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formKey}
                        onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g. radiology"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        required
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Lowercase letters, numbers, and underscores only. Cannot be altered later.
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
                        placeholder="Brief description of what this module provides..."
                        rows={3}
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
                  </>
                ) : (
                  <ModuleFormBuilder
                    schema={formSchema}
                    onChange={setFormSchema}
                    onApplyPresetMetadata={handleApplyPresetMetadata}
                  />
                )}
              </div>

              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {activeModalTab === 'info' ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setActiveModalTab('builder')}
                    >
                      Next: Design Form & Fields →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setActiveModalTab('info')}
                    >
                      ← Back to Module Info
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Registering...' : 'Register Module & Schema'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Module ─────────────────────────────────── */}
      {editingModule && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingModule(null)}>
          <div className="modal" style={{ maxWidth: 860, width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="modal-title">Edit Module: {editingModule.label}</span>
                <span style={{ fontSize: 12, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99 }}>
                  {formSchema.fields.length} Custom Fields
                </span>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setEditingModule(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', padding: '0 24px', background: 'var(--bg-elevated)' }}>
              <button
                type="button"
                onClick={() => setActiveModalTab('info')}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeModalTab === 'info' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: activeModalTab === 'info' ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                }}
              >
                ⚙️ Basic Module Info
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('builder')}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: activeModalTab === 'builder' ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: activeModalTab === 'builder' ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🎨 Form & Field Designer
                <span style={{ fontSize: 11, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99 }}>
                  {formSchema.fields.length} Fields
                </span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
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

                {activeModalTab === 'info' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Icon / Emoji</label>
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
                      <label className="form-label">System Key (Read-Only Primary Key)</label>
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
                        rows={3}
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
                  </>
                ) : (
                  <ModuleFormBuilder
                    schema={formSchema}
                    onChange={setFormSchema}
                    onApplyPresetMetadata={handleApplyPresetMetadata}
                  />
                )}
              </div>

              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div>
                  {activeModalTab === 'info' ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setActiveModalTab('builder')}
                    >
                      Configure Form Fields ({formSchema.fields.length}) →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setActiveModalTab('info')}
                    >
                      ← Back to Module Info
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingModule(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving Changes...' : 'Save Module & Schema'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
