import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ClipboardCheck,
  CheckCircle2,
  MessageCircle,
  Printer,
  AlertTriangle,
  Link,
  Share2,
  FileText,
  Clock,
  Check,
  X,
  ExternalLink,
  SlidersHorizontal,
  Download
} from 'lucide-react';

export const LabReportsView: React.FC = () => {
  const {
    tenantSettings,
    invoices,
    labReports,
    updateLabReportResults,
    verifyLabReport,
    showToast
  } = useApp();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected report state
  const selectedReport =
    labReports.find(r => r.invoiceId === selectedInvoiceId) ||
    (selectedInvoiceId
      ? {
          id: `rep-${selectedInvoiceId}`,
          invoiceId: selectedInvoiceId,
          invoiceNo: invoices.find(i => i.id === selectedInvoiceId)?.invoiceNo || '',
          patientName: invoices.find(i => i.id === selectedInvoiceId)?.patientName || '',
          patientPhone: invoices.find(i => i.id === selectedInvoiceId)?.patientPhone || '',
          patientAge: invoices.find(i => i.id === selectedInvoiceId)?.patientAge || 30,
          patientGender: invoices.find(i => i.id === selectedInvoiceId)?.patientGender || 'Male',
          testName:
            invoices
              .find(i => i.id === selectedInvoiceId)
              ?.items.map(t => t.testName)
              .join(', ') || 'Lab Test',
          category: 'Haematology',
          technologistName: 'Farzana Parvin',
          technologistDegree: 'B.Sc in Health Technology (Lab)',
          pathologistName: 'Prof. Dr. M. A. Rahman',
          pathologistDegree: 'MBBS, M.Phil (Pathology)',
          status: 'PENDING_ENTRY' as const,
          results: [
            {
              parameterName: 'Hemoglobin (Hb%)',
              resultValue: '13.5',
              unit: 'g/dL',
              normalRange: '13.0 - 17.0',
              isAbnormal: false
            },
            {
              parameterName: 'Total WBC Count',
              resultValue: '7,800',
              unit: '/cu.mm',
              normalRange: '4,000 - 11,000',
              isAbnormal: false
            },
            {
              parameterName: 'Platelet Count',
              resultValue: '260,000',
              unit: '/cu.mm',
              normalRange: '150,000 - 450,000',
              isAbnormal: false
            },
            {
              parameterName: 'ESR (Westergren)',
              resultValue: '12',
              unit: 'mm in 1st hr',
              normalRange: '0 - 20',
              isAbnormal: false
            }
          ]
        }
      : null);

  const [localResults, setLocalResults] = useState(selectedReport?.results || []);
  const [remarks, setRemarks] = useState(
    selectedReport?.interpretationRemarks ||
      'All analyzed parameters are within biological reference intervals for age and sex.'
  );

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    const rep = labReports.find(r => r.invoiceId === id);
    if (rep) {
      setLocalResults(rep.results);
      setRemarks(rep.interpretationRemarks || 'All analyzed parameters are within biological reference intervals for age and sex.');
    }
  };

  const handleResultChange = (idx: number, val: string) => {
    const updated = [...localResults];
    updated[idx].resultValue = val;
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
    showToast('Saved laboratory parameter findings');
  };

  const handleVerify = () => {
    if (!selectedInvoiceId) return;
    verifyLabReport(selectedInvoiceId, 'Prof. Dr. M. A. Rahman');
    showToast('Approved & digitally signed report as Pathologist');
  };

  const handleWhatsApp = (invNo: string, patientName: string, phone: string) => {
    const centerTitle = tenantSettings?.name || 'CarePulse Diagnostic Center';
    const slug = tenantSettings?.slug || 'carepulse';
    const text = encodeURIComponent(
      `${centerTitle}\nDear ${patientName},\nYour diagnostic test report for Invoice #${invNo} is verified and ready. You can collect it from the counter or view online: https://${slug}.carepulse.health/reports/${invNo}`
    );
    window.open(`https://wa.me/88${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    showToast(`WhatsApp report alert link opened for ${patientName}`);
  };

  const handleCopyApprovalLink = (invNo: string) => {
    const slug = tenantSettings?.slug || 'carepulse';
    const linkUrl = `https://${slug}.carepulse.health/verify/report/${invNo}`;
    navigator.clipboard.writeText(linkUrl);
    showToast(`Copied verified approval link for ${invNo}`);
  };

  // Group invoices for reports view
  const filteredInvoices = invoices.filter(inv => {
    const matchQuery =
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientPhone.includes(searchQuery);

    const matchFrom = !fromDate || inv.date >= fromDate;
    const matchTo = !toDate || inv.date <= toDate;

    return matchQuery && matchFrom && matchTo;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laboratory Reports</h1>
          <p className="page-subtitle">
            Enter Analyzed Clinical Results, Pathologist Verification & Digital Report Dispatches
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              window.print();
              showToast('Printing daily batch report ledger');
            }}
          >
            <Printer size={15} /> Print Batch Ledger
          </button>
        </div>
      </div>

      {/* Filter / Invoice Selection Toolbar matching SihatSuite */}
      <div
        style={{
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="table-search-input" style={{ width: '260px' }}>
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search invoice #, patient ( / )..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>From:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '135px', height: '34px', fontSize: '12px' }}
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>To:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '135px', height: '34px', fontSize: '12px' }}
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '150px', height: '34px', fontSize: '12px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="VERIFIED">Verified / Approved</option>
            <option value="PENDING">Pending Entry</option>
          </select>
        </div>

        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Total Invoices: <strong>{filteredInvoices.length}</strong>
        </span>
      </div>

      {/* Result Entry Canvas when Invoice is Selected */}
      {selectedReport && selectedInvoiceId && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            border: '2px solid #059669',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.08)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {selectedReport.invoiceNo}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Clinical Findings & Pathologist Sign-off
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                Patient: <strong>{selectedReport.patientName}</strong> ({selectedReport.patientAge}Y, {selectedReport.patientGender}) · Tests: {selectedReport.testName}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={`badge ${
                  selectedReport.status === 'VERIFIED' ? 'badge-paid' : 'badge-partial'
                }`}
              >
                {selectedReport.status}
              </span>
              <button
                className="icon-btn"
                onClick={() => setSelectedInvoiceId('')}
                title="Close Entry Canvas"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <table className="custom-table" style={{ fontSize: '13px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>TEST PARAMETER</th>
                <th style={{ width: '180px' }}>OBSERVED RESULT</th>
                <th>UNIT</th>
                <th>STANDARD REFERENCE INTERVAL</th>
                <th style={{ textAlign: 'center', width: '110px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {localResults.map((r, i) => (
                <tr key={i} style={{ background: r.isAbnormal ? '#fef2f2' : 'transparent' }}>
                  <td>
                    <strong>{r.parameterName}</strong>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      style={{
                        height: '32px',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: r.isAbnormal ? '#dc2626' : '#0f172a'
                      }}
                      value={r.resultValue}
                      onChange={e => handleResultChange(i, e.target.value)}
                    />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                      {r.unit}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{r.normalRange}</td>
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

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
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
                onClick={() =>
                  handleWhatsApp(
                    selectedReport.invoiceNo,
                    selectedReport.patientName,
                    selectedReport.patientPhone
                  )
                }
              >
                <MessageCircle size={15} /> Send WhatsApp Alert
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  window.print();
                  showToast('Printing official signed laboratory report');
                }}
              >
                <Printer size={15} /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Invoices Grouped Directory List matching SihatSuite */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredInvoices.map(inv => {
          const report = labReports.find(r => r.invoiceId === inv.id);
          const isVerified = report?.status === 'VERIFIED';

          return (
            <div
              key={inv.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Invoice Group Header Bar matching SihatSuite */}
              <div
                style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {inv.invoiceNo}
                  </span>

                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                      {inv.patientName}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                      {inv.patientAge}Y · {inv.patientGender} · {inv.patientPhone}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Approval Link pill */}
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => handleCopyApprovalLink(inv.invoiceNo)}
                    title="Copy Public Report Verification URL"
                  >
                    <Link size={12} /> Approval link
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => {
                      window.print();
                      showToast(`Printing all reports for ${inv.invoiceNo}`);
                    }}
                  >
                    <Printer size={12} /> Print All
                  </button>
                </div>
              </div>

              {/* Sub-tests under this invoice */}
              <table className="custom-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>INVESTIGATION NAME</th>
                    <th>DEPARTMENT</th>
                    <th>TECHNOLOGIST</th>
                    <th>PATHOLOGIST</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'center', width: '140px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.testName}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {item.category || 'Clinical Pathology'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#334155' }}>
                          {report?.technologistName || 'Farzana Parvin'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#334155' }}>
                          {report?.pathologistName || 'Prof. Dr. M. A. Rahman'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isVerified ? 'badge-paid' : 'badge-partial'
                          }`}
                        >
                          {isVerified ? 'Approved' : 'In-House'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                            onClick={() => handleSelectInvoice(inv.id)}
                          >
                            Findings
                          </button>
                          <button
                            className="icon-btn"
                            style={{ color: '#16a34a' }}
                            title="Send WhatsApp Alert"
                            onClick={() =>
                              handleWhatsApp(inv.invoiceNo, inv.patientName, inv.patientPhone)
                            }
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
