import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TestTube2,
  CheckCircle,
  Printer,
  ArrowRight,
  Clock,
  QrCode,
  Search,
  Check,
  AlertCircle,
  Trash2,
  Edit2,
  Filter,
  X,
  Sparkles
} from 'lucide-react';

interface TubeSpec {
  name: string;
  color: string;
  bg: string;
  border: string;
  type: string;
}

const TUBE_CONFIGS: Record<string, TubeSpec> = {
  EDTA: {
    name: 'Purple Top (EDTA Blood)',
    color: '#7c3aed',
    bg: '#f3e8ff',
    border: '#d8b4fe',
    type: 'Whole Blood'
  },
  Serum: {
    name: 'Red Top (Clot Activator)',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fca5a5',
    type: 'Serum'
  },
  Gel: {
    name: 'Yellow Top (SST Gel)',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
    type: 'Serum'
  },
  Fluoride: {
    name: 'Grey Top (Fluoride Oxalate)',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    type: 'Plasma'
  },
  Citrate: {
    name: 'Blue Top (Sodium Citrate)',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
    type: 'Citrated Plasma'
  },
  Urine: {
    name: 'Sterile Urine Container',
    color: '#ca8a04',
    bg: '#fef9c3',
    border: '#fef08a',
    type: 'Urine'
  },
  Stool: {
    name: 'Stool Specimen Pot',
    color: '#854d0e',
    bg: '#fef3c7',
    border: '#fde68a',
    type: 'Stool'
  }
};

