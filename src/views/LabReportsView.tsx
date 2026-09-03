import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ClipboardCheck, CheckCircle2, MessageCircle, Printer, AlertTriangle } from 'lucide-react';

export const LabReportsView: React.FC = () => {
  const { invoices, labReports, updateLabReportResults, verifyLabReport, showToast } = useApp();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected report state
  const selectedReport = labReports.find(r => r.invoiceId === selectedInvoiceId) || (selectedInvoiceId ? {
    id: `rep-${selectedInvoiceId}`,
    invoiceId: selectedInvoiceId,
    invoiceNo: invoices.find(i => i.id === selectedInvoiceId)?.invoiceNo || '',
    patientName: invoices.find(i => i.id === selectedInvoiceId)?.patientName || '',
    patientPhone: invoices.find(i => i.id === selectedInvoiceId)?.patientPhone || '',
    patientAge: invoices.find(i => i.id === selectedInvoiceId)?.patientAge || 30,
    patientGender: invoices.find(i => i.id === selectedInvoiceId)?.patientGender || 'Male',
    testName: invoices.find(i => i.id === selectedInvoiceId)?.items.map(t => t.testName).join(', ') || 'Lab Test',
    category: 'Haematology',
    technologistName: 'Farzana Parvin',
    technologistDegree: 'B.Sc in Health Technology (Lab)',
    pathologistName: 'Prof. Dr. M. A. Rahman',
    pathologistDegree: 'MBBS, M.Phil (Pathology)',
    status: 'PENDING_ENTRY' as const,
    results: [
      { parameterName: 'Hemoglobin (Hb%)', resultValue: '13.5', unit: 'g/dL', normalRange: '13.0 - 17.0', isAbnormal: false },
      { parameterName: 'Total WBC Count', resultValue: '7,800', unit: '/cu.mm', normalRange: '4,000 - 11,000', isAbnormal: false },
      { parameterName: 'Platelet Count', resultValue: '260,000', unit: '/cu.mm', normalRange: '150,000 - 450,000', isAbnormal: false },
      { parameterName: 'ESR (Westergren)', resultValue: '12', unit: 'mm in 1st hr', normalRange: '0 - 20', isAbnormal: false }
    ]
  } : null);

  const [localResults, setLocalResults] = useState(selectedReport?.results || []);
  const [remarks, setRemarks] = useState(selectedReport?.interpretationRemarks || 'All analyzed parameters are within biological reference intervals for age and sex.');

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    const rep = labReports.find(r => r.invoiceId === id);
    if (rep) {
      setLocalResults(rep.results);
      setRemarks(rep.interpretationRemarks || '');
    }
  };

  const handleResultChange = (idx: number, val: string) => {
    const updated = [...localResults];
    updated[idx].resultValue = val;
    // Check if numeric and out of range (simplified demonstration check)
    const num = parseFloat(val);
    if (updated[idx].parameterName.includes('Hemoglobin') && (num < 13.0 || num > 17.0)) {
      updated[idx].isAbnormal = true;
    } else if (updated[idx].parameterName.includes('WBC') && (num < 4000 || num > 11000)) {
      updated[idx].isAbnormal = true;
    } else {
      updated[idx].isAbnormal = false;
    }
    setLocalResults(updated);
  };

  const handleSaveResults = () => {
    if (!selectedInvoiceId) return;
    updateLabReportResults(selectedInvoiceId, localResults, remarks);
  };

  const handleVerify = () => {
    if (!selectedInvoiceId) return;
    verifyLabReport(selectedInvoiceId, 'Prof. Dr. M. A. Rahman');
  };

  const handleWhatsApp = (invNo: string, patientName: string, phone: string) => {
    const text = encodeURIComponent(
      `ঝালকাঠি ডায়াগনস্টিক সেন্টার\nশ্রদ্ধেয় ${patientName},\nআপনার ইনভয়েস (${invNo}) এর ডায়াগনস্টিক রিপোর্ট প্রস্তুত ও ভেরিফাই হয়েছে। ল্যাব কাউন্টার থেকে রিপোর্ট সংগ্রহ করুন অথবা অনলাইনে দেখুন: https://jhalakathid.sihatsuite.com/reports/${invNo}`
    );
    window.open(`https://wa.me/88${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    showToast(`WhatsApp report notification sent to ${patientName}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lab Reports</h1>
          <p className="page-subtitle">Pick an invoice to enter results, or search the report history below.</p>
        </div>
      </div>

      {/* Filter / Invoice Selection Toolbar matching SihatSuite */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Invoice to Enter Results</label>
            <select
              className="form-control"
              value={selectedInvoiceId}
              onChange={e => handleSelectInvoice(e.target.value)}
            >
              <option value="">— select invoice —</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNo} — {inv.patientName} ({inv.items.map(i => i.testName).join(', ')})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Query</label>
            <input
              type="text"
              className="form-control"
              placeholder="Invoice no, patient name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <button className="btn btn-secondary" onClick={() => showToast('Filtered records')}>
            <Search size={15} /> Search
          </button>
        </div>
      </div>

      {/* Result Entry Canvas when Invoice is Selected */}
      {selectedReport && selectedInvoiceId && (
        <div className="card" style={{ marginBottom: '24px', border: '1.5px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#073f8f', margin: 0 }}>
                Clinical Pathology & Biochemistry Findings: {selectedReport.invoiceNo}
              </h3>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                Patient: <strong>{selectedReport.patientName}</strong> ({selectedReport.patientAge}Y, {selectedReport.patientGender}) · Tests: {selectedReport.testName}
              </div>
            </div>

            <span className={`badge ${selectedReport.status === 'VERIFIED' ? 'badge-paid' : 'badge-partial'}`}>
              {selectedReport.status}
            </span>
          </div>

          <table className="custom-table" style={{ fontSize: '13px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>Test Parameter</th>
                <th style={{ width: '180px' }}>Observed Result</th>
                <th>Unit</th>
                <th>Standard Reference Interval</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {localResults.map((r, i) => (
                <tr key={i} style={{ background: r.isAbnormal ? '#fef2f2' : 'transparent' }}>
                  <td><strong>{r.parameterName}</strong></td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      style={{ height: '34px', fontWeight: 700, color: r.isAbnormal ? '#dc2626' : '#0f172a' }}
                      value={r.resultValue}
                      onChange={e => handleResultChange(i, e.target.value)}
                    />
                  </td>
                  <td>{r.unit}</td>
                  <td style={{ color: '#64748b' }}>{r.normalRange}</td>
                  <td style={{ textAlign: 'center' }}>
                    {r.isAbnormal ? (
                      <span className="badge badge-due" style={{ fontSize: '10px' }}>
                        <AlertTriangle size={11} style={{ marginRight: '3px' }} /> ABNORMAL
                      </span>
                    ) : (
                      <span className="badge badge-paid" style={{ fontSize: '10px' }}>
                        NORMAL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-group">
            <label className="form-label">Pathologist Clinical Remarks & Interpretation</label>
            <textarea
              className="form-control"
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={handleSaveResults}>
                <ClipboardCheck size={15} /> Save Findings
              </button>
              <button className="btn btn-primary" onClick={handleVerify}>
                <CheckCircle2 size={15} /> Approve & Sign as Pathologist
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ color: '#16a34a' }}
                onClick={() => handleWhatsApp(selectedReport.invoiceNo, selectedReport.patientName, selectedReport.patientPhone)}
              >
                <MessageCircle size={15} /> Send WhatsApp Alert
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  window.print();
                  showToast('Printing official laboratory report');
                }}
              >
                <Printer size={15} /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Directory Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Investigation Name</th>
              <th>Technologist</th>
              <th>Pathologist</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labReports.map(rep => (
              <tr key={rep.id}>
                <td><strong style={{ color: '#073f8f' }}>{rep.invoiceNo}</strong></td>
                <td>
                  <strong>{rep.patientName}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{rep.patientAge}Y, {rep.patientGender} · {rep.patientPhone}</div>
                </td>
                <td>{rep.testName}</td>
                <td>{rep.technologistName}</td>
                <td>{rep.pathologistName}</td>
                <td>
                  <span className={`badge ${rep.status === 'VERIFIED' ? 'badge-paid' : 'badge-partial'}`}>
                    {rep.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSelectInvoice(rep.invoiceId)}
                    >
                      Enter Results
                    </button>
                    <button
                      className="icon-btn"
                      style={{ color: '#16a34a' }}
                      title="WhatsApp Notification"
                      onClick={() => handleWhatsApp(rep.invoiceNo, rep.patientName, rep.patientPhone)}
                    >
                      <MessageCircle size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
