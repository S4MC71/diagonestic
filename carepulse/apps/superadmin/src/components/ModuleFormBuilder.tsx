import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Eye,
  Check,
  X,
  Sliders,
  Type,
  Hash,
  ListFilter,
  Calendar,
  AlignLeft,
  CheckSquare,
  Activity
} from 'lucide-react';

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'status';

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface ModuleSchema {
  fields: FieldDef[];
  tableColumns: string[];
}

export interface PresetTemplate {
  name: string;
  label: string;
  icon: string;
  category: 'CLINICAL' | 'LAB' | 'PHARMACY' | 'FINANCE' | 'ADMIN' | 'GENERAL';
  description: string;
  fields: FieldDef[];
  tableColumns: string[];
}

export const HEALTHCARE_PRESETS: Record<string, PresetTemplate> = {
  radiology: {
    name: 'Radiology & Imaging',
    label: 'Radiology & Imaging',
    icon: '🩻',
    category: 'CLINICAL',
    description: 'X-Ray, CT Scan, MRI, and 4D Ultrasound scan management, modality scheduling, and findings.',
    fields: [
      { id: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'e.g. John Doe', required: true },
      { id: 'patient_phone', label: 'Patient Phone', type: 'text', placeholder: '01XXXXXXXXX', required: false },
      {
        id: 'modality',
        label: 'Modality',
        type: 'select',
        options: ['Digital X-Ray', 'CT Scan (128 Slice)', 'MRI (1.5 Tesla)', '4D Ultrasonography', 'Echocardiogram', 'Mammography'],
        required: true,
      },
      { id: 'anatomical_region', label: 'Anatomical Region / Organ', type: 'text', placeholder: 'e.g. Chest (PA View), Brain, Whole Abdomen', required: true },
      { id: 'referring_doctor', label: 'Referring Doctor', type: 'text', placeholder: 'e.g. Dr. A. Rahman (FCPS)', required: false },
      { id: 'scan_date', label: 'Scan Date', type: 'date', required: true },
      {
        id: 'scan_status',
        label: 'Scan Status',
        type: 'status',
        options: ['Scheduled', 'Scan Completed', 'Reporting In Progress', 'Report Verified', 'Delivered'],
        defaultValue: 'Scheduled',
        required: true,
      },
      { id: 'is_emergency', label: 'Emergency / STAT Case', type: 'checkbox', defaultValue: false, required: false },
      { id: 'findings', label: 'Radiologist Findings & Impressions', type: 'textarea', placeholder: 'Provisional observations, contrast notes, or impressions...', required: false },
    ],
    tableColumns: ['patient_name', 'modality', 'anatomical_region', 'referring_doctor', 'scan_date', 'scan_status'],
  },
  blood_bank: {
    name: 'Blood Bank & Transfusion',
    label: 'Blood Bank',
    icon: '🩸',
    category: 'CLINICAL',
    description: 'Donor registration, blood unit bag inventory, screening statuses, and cross-matching logs.',
    fields: [
      { id: 'donor_name', label: 'Donor Full Name', type: 'text', placeholder: 'e.g. Shakil Ahmed', required: true },
      { id: 'blood_group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
      { id: 'bag_number', label: 'Blood Bag Unit ID', type: 'text', placeholder: 'e.g. BB-2026-089', required: true },
      { id: 'donation_date', label: 'Collection Date', type: 'date', required: true },
      { id: 'donor_phone', label: 'Donor Contact', type: 'text', placeholder: '01XXXXXXXXX', required: true },
      {
        id: 'screening_status',
        label: 'Serology Screening',
        type: 'select',
        options: ['Passed (Non-Reactive)', 'Pending Lab Test', 'Failed / Reactive (Discarded)'],
        required: true,
      },
      {
        id: 'storage_status',
        label: 'Inventory Status',
        type: 'status',
        options: ['Available In Stock', 'Reserved for Patient', 'Transfused', 'Expired / Disposed'],
        defaultValue: 'Available In Stock',
        required: true,
      },
      { id: 'notes', label: 'Recipient / Cross-matching Notes', type: 'textarea', placeholder: 'Cross-matching recipient patient name, bed number...', required: false },
    ],
    tableColumns: ['bag_number', 'donor_name', 'blood_group', 'donation_date', 'screening_status', 'storage_status'],
  },
  ambulance: {
    name: 'Ambulance & Dispatch',
    label: 'Ambulance Service',
    icon: '🚑',
    category: 'CLINICAL',
    description: 'Emergency fleet dispatch, driver contacts, patient transit locations, and fare tracking.',
    fields: [
      { id: 'vehicle_no', label: 'Vehicle License Plate', type: 'text', placeholder: 'e.g. Dhaka Metro-CHA-11-2345', required: true },
      {
        id: 'ambulance_type',
        label: 'Vehicle Type',
        type: 'select',
        options: ['AC Ambulance', 'Non-AC Standard', 'ICU Support Ambulance', 'NICU / Neonatal Ambulance', 'Freezer Van'],
        required: true,
      },
      { id: 'driver_name', label: 'Driver Name', type: 'text', placeholder: 'Driver full name', required: true },
      { id: 'driver_phone', label: 'Driver Contact No.', type: 'text', placeholder: '01XXXXXXXXX', required: true },
      { id: 'pickup_location', label: 'Pickup Point', type: 'text', placeholder: 'e.g. Dhanmondi Road 27', required: true },
      { id: 'destination', label: 'Destination', type: 'text', placeholder: 'e.g. DMCH Emergency', required: true },
      {
        id: 'dispatch_status',
        label: 'Trip Status',
        type: 'status',
        options: ['Standby', 'Dispatched', 'Patient Onboard', 'Arrived Destination', 'Trip Completed'],
        defaultValue: 'Standby',
        required: true,
      },
      { id: 'trip_fare', label: 'Trip Fare (BDT)', type: 'number', placeholder: 'e.g. 2500', required: false },
    ],
    tableColumns: ['vehicle_no', 'ambulance_type', 'driver_name', 'pickup_location', 'destination', 'dispatch_status'],
  },
  physiotherapy: {
    name: 'Physiotherapy & Rehab',
    label: 'Physiotherapy',
    icon: '🏃',
    category: 'CLINICAL',
    description: 'Therapy appointment sessions, rehabilitation programs, pain score monitoring, and recovery notes.',
    fields: [
      { id: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'Patient full name', required: true },
      { id: 'therapist_name', label: 'Assigned Physiotherapist', type: 'text', placeholder: 'e.g. Dr. Nafis (DPT)', required: true },
      {
        id: 'therapy_type',
        label: 'Rehab Program',
        type: 'select',
        options: [
          'Post-Stroke Neuro Rehab',
          'Orthopedic / Joint Mobilization',
          'Cervical & Lumbar Traction',
          'Sports Injury Recovery',
          'Pediatric Physical Therapy',
          'Electrotherapy (TENS/UST)',
        ],
        required: true,
      },
      { id: 'session_number', label: 'Session Number', type: 'number', placeholder: 'e.g. 3', required: true },
      { id: 'session_date', label: 'Session Date', type: 'date', required: true },
      {
        id: 'pain_score',
        label: 'Pain Level (VAS)',
        type: 'select',
        options: ['1 - Mild', '2', '3', '4 - Moderate', '5', '6', '7 - Severe', '8', '9', '10 - Intolerable'],
        required: false,
      },
      {
        id: 'session_status',
        label: 'Session Status',
        type: 'status',
        options: ['Scheduled', 'Completed', 'Patient Cancelled', 'No Show'],
        defaultValue: 'Scheduled',
        required: true,
      },
      { id: 'progress_notes', label: 'ROM & Progress Notes', type: 'textarea', placeholder: 'Mobility improvements, exercises performed...', required: false },
    ],
    tableColumns: ['patient_name', 'therapist_name', 'therapy_type', 'session_number', 'session_date', 'session_status'],
  },
  dental: {
    name: 'Dental Care & Clinic',
    label: 'Dental Department',
    icon: '🦷',
    category: 'CLINICAL',
    description: 'Dental examinations, procedures, root canal treatments, scaling, and chairside follow-ups.',
    fields: [
      { id: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'Patient name', required: true },
      {
        id: 'procedure',
        label: 'Procedure / Treatment',
        type: 'select',
        options: ['Dental Consultation & X-Ray', 'Scaling & Polishing', 'Composite Tooth Filling', 'Root Canal Treatment (RCT)', 'Tooth Extraction / Disimpaction', 'Dental Crown / Bridge', 'Orthodontic Braces'],
        required: true,
      },
      { id: 'tooth_number', label: 'Tooth No. / Quadrant', type: 'text', placeholder: 'e.g. Upper Right #16, Lower Molar #36', required: false },
      { id: 'attending_dentist', label: 'Attending Dentist', type: 'text', placeholder: 'e.g. Dr. Sabrina (BDS)', required: true },
      { id: 'treatment_date', label: 'Date of Treatment', type: 'date', required: true },
      {
        id: 'treatment_status',
        label: 'Status',
        type: 'status',
        options: ['In Progress', 'Session Completed', 'Course Completed', 'Follow-up Required'],
        defaultValue: 'Session Completed',
        required: true,
      },
      { id: 'treatment_cost', label: 'Procedure Fee (BDT)', type: 'number', placeholder: 'e.g. 3500', required: false },
      { id: 'clinical_notes', label: 'Clinical Observations', type: 'textarea', placeholder: 'Anesthesia used, medications prescribed...', required: false },
    ],
    tableColumns: ['patient_name', 'procedure', 'tooth_number', 'attending_dentist', 'treatment_date', 'treatment_status'],
  },
};

const FIELD_TYPE_OPTIONS: Array<{ type: FieldType; label: string; icon: React.ReactNode; desc: string }> = [
  { type: 'text', label: 'Short Text', icon: <Type size={14} />, desc: 'Names, codes, short strings' },
  { type: 'number', label: 'Number', icon: <Hash size={14} />, desc: 'Amounts, quantities, age' },
  { type: 'select', label: 'Dropdown / Select', icon: <ListFilter size={14} />, desc: 'Pick from custom options list' },
  { type: 'date', label: 'Date Picker', icon: <Calendar size={14} />, desc: 'Calendar date selection' },
  { type: 'textarea', label: 'Multi-line Text', icon: <AlignLeft size={14} />, desc: 'Notes, observations, reports' },
  { type: 'checkbox', label: 'Yes/No Checkbox', icon: <CheckSquare size={14} />, desc: 'Boolean toggle or flag' },
  { type: 'status', label: 'Status Badge', icon: <Activity size={14} />, desc: 'Workflow stages with tags' },
];

interface Props {
  schema: ModuleSchema;
  onChange: (schema: ModuleSchema) => void;
  onApplyPresetMetadata?: (preset: PresetTemplate) => void;
}

export const ModuleFormBuilder: React.FC<Props> = ({ schema, onChange, onApplyPresetMetadata }) => {
  const [activeSubTab, setActiveSubTab] = useState<'builder' | 'preview'>('builder');
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  const fields = schema.fields || [];
  const tableColumns = schema.tableColumns || [];

  // Update a single field
  const updateField = (index: number, patch: Partial<FieldDef>) => {
    const updated = [...fields];
    const current = updated[index];
    const next = { ...current, ...patch };

    // If label changed and id was default, update id
    if (patch.label && (!current.id || current.id === slugify(current.label))) {
      next.id = slugify(patch.label);
    }

    updated[index] = next;

    // If ID changed, update tableColumns if it was selected
    let updatedColumns = [...tableColumns];
    if (patch.id && current.id !== patch.id) {
      updatedColumns = updatedColumns.map((c) => (c === current.id ? patch.id! : c));
    }

    onChange({
      fields: updated,
      tableColumns: updatedColumns,
    });
  };

  // Add a new empty field
  const addField = (type: FieldType = 'text') => {
    const nextNum = fields.length + 1;
    const defaultLabel = `Custom Field ${nextNum}`;
    const newField: FieldDef = {
      id: `field_${nextNum}`,
      label: defaultLabel,
      type,
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'status' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      defaultValue: type === 'checkbox' ? false : type === 'status' ? 'Option 1' : '',
    };

    const updatedFields = [...fields, newField];
    const updatedCols = fields.length < 5 ? [...tableColumns, newField.id] : tableColumns;

    onChange({
      fields: updatedFields,
      tableColumns: updatedCols,
    });
  };

  // Remove a field
  const removeField = (index: number) => {
    const fieldToRemove = fields[index];
    const updatedFields = fields.filter((_, i) => i !== index);
    const updatedCols = tableColumns.filter((c) => c !== fieldToRemove.id);

    onChange({
      fields: updatedFields,
      tableColumns: updatedCols,
    });
  };

  // Move field order
  const moveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onChange({
      fields: updated,
      tableColumns,
    });
  };

  // Toggle table column inclusion
  const toggleTableColumn = (fieldId: string) => {
    let updatedCols: string[];
    if (tableColumns.includes(fieldId)) {
      updatedCols = tableColumns.filter((c) => c !== fieldId);
    } else {
      updatedCols = [...tableColumns, fieldId];
    }
    onChange({
      fields,
      tableColumns: updatedCols,
    });
  };

  // Add option to select / status field
  const addOptionChip = (fieldIndex: number, fieldId: string) => {
    const optionText = (newOptionInputs[fieldId] || '').trim();
    if (!optionText) return;

    const field = fields[fieldIndex];
    const existing = field.options || [];
    if (!existing.includes(optionText)) {
      updateField(fieldIndex, {
        options: [...existing, optionText],
      });
    }

    setNewOptionInputs((prev) => ({ ...prev, [fieldId]: '' }));
  };

  // Remove option from select / status field
  const removeOptionChip = (fieldIndex: number, optionToRemove: string) => {
    const field = fields[fieldIndex];
    const updatedOptions = (field.options || []).filter((opt) => opt !== optionToRemove);
    updateField(fieldIndex, { options: updatedOptions });
  };

  // Load a healthcare preset
  const handleLoadPreset = (key: string) => {
    const preset = HEALTHCARE_PRESETS[key];
    if (!preset) return;

    onChange({
      fields: JSON.parse(JSON.stringify(preset.fields)),
      tableColumns: [...preset.tableColumns],
    });

    if (onApplyPresetMetadata) {
      onApplyPresetMetadata(preset);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Preset Templates Bar ───────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Quick Healthcare Presets:
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              (Click to instantly prefill specialized fields & workflow)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={`btn btn-xs ${activeSubTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('builder')}
            >
              <Sliders size={12} /> Visual Designer ({fields.length})
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeSubTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('preview')}
            >
              <Eye size={12} /> Tenant Preview
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(HEALTHCARE_PRESETS).map(([k, p]) => (
            <button
              key={k}
              type="button"
              onClick={() => handleLoadPreset(k)}
              className="btn btn-secondary btn-xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-surface)',
              }}
              title={p.description}
            >
              <span>{p.icon}</span>
              <span style={{ fontWeight: 500 }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sub Tab: Visual Designer ──────────────────────────── */}
      {activeSubTab === 'builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header & Add Field Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Configured Fields ({fields.length})
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Tenants will fill these fields when creating records in this module.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => addField('select')}
                style={{ gap: 6, color: 'var(--accent)' }}
              >
                <ListFilter size={14} /> + Add Dropdown
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => addField('text')}
                style={{ gap: 6 }}
              >
                <Type size={14} /> + Add Text
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => addField('text')}
                style={{ gap: 6 }}
              >
                <Plus size={14} /> Add Any Field
              </button>
            </div>
          </div>

          {/* Empty state */}
          {fields.length === 0 && (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
              }}
            >
              <Layers size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                No Fields Added Yet
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 16px' }}>
                Design custom forms with dropdown boxes, text inputs, date pickers, or click a healthcare preset above!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleLoadPreset('radiology')}
                >
                  Load Radiology Template
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => addField('text')}
                >
                  <Plus size={14} /> Add Custom Field
                </button>
              </div>
            </div>
          )}

          {/* Fields list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map((field, idx) => {
              const isCol = tableColumns.includes(field.id);
              return (
                <div
                  key={field.id || idx}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Top row of field card: Index, Reorder, Type, Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 99,
                          background: 'var(--accent-glow)',
                          color: 'var(--accent)',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </span>

                      {/* Type selector */}
                      <select
                        className="form-select"
                        value={field.type}
                        onChange={(e) => updateField(idx, { type: e.target.value as FieldType })}
                        style={{
                          height: 30,
                          padding: '0 8px',
                          fontSize: 12,
                          fontWeight: 600,
                          width: 'auto',
                        }}
                      >
                        {FIELD_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.type} value={opt.type}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        ID: <code style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{field.id}</code>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Show as table column toggle */}
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          cursor: 'pointer',
                          color: isCol ? 'var(--accent)' : 'var(--text-secondary)',
                          background: isCol ? 'var(--accent-glow)' : 'transparent',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: isCol ? '1px solid var(--accent)' : '1px solid transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isCol}
                          onChange={() => toggleTableColumn(field.id)}
                          style={{ margin: 0 }}
                        />
                        <span>Table Column</span>
                      </label>

                      {/* Required toggle */}
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          cursor: 'pointer',
                          color: field.required ? 'var(--warning)' : 'var(--text-secondary)',
                          padding: '3px 6px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!field.required}
                          onChange={(e) => updateField(idx, { required: e.target.checked })}
                          style={{ margin: 0 }}
                        />
                        <span>Required</span>
                      </label>

                      {/* Reorder buttons */}
                      <button
                        type="button"
                        className="btn btn-icon btn-ghost btn-xs"
                        onClick={() => moveField(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-ghost btn-xs"
                        onClick={() => moveField(idx, 'down')}
                        disabled={idx === fields.length - 1}
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-icon btn-ghost btn-xs"
                        onClick={() => removeField(idx)}
                        style={{ color: 'var(--danger)' }}
                        title="Delete Field"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Middle row: Label & Placeholder */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        Field Label *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        placeholder="e.g. Modality, Organ, Referring Doctor"
                        style={{ height: 32, fontSize: 13 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        Placeholder / Hint Text
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                        placeholder="e.g. Enter patient name..."
                        style={{ height: 32, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  {/* If dropdown (select) or status: Render Options Chips Manager */}
                  {(field.type === 'select' || field.type === 'status') && (
                    <div
                      style={{
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                          Dropdown Choices / Options List:
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {(field.options || []).length} options configured
                        </span>
                      </div>

                      {/* Chips list */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {(field.options || []).map((opt) => (
                          <span
                            key={opt}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 8px',
                              borderRadius: 99,
                              background: field.type === 'status' ? 'rgba(59,130,246,0.15)' : 'var(--bg-surface)',
                              border: '1px solid var(--border)',
                              fontSize: 12,
                              color: 'var(--text-primary)',
                            }}
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => removeOptionChip(idx, opt)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                color: 'var(--text-muted)',
                              }}
                              title="Remove option"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add new option input */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          className="form-input"
                          value={newOptionInputs[field.id] || ''}
                          onChange={(e) =>
                            setNewOptionInputs((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addOptionChip(idx, field.id);
                            }
                          }}
                          placeholder="Type an option and press Enter (e.g. X-Ray, CT Scan, MRI)..."
                          style={{ height: 30, fontSize: 12 }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => addOptionChip(idx, field.id)}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <Plus size={12} /> Add Choice
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sub Tab: Tenant Portal Live Preview ────────────────── */}
      {activeSubTab === 'preview' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Tenant "+ Add Record" Form Preview
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                This is how the tenant's modal will appear to diagnostic staff.
              </p>
            </div>
            <span style={{ fontSize: 11, background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 99 }}>
              Interactive Live Preview
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {fields.map((f) => (
              <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {f.label} {f.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                </label>

                {f.type === 'select' ? (
                  <select className="form-select" disabled style={{ fontSize: 13, background: 'var(--bg-elevated)' }}>
                    <option value="">Select {f.label}...</option>
                    {(f.options || []).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === 'status' ? (
                  <select className="form-select" disabled style={{ fontSize: 13, background: 'var(--bg-elevated)', fontWeight: 600 }}>
                    {(f.options || []).map((o) => (
                      <option key={o} value={o}>● {o}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea className="form-input" disabled rows={2} placeholder={f.placeholder || 'Enter notes...'} style={{ fontSize: 13, background: 'var(--bg-elevated)' }} />
                ) : f.type === 'checkbox' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 4 }}>
                    <input type="checkbox" disabled />
                    <span>{f.label}</span>
                  </label>
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    className="form-input"
                    disabled
                    placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                    style={{ fontSize: 13, background: 'var(--bg-elevated)' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Table Columns Preview */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
              Tenant Records Table Headers:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>
                # Record ID
              </span>
              {tableColumns.map((colId) => {
                const f = fields.find((x) => x.id === colId);
                return (
                  <span
                    key={colId}
                    style={{
                      padding: '4px 10px',
                      background: 'var(--accent-glow)',
                      border: '1px solid var(--accent)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={12} /> {f?.label || colId}
                  </span>
                );
              })}
              <span style={{ padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>
                Created At
              </span>
              <span style={{ padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>
                Actions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