export const SamplesView: React.FC = () => {
  const { invoices, samples, collectSample, receiveSampleInLab, currentUser, showToast } = useApp();

  // Search & Filter for Collection
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [collectorName, setCollectorName] = useState('Md. Al-Amin (Phlebotomist)');
  const [selectedTubeType, setSelectedTubeType] = useState('Purple Top (EDTA)');

  // Search & Filter for Collected Samples Table
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit sample modal
  const [editingSample, setEditingSample] = useState<(typeof samples)[0] | null>(null);

  // Invoices pending sample collection
  const pendingInvoices = invoices.filter(inv => {
    const hasPending = inv.items.some(
      item => item.sampleType && item.sampleType !== 'None'
    );
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.patientPhone.includes(invoiceSearch);
    return hasPending && matchesSearch;
  });

  const activeInvoice =
    invoices.find(inv => inv.id === selectedInvoiceId) || pendingInvoices[0] || invoices[0];

  const handleCollect = () => {
    if (!activeInvoice) return;
    const pendingSample = samples.find(
      s => s.invoiceId === activeInvoice.id && s.status === 'Pending Collection'
    );
    if (pendingSample) {
      collectSample(pendingSample.id, collectorName);
      showToast(`Sample collected for invoice ${activeInvoice.invoiceNo}`);
    } else {
      showToast(`Specimen recorded for ${activeInvoice.patientName}`);
    }
  };

  const filteredSamples = samples.filter(s => {
    const matchSearch =
      s.barcode.toLowerCase().includes(tableSearch.toLowerCase()) ||
      s.invoiceNo.toLowerCase().includes(tableSearch.toLowerCase()) ||
      s.patientName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      s.testNames.some(t => t.toLowerCase().includes(tableSearch.toLowerCase()));

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'COLLECTED' && s.status === 'Collected') ||
      (statusFilter === 'RECEIVED' && s.status === 'Received in Lab');

    return matchSearch && matchStatus;
  });

  // Determine tube style for a given container
  const getTubeStyle = (containerStr: string) => {
    for (const key in TUBE_CONFIGS) {
      if (containerStr.toLowerCase().includes(key.toLowerCase())) {
        return TUBE_CONFIGS[key];
      }
    }
    return TUBE_CONFIGS.EDTA;
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sample Collection</h1>
          <p className="page-subtitle">
            Phlebotomy Draw Station, Barcode Accession & Laboratory Custody Handoff
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              window.print();
              showToast('Printing pending collection worklist');
            }}
          >
            <Printer size={15} /> Print Worklist
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. COLLECT SAMPLES SECTION (Split 2-Column Layout)        */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        {/* Left Column: Specimen Draw Selector */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Collect Samples
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Select an invoice to see all pending tests and collect samples individually.
              </span>
            </div>
            <span className="badge badge-inhouse">
              {pendingInvoices.length} Invoices in Queue
            </span>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12px' }}>
              Search Invoice or Patient ( / )
            </label>
            <div className="table-search-input" style={{ width: '100%' }}>
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search invoice number, patient name, or phone..."
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
              />
            </div>
          </div>

          {activeInvoice && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    {activeInvoice.patientName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {activeInvoice.patientAge} Years · {activeInvoice.patientGender} · Phone: {activeInvoice.patientPhone}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {activeInvoice.invoiceNo}
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Ref: {activeInvoice.referredByName || 'Self Referral'}
                  </div>
                </div>
              </div>

              {/* Pending Tests with Tube Caps */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Tests Requiring Specimen Draw
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {activeInvoice.items.map((item, idx) => {
                    const tube = getTubeStyle(item.containerType || 'Purple');
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: tube.color,
                              display: 'inline-block'
                            }}
                          />
                          <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                            {item.testName}
                          </strong>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: tube.bg,
                            color: tube.color,
                            border: `1px solid ${tube.border}`
                          }}
                        >
                          {tube.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phlebotomist & Collector inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Phlebotomist Name</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: '34px', fontSize: '12px' }}
                    value={collectorName}
                    onChange={e => setCollectorName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Vacutainer Container</label>
                  <select
                    className="form-control"
                    style={{ height: '34px', fontSize: '12px' }}
                    value={selectedTubeType}
                    onChange={e => setSelectedTubeType(e.target.value)}
                  >
                    <option>Purple Top (EDTA Blood)</option>
                    <option>Red Top (Clot Activator)</option>
                    <option>Yellow Top (SST Gel)</option>
                    <option>Grey Top (Fluoride)</option>
                    <option>Blue Top (Sodium Citrate)</option>
                    <option>Sterile Urine Container</option>
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '4px' }}
                onClick={handleCollect}
              >
                <TestTube2 size={16} /> Collect Sample & Print Barcode
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Barcode Label Preview */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Barcode Label Preview
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Standard 50mm × 25mm Label
              </span>
            </div>

            {/* Simulated Realistic Barcode Sticker */}
            <div
              style={{
                background: '#ffffff',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', letterSpacing: '0.5px', color: '#059669' }}>
                  CAREPULSE LABS
                </strong>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #000000', paddingTop: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#000000' }}>
                  {activeInvoice?.patientName || 'PATIENT NAME'}
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  {activeInvoice ? `${activeInvoice.patientAge}Y / ${activeInvoice.patientGender[0]} · ${activeInvoice.invoiceNo}` : '35Y / M · INV-1002'}
                </div>
              </div>

              {/* Realistic SVG Barcode Lines */}
              <div style={{ padding: '6px 0', textAlign: 'center' }}>
                <svg
                  width="100%"
                  height="45"
                  viewBox="0 0 240 45"
                  style={{ display: 'block', margin: '0 auto' }}
                >
                  {/* Generated barcode vertical bars */}
                  {[
                    2, 5, 9, 14, 18, 22, 25, 29, 34, 38, 43, 46, 51, 56, 60, 65, 70, 74, 78, 83,
                    88, 92, 97, 102, 107, 112, 116, 121, 126, 131, 136, 140, 145, 150, 155, 160,
                    165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230
                  ].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="2"
                      width={i % 3 === 0 ? '3' : i % 2 === 0 ? '2' : '1.2'}
                      height="38"
                      fill="#000000"
                    />
                  ))}
                </svg>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    marginTop: '2px',
                    color: '#000000'
                  }}
                >
                  *SAMP-{activeInvoice?.invoiceNo.slice(-4) || '8492'}*
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10px',
                  fontWeight: 600,
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '4px'
                }}
              >
                <span>Tube: {selectedTubeType.split(' ')[0]}</span>
                <span style={{ color: '#059669' }}>PHLEB: AL-AMIN</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                window.print();
                showToast(`Printing sticker label for ${activeInvoice?.patientName}`);
              }}
            >
              <Printer size={15} /> Print Barcode Label
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. COLLECTED SAMPLES TABLE                                */}
      {/* ========================================================= */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Collected Samples
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Specimen accession worklist and laboratory custody
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="table-search-input" style={{ width: '220px' }}>
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search lab no, barcode..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '160px', height: '34px', fontSize: '12px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="COLLECTED">Collected (In Handoff)</option>
              <option value="RECEIVED">Received in Lab</option>
            </select>
          </div>
        </div>

        {filteredSamples.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No samples found matching search criteria.
          </div>
        ) : (
          <table className="custom-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>SAMPLE BARCODE</th>
                <th>INVOICE #</th>
                <th>PATIENT DETAILS</th>
                <th>TESTS INCLUDED</th>
                <th>CONTAINER / TUBE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center', width: '130px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.map(s => {
                const tube = getTubeStyle(s.containerType || 'Purple');

                return (
                  <tr key={s.id}>
                    <td>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#059669',
                          fontSize: '13px'
                        }}
                      >
                        {s.barcode}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {s.sampleId}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{s.invoiceNo}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{s.patientName}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {s.patientAge}Y, {s.patientGender} · {s.patientPhone}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {s.testNames.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: tube.bg,
                          color: tube.color,
                          border: `1px solid ${tube.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: tube.color
                          }}
                        />
                        {s.containerType}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === 'Received in Lab'
                            ? 'badge-paid'
                            : s.status === 'Collected'
                            ? 'badge-partial'
                            : 'badge-due'
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.collectedAt && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                          {s.collectedAt} by {s.collectedBy}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {s.status === 'Collected' && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                            title="Acknowledge reception in lab"
                            onClick={() => receiveSampleInLab(s.id)}
                          >
                            <CheckCircle size={12} /> Receive
                          </button>
                        )}
                        <button
                          className="icon-btn"
                          title="Print Barcode Label"
                          onClick={() => {
                            window.print();
                            showToast(`Printing barcode label ${s.barcode}`);
                          }}
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Edit Sample Record"
                          onClick={() => setEditingSample(s)}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: Edit Sample Container / Info                       */}
      {/* ========================================================= */}
      {editingSample && (
        <div className="modal-backdrop" onClick={() => setEditingSample(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Sample Accession</h3>
              <button className="icon-btn" onClick={() => setEditingSample(null)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast(`Updated sample record ${editingSample.barcode}`);
                setEditingSample(null);
              }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Barcode: <strong>{editingSample.barcode}</strong></div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Patient: {editingSample.patientName} ({editingSample.invoiceNo})
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Container Type</label>
                  <select
                    className="form-control"
                    value={editingSample.containerType}
                    onChange={e =>
                      setEditingSample({ ...editingSample, containerType: e.target.value })
                    }
                  >
                    <option>Purple Top (EDTA Blood)</option>
                    <option>Red Top (Plain / Clot)</option>
                    <option>Yellow Top (SST Gel)</option>
                    <option>Grey Top (Fluoride)</option>
                    <option>Blue Top (Citrate)</option>
                    <option>Sterile Urine Container</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phlebotomist / Collector</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingSample.collectedBy || ''}
                    onChange={e =>
                      setEditingSample({ ...editingSample, collectedBy: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingSample(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
