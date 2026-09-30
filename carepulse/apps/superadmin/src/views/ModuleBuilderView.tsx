import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Eye,
  Type,
  Hash,
  ListFilter,
  Calendar,
  AlignLeft,
  CheckSquare,
  Activity,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  Code2,
  Sliders,
} from 'lucide-react';
import { api } from '../lib/api';
import { useRouter } from '../context/RouterContext';
import {
  FieldDef,
  FieldType,
  ModuleSchema,
  HEALTHCARE_PRESETS,
} from '../components/ModuleFormBuilder';

const FIELD_TYPE_CONFIG: Record<
  FieldType,
  { label: string; icon: React.ReactNode; defaultPlaceholder: string }
> = {
  text:     { label: 'Text Input',     icon: <Type size={14} />,        defaultPlaceholder: 'Enter text...' },
  number:   { label: 'Number',         icon: <Hash size={14} />,        defaultPlaceholder: '0' },
  select:   { label: 'Dropdown Select',icon: <ListFilter size={14} />,  defaultPlaceholder: 'Choose option...' },
  date:     { label: 'Date Picker',    icon: <Calendar size={14} />,    defaultPlaceholder: 'Select date' },
  textarea: { label: 'Multiline Notes',icon: <AlignLeft size={14} />,   defaultPlaceholder: 'Enter detailed clinical notes...' },
  checkbox: { label: 'Checkbox (Yes/No)', icon: <CheckSquare size={14} />, defaultPlaceholder: '' },
  status:   { label: 'Status Badge',   icon: <Activity size={14} />,    defaultPlaceholder: '' },
};

