import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TestTube2, CheckCircle, Printer, ArrowRight, Clock, QrCode } from 'lucide-react';

export const SamplesView: React.FC = () => {
  const { invoices, samples, collectSample, receiveSampleInLab, currentUser, showToast } = useApp();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedContainer, setSelectedContainer] = useState<string>('Purple Top (EDTA)');

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  const handleCollect = () => {
    if (!selectedInvoice) return;
    const pendingSample = samples.find(s => s.invoiceId === selectedInvoice.id && s.status === 'Pending Collection');
    if (pendingSample) {
      collectSample(pendingSample.id, currentUser?.name || 'Md. Al-Amin (Phlebotomist)');
    } else {
      showToast('Sample already collected for this invoice');
    }
    setSelectedInvoiceId('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sample Collection</h1>
          <p className="page-subtitle">Select an invoice to see all pending tests and collect samples individually.</p>
        </div>
      </div>

      {/* 1. Collect Samples Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>
          Collect Samples
        </h3>

        <div className="form-group" style={{ maxWidth: '600px' }}>
          <label className="form-label">Select Invoice</label>
          <select
            className="form-control"
            value={selectedInvoiceId}
            onChange={e => setSelectedInvoiceId(e.target.value)}
          >
            <option value="">— choose an invoice —</option>
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNo} — {inv.patientName} ({inv.patientAge}Y, {inv.patientPhone}) — {inv.items.map(i => i.testName).join(', ')}
              </option>
            ))}
          </select>
        </div>

        {selectedInvoice && (
          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Patient:</span>
                <div><strong>{selectedInvoice.patientName}</strong> ({selectedInvoice.patientAge}Y, {selectedInvoice.patientGender})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Phone:</span>
                <div>{selectedInvoice.patientPhone}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Referred By:</span>
                <div>{selectedInvoice.referredByName || 'Self'}</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#059669', marginBottom: '8px' }}>
              Pending Tests for Specimen Draw:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
              {selectedInvoice.items.map((i, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  <strong>{i.testName}</strong> — Specimen: {i.sampleType} ({i.containerType})
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ width: '280px', marginBottom: 0 }}>
                <label className="form-label">Vacutainer Tube / Container</label>
                <select
                  className="form-control"
                  value={selectedContainer}
                  onChange={e => setSelectedContainer(e.target.value)}
                >
                  <option>Purple Top (EDTA)</option>
                  <option>Red Top (Plain/Clot)</option>
                  <option>Yellow Top (Gel)</option>
                  <option>Grey Top (Fluoride)</option>
                  <option>Blue Top (Citrate)</option>
                  <option>Urine Container</option>
                  <option>Stool Container</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={handleCollect}>
                <TestTube2 size={16} /> Collect Sample & Generate Barcode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Collected Samples Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Collected Samples</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Specimen accession worklist and laboratory custody</span>
          </div>
          <span className="badge badge-inhouse">{samples.length} Samples in Queue</span>
        </div>

        {samples.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No samples collected yet.
          </div>
        ) : (
          <table className="custom-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Sample Barcode</th>
                <th>Invoice #</th>
                <th>Patient Details</th>
                <th>Tests Included</th>
                <th>Container Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {samples.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                      {s.barcode}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>ID: {s.sampleId}</div>
                  </td>
                  <td><strong>{s.invoiceNo}</strong></td>
                  <td>
                    <strong>{s.patientName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{s.patientAge}Y, {s.patientGender} · {s.patientPhone}</div>
                  </td>
                  <td>{s.testNames.join(', ')}</td>
                  <td>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9' }}>
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
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {s.status === 'Collected' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => receiveSampleInLab(s.id)}
                        >
                          <CheckCircle size={13} /> Receive in Lab
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
                        <Printer size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