export const ModuleBuilderView: React.FC = () => {
  const { moduleKey, navigate } = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moduleData, setModuleData] = useState<any>(null);
  const [schema, setSchema] = useState<ModuleSchema>({ fields: [], tableColumns: [] });
  const [initialSchemaJson, setInitialSchemaJson] = useState<string>('');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'form' | 'table' | 'json'>('form');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New option buffer for dropdown editing
  const [newOptionBuffers, setNewOptionBuffers] = useState<Record<string, string>>({});

  // Interactive form test state for live preview testing
  const [previewFormData, setPreviewFormData] = useState<Record<string, any>>({});

  const isDirty = initialSchemaJson !== JSON.stringify(schema);

  // Load module data by key
  const fetchModule = useCallback(async () => {
    if (!moduleKey) return;
    try {
      setLoading(true);
      const res = await api.get<{ data: { module: any } }>(`/api/superadmin/modules/${moduleKey}`);
      const mod = res.data.module;
      setModuleData(mod);

      let loadedSchema: ModuleSchema = { fields: [], tableColumns: [] };
      if (mod.schema && typeof mod.schema === 'object' && Array.isArray(mod.schema.fields)) {
        loadedSchema = {
          fields: mod.schema.fields,
          tableColumns: mod.schema.tableColumns || [],
        };
      } else {
        // Fallback to radiology preset or default
        const defaultPreset = HEALTHCARE_PRESETS[moduleKey] || HEALTHCARE_PRESETS.radiology;
        if (defaultPreset) {
          loadedSchema = {
            fields: [...defaultPreset.fields],
            tableColumns: [...defaultPreset.tableColumns],
          };
        }
      }

      setSchema(loadedSchema);
      setInitialSchemaJson(JSON.stringify(loadedSchema));
      if (loadedSchema.fields.length > 0) {
        setSelectedFieldId(loadedSchema.fields[0].id);
      }
    } catch (err) {
      console.error('Failed to load module for builder:', err);
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load module schema',
      });
    } finally {
      setLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Field manipulation functions
  const addField = (type: FieldType) => {
    const baseId = `field_${type}_${Date.now().toString().slice(-4)}`;
    const newField: FieldDef = {
      id: baseId,
      label: `New ${FIELD_TYPE_CONFIG[type].label}`,
      type,
      placeholder: FIELD_TYPE_CONFIG[type].defaultPlaceholder,
      required: false,
      options: type === 'select' || type === 'status' ? ['Active', 'Pending', 'Archived'] : undefined,
      defaultValue: type === 'checkbox' ? false : type === 'status' ? 'Active' : '',
    };

    const updatedFields = [...schema.fields, newField];
    const updatedTableColumns =
      schema.tableColumns.length < 5 ? [...schema.tableColumns, newField.id] : schema.tableColumns;

    setSchema({
      fields: updatedFields,
      tableColumns: updatedTableColumns,
    });
    setSelectedFieldId(newField.id);
  };

  const removeField = (id: string) => {
    const updatedFields = schema.fields.filter((f) => f.id !== id);
    const updatedTableColumns = schema.tableColumns.filter((col) => col !== id);
    setSchema({
      fields: updatedFields,
      tableColumns: updatedTableColumns,
    });
    if (selectedFieldId === id) {
      setSelectedFieldId(updatedFields[0]?.id || null);
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schema.fields.length) return;

    const newFields = [...schema.fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);

    setSchema((prev) => ({
      ...prev,
      fields: newFields,
    }));
  };

  const updateField = (id: string, updates: Partial<FieldDef>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const toggleTableColumn = (id: string) => {
    setSchema((prev) => {
      const exists = prev.tableColumns.includes(id);
      return {
        ...prev,
        tableColumns: exists ? prev.tableColumns.filter((col) => col !== id) : [...prev.tableColumns, id],
      };
    });
  };

  const applyPreset = (presetKey: string) => {
    const preset = HEALTHCARE_PRESETS[presetKey];
    if (!preset) return;
    if (
      schema.fields.length > 0 &&
      !window.confirm(
        `Replace current fields with "${preset.label}" template (${preset.fields.length} fields)? This will overwrite unsaved changes.`
      )
    ) {
      return;
    }

    setSchema({
      fields: JSON.parse(JSON.stringify(preset.fields)),
      tableColumns: [...preset.tableColumns],
    });
    setSelectedFieldId(preset.fields[0]?.id || null);
  };

  const addOptionToField = (fieldId: string) => {
    const opt = (newOptionBuffers[fieldId] || '').trim();
    if (!opt) return;

    const targetField = schema.fields.find((f) => f.id === fieldId);
    if (!targetField) return;

    const existingOptions = targetField.options || [];
    if (existingOptions.includes(opt)) return;

    updateField(fieldId, { options: [...existingOptions, opt] });
    setNewOptionBuffers((prev) => ({ ...prev, [fieldId]: '' }));
  };

  const removeOptionFromField = (fieldId: string, optToRemove: string) => {
    const targetField = schema.fields.find((f) => f.id === fieldId);
    if (!targetField || !targetField.options) return;
    updateField(fieldId, {
      options: targetField.options.filter((o) => o !== optToRemove),
    });
  };

  const handleSave = async () => {
    if (!moduleKey) return;

    // Validation: Field IDs must be unique
    const idSet = new Set<string>();
    for (const f of schema.fields) {
      if (idSet.has(f.id)) {
        setNotification({
          type: 'error',
          message: `Duplicate field ID "${f.id}". All field identifiers must be unique.`,
        });
        return;
      }
      idSet.add(f.id);

      if ((f.type === 'select' || f.type === 'status') && (!f.options || f.options.length === 0)) {
        setNotification({
          type: 'error',
          message: `Field "${f.label}" is a dropdown but has no options configured.`,
        });
        return;
      }
    }

    try {
      setSaving(true);
      setNotification(null);

      await api.patch(`/api/superadmin/modules/${moduleKey}`, {
        schema: {
          fields: schema.fields,
          tableColumns: schema.tableColumns,
        },
      });

      setInitialSchemaJson(JSON.stringify(schema));
      setNotification({
        type: 'success',
        message: 'Module form schema and table view saved successfully!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save schema',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="full-loading">
        <span className="spinner" style={{ width: 28, height: 28 }} />
        <span>Loading Module Form Studio...</span>
      </div>
    );
  }

  return (
    <div className="builder-shell">
      {/* ── Studio Topbar ── */}
      <div className="builder-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes in this form schema. Discard and exit?')) {
                return;
              }
              navigate('/modules');
            }}
            title="Return to Module Registry"
          >
            <ArrowLeft size={16} />
            <span>Modules</span>
          </button>

          <div style={{ height: 20, width: 1, background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{moduleData?.icon || '📦'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {moduleData?.label || moduleKey}
                </h2>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: 'var(--accent-light)',
                    background: 'var(--accent-glow)',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {moduleKey}
                </span>
                <span className="badge badge-emerald">Interactive Form Studio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>
            Fields: <strong style={{ color: 'var(--text-primary)' }}>{schema.fields.length}</strong>
          </span>
          <span>•</span>
          <span>
            Table Columns: <strong style={{ color: 'var(--text-primary)' }}>{schema.tableColumns.length}</strong>
          </span>
          {isDirty && (
            <span
              style={{
                color: 'var(--warning)',
                background: 'var(--warning-bg)',
                padding: '2px 8px',
                borderRadius: 99,
                fontWeight: 600,
              }}
            >
              Unsaved Changes
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isDirty && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (window.confirm('Discard all unsaved field changes and reload last saved version?')) {
                  setSchema(JSON.parse(initialSchemaJson));
                }
              }}
              title="Discard Unsaved Changes"
            >
              <RotateCcw size={14} />
              <span>Discard</span>
            </button>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            style={{ minWidth: 130 }}
          >
            {saving ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Schema</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            position: 'absolute',
            top: 66,
            right: 24,
            zIndex: 999,
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            background: notification.type === 'success' ? 'var(--bg-elevated)' : 'var(--danger-bg)',
            border: `1px solid ${notification.type === 'success' ? 'var(--accent)' : 'var(--danger-border)'}`,
            color: notification.type === 'success' ? 'var(--accent-light)' : 'var(--danger)',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ color: 'inherit', marginLeft: 10, fontSize: 16, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Studio Split Body ── */}
      <div className="builder-body">
        {/* ── LEFT PANEL: Field Palette & Fields List ── */}
        <div className="builder-left">
          {/* Quick Add Palette */}
          <div className="builder-left-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="sidebar-section-label" style={{ padding: 0 }}>
                1. Add New Field
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to append</span>
            </div>

            <div className="palette-grid">
              {(Object.keys(FIELD_TYPE_CONFIG) as FieldType[]).map((type) => (
                <button key={type} className="palette-btn" onClick={() => addField(type)}>
                  <span style={{ color: 'var(--accent-light)' }}>{FIELD_TYPE_CONFIG[type].icon}</span>
                  <span>{FIELD_TYPE_CONFIG[type].label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Healthcare Presets Bar */}
          <div className="builder-left-section" style={{ background: 'rgba(5, 150, 105, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} color="var(--accent-light)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Healthcare Presets
              </span>
            </div>
            <div className="preset-pills">
              {Object.entries(HEALTHCARE_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  className="preset-chip"
                  onClick={() => applyPreset(key)}
                  title={`Apply ${p.name} template with ${p.fields.length} curated fields`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fields List */}
          <div className="builder-left-scroll">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="sidebar-section-label" style={{ padding: 0 }}>
                2. Configured Fields ({schema.fields.length})
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Use ↑ ↓ to reorder</span>
            </div>

            {schema.fields.length === 0 ? (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <Layers size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>No fields added yet</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Click an input type above or select a clinical preset.</p>
              </div>
            ) : (
              schema.fields.map((field, index) => {
                const isSelected = selectedFieldId === field.id;
                const isInTable = schema.tableColumns.includes(field.id);

                return (
                  <div
                    key={field.id}
                    className={`field-item-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    {/* Header: Reorder + Type + Delete */}
                    <div className="field-item-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, 'up');
                            }}
                            disabled={index === 0}
                            title="Move Up"
                            style={{ padding: '1px 4px' }}
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(index, 'down');
                            }}
                            disabled={index === schema.fields.length - 1}
                            title="Move Down"
                            style={{ padding: '1px 4px' }}
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            width: 18,
                            textAlign: 'center',
                          }}
                        >
                          #{index + 1}
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'var(--bg-surface)',
                            color: 'var(--accent-light)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {FIELD_TYPE_CONFIG[field.type]?.icon}
                          {field.type}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(field.id);
                          }}
                          title="Remove Field"
                          style={{ color: 'var(--danger)', padding: 4 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Field Label & Slug Editor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        type="text"
                        className="form-input input-sm"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Field Display Label"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontWeight: 600 }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID:</span>
                        <input
                          type="text"
                          className="form-input input-sm"
                          value={field.id}
                          onChange={(e) =>
                            updateField(field.id, {
                              id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                            })
                          }
                          placeholder="database_key"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
                        />
                      </div>
                    </div>

                    {/* Dropdown Options Editor (if select or status) */}
                    {(field.type === 'select' || field.type === 'status') && (
                      <div
                        style={{
                          marginTop: 4,
                          padding: 8,
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                          Dropdown Options:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                          {(field.options || []).map((opt) => (
                            <span
                              key={opt}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <span>{opt}</span>
                              <button
                                onClick={() => removeOptionFromField(field.id, opt)}
                                style={{ color: 'var(--danger)', fontSize: 12, lineHeight: 1 }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add Option Input */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input
                            type="text"
                            className="form-input input-sm"
                            placeholder="Add option..."
                            value={newOptionBuffers[field.id] || ''}
                            onChange={(e) =>
                              setNewOptionBuffers((prev) => ({ ...prev, [field.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addOptionToField(field.id);
                              }
                            }}
                            style={{ fontSize: 11 }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => addOptionToField(field.id)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Placeholder input */}
                    {field.type !== 'checkbox' && (
                      <input
                        type="text"
                        className="form-input input-sm"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Hint / Placeholder text"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 11 }}
                      />
                    )}

                    {/* Checkbox Options: Required & Show in Table */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 6,
                        borderTop: '1px solid var(--border)',
                        fontSize: 11,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        />
                        <span style={{ color: field.required ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                          Required *
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isInTable}
                          onChange={() => toggleTableColumn(field.id)}
                        />
                        <span style={{ color: isInTable ? 'var(--info)' : 'var(--text-muted)' }}>
                          Table Col 📊
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Live Interactive Preview Canvas ── */}
        <div className="builder-right">
          {/* Preview Navigation Tabs */}
          <div className="builder-right-tabs">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className={`btn btn-sm ${previewTab === 'form' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTab('form')}
              >
                <Sliders size={14} />
                <span>Modal Form Preview</span>
              </button>

              <button
                className={`btn btn-sm ${previewTab === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTab('table')}
              >
                <TableIcon size={14} />
                <span>Data Table Preview ({schema.tableColumns.length} cols)</span>
              </button>

              <button
                className={`btn btn-sm ${previewTab === 'json' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPreviewTab('json')}
              >
                <Code2 size={14} />
                <span>Schema JSON</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <Eye size={14} color="var(--accent-light)" />
              <span>Diagnostic Portal Live Reflection</span>
            </div>
          </div>

          {/* Interactive Canvas Area */}
          <div className="builder-preview-canvas">
            {previewTab === 'form' && (
              <div className="preview-modal-frame">
                {/* Modal Header Simulation */}
                <div
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f9fafb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#ecfdf5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                      }}
                    >
                      {moduleData?.icon || '📦'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                        Add New {moduleData?.label || 'Record'}
                      </h4>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>
                        Tenant clinical staff entry form preview
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '3px 8px',
                      borderRadius: 99,
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    Live Preview
                  </span>
                </div>

                {/* Form Fields Simulation */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {schema.fields.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>No fields in form</p>
                      <p style={{ fontSize: 12 }}>Add fields using the left panel palette</p>
                    </div>
                  ) : (
                    schema.fields.map((f) => {
                      const isHighlighted = selectedFieldId === f.id;

                      return (
                        <div
                          key={f.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            padding: isHighlighted ? '8px 12px' : '0',
                            borderRadius: 8,
                            background: isHighlighted ? '#ecfdf5' : 'transparent',
                            border: isHighlighted ? '1px dashed #059669' : '1px dashed transparent',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <label
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#1f2937',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>
                              {f.label}{' '}
                              {f.required && <span style={{ color: '#dc2626' }}>*</span>}
                            </span>
                            {isHighlighted && (
                              <span style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>
                                ACTIVE IN EDITOR
                              </span>
                            )}
                          </label>

                          {f.type === 'text' && (
                            <input
                              type="text"
                              placeholder={f.placeholder || 'Enter text...'}
                              value={previewFormData[f.id] || ''}
                              onChange={(e) =>
                                setPreviewFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                              }
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: 6,
                                border: '1px solid #d1d5db',
                                fontSize: 13,
                                color: '#111827',
                                background: '#ffffff',
                              }}
                            />
                          )}

                          {f.type === 'number' && (
                            <input
                              type="number"
                              placeholder={f.placeholder || '0'}
                              value={previewFormData[f.id] || ''}
                              onChange={(e) =>
                                setPreviewFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                              }
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: 6,
                                border: '1px solid #d1d5db',
                                fontSize: 13,
                                color: '#111827',
                                background: '#ffffff',
                              }}
                            />
                          )}

                          {f.type === 'date' && (
                            <input
                              type="date"
                              value={previewFormData[f.id] || ''}
                              onChange={(e) =>
                                setPreviewFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                              }
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: 6,
                                border: '1px solid #d1d5db',
                                fontSize: 13,
                                color: '#111827',
                                background: '#ffffff',
                              }}
                            />
                          )}

                          {f.type === 'select' && (
                            <select
                              value={previewFormData[f.id] || ''}
                              onChange={(e) =>
                                setPreviewFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                              }
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: 6,
                                border: '1px solid #d1d5db',
                                fontSize: 13,
                                color: '#111827',
                                background: '#ffffff',
                              }}
                            >
                              <option value="">-- Choose Option --</option>
                              {(f.options || []).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}

                          {f.type === 'status' && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {(f.options || ['Pending', 'Completed']).map((opt) => {
                                const isOptSelected =
                                  previewFormData[f.id] === opt || (!previewFormData[f.id] && opt === f.options?.[0]);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                      setPreviewFormData((prev) => ({ ...prev, [f.id]: opt }))
                                    }
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 99,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      border: isOptSelected ? '1px solid #059669' : '1px solid #e5e7eb',
                                      background: isOptSelected ? '#ecfdf5' : '#f9fafb',
                                      color: isOptSelected ? '#047857' : '#4b5563',
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {f.type === 'textarea' && (
                            <textarea
                              rows={3}
                              placeholder={f.placeholder || 'Enter remarks...'}
                              value={previewFormData[f.id] || ''}
                              onChange={(e) =>
                                setPreviewFormData((prev) => ({ ...prev, [f.id]: e.target.value }))
                              }
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: 6,
                                border: '1px solid #d1d5db',
                                fontSize: 13,
                                color: '#111827',
                                background: '#ffffff',
                              }}
                            />
                          )}

                          {f.type === 'checkbox' && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={!!previewFormData[f.id]}
                                onChange={(e) =>
                                  setPreviewFormData((prev) => ({ ...prev, [f.id]: e.target.checked }))
                                }
                                style={{ width: 16, height: 16, accentColor: '#059669' }}
                              />
                              <span style={{ fontSize: 13, color: '#374151' }}>
                                Mark as True / Yes
                              </span>
                            </label>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Modal Footer Simulation */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      color: '#374151',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '8px 18px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    Save Record
                  </button>
                </div>
              </div>
            )}

            {previewTab === 'table' && (
              <div className="preview-table-frame">
                {/* Table Header Bar */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f9fafb',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                      {moduleData?.label || 'Module'} Record Directory
                    </h4>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>
                      Displaying columns marked with "Table Col 📊"
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '4px 10px',
                      borderRadius: 99,
                    }}
                  >
                    {schema.tableColumns.length} Active Columns
                  </span>
                </div>

                {/* Table Mockup */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '10px 14px', fontSize: 11, color: '#4b5563', textTransform: 'uppercase' }}>
                          #
                        </th>
                        {schema.tableColumns.map((colId) => {
                          const f = schema.fields.find((field) => field.id === colId);
                          return (
                            <th
                              key={colId}
                              style={{
                                padding: '10px 14px',
                                fontSize: 11,
                                color: '#111827',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {f?.label || colId}
                            </th>
                          );
                        })}
                        <th style={{ padding: '10px 14px', fontSize: 11, color: '#4b5563', textTransform: 'uppercase' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((rowIdx) => (
                        <tr
                          key={rowIdx}
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: 13,
                            color: '#374151',
                          }}
                        >
                          <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 11 }}>
                            00{rowIdx}
                          </td>
                          {schema.tableColumns.map((colId) => {
                            const f = schema.fields.find((field) => field.id === colId);
                            let sampleVal: React.ReactNode = `Sample ${f?.label || colId}`;
                            if (f?.type === 'date') sampleVal = '2026-09-30';
                            if (f?.type === 'number') sampleVal = `${rowIdx * 1500} BDT`;
                            if (f?.type === 'status' || f?.type === 'select') {
                              sampleVal = (
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 99,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: rowIdx === 1 ? '#ecfdf5' : '#fffbeb',
                                    color: rowIdx === 1 ? '#047857' : '#b45309',
                                    border: `1px solid ${rowIdx === 1 ? '#a7f3d0' : '#fde68a'}`,
                                  }}
                                >
                                  {f.options?.[rowIdx % (f.options.length || 1)] || 'Active'}
                                </span>
                              );
                            }
                            if (f?.type === 'checkbox') {
                              sampleVal = rowIdx === 1 ? '✅ Yes' : '❌ No';
                            }

                            return (
                              <td key={colId} style={{ padding: '12px 14px' }}>
                                {sampleVal}
                              </td>
                            );
                          })}
                          <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 600 }}>
                            View / Edit
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {previewTab === 'json' && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 800,
                  background: '#0d1e17',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 20,
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-light)' }}>
                    Compiled Module JSON Schema
                  </span>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                      alert('JSON schema copied to clipboard!');
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
                <pre
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    lineHeight: 1.5,
                    overflowX: 'auto',
                    color: '#a7f3d0',
                    maxHeight: '65vh',
                  }}
                >
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
