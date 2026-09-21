import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import {
  Search,
  Plus,
  Printer,
  DollarSign,
  FileText,
  Filter,
  CheckCircle,
  X,
  MessageCircle,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Download
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    setCurrentView,
    openPrintModal,
    collectDuePayment,
    tenantSettings,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Collect Payment Modal state
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<'Cash' | 'Mobile Banking' | 'Card'>('Cash');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientPhone.includes(searchTerm) ||
      (inv.patientCode || inv.patientId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    const matchFrom = !fromDate || inv.date >= fromDate;
    const matchTo = !toDate || inv.date <= toDate;

    return matchesSearch && matchesStatus && matchFrom && matchTo;
  });

  // Calculate totals
  const totalBilled = filteredInvoices.reduce((s, i) => s + i.netTotal, 0);
  const totalCollected = filteredInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalDue = filteredInvoices.reduce((s, i) => s + i.dueAmount, 0);

  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice || collectAmount <= 0) return;
    collectDuePayment(activePaymentInvoice.id, collectAmount, collectMethod);
    showToast(`Received ৳${collectAmount} for invoice ${activePaymentInvoice.invoiceNo}`);
    setActivePaymentInvoice(null);
  };

  const handleWhatsApp = (inv: Invoice) => {
    const centerTitle = tenantSettings?.name || 'CarePulse Diagnostic Center';
    const slug = tenantSettings?.slug || 'carepulse';
    const text = encodeURIComponent(
      `${centerTitle}\nDear ${inv.patientName},\nYour invoice #${inv.invoiceNo} has been generated.\nTests: ${inv.items.map(i => i.testName).join(', ')}\nTotal: ৳${inv.netTotal} | Paid: ৳${inv.paidAmount} | Due: ৳${inv.dueAmount}\nView invoice: https://${slug}.carepulse.health/invoices/${inv.invoiceNo}`
    );
    window.open(`https://wa.me/88${inv.patientPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    showToast(`WhatsApp billing link opened for ${inv.patientName}`);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">
            Diagnostic Billing Ledger, Thermal Receipts, Due Collections & WhatsApp Alerts
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setCurrentView('new-invoice')}
          >
            <Plus size={16} /> + New Invoice
          </button>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: '20px' }}>
        <div className="kpi-card kpi-cyan">
          <div>
            <div className="kpi-label">TOTAL BILLED</div>
            <div className="kpi-value">৳{totalBilled.toLocaleString()}</div>
            <div className="kpi-sub">{filteredInvoices.length} invoices generated</div>
          </div>
          <div className="kpi-icon-wrap">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="kpi-card kpi-green">
          <div>
            <div className="kpi-label">TOTAL COLLECTED</div>
            <div className="kpi-value">৳{totalCollected.toLocaleString()}</div>
            <div className="kpi-sub">Cash counter & digital collections</div>
          </div>
          <div className="kpi-icon-wrap">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="kpi-card kpi-amber">
          <div>
            <div className="kpi-label">OUTSTANDING DUE</div>
            <div className="kpi-value" style={{ color: totalDue > 0 ? '#dc2626' : 'inherit' }}>
              ৳{totalDue.toLocaleString()}
            </div>
            <div className="kpi-sub">Patient receivable balances</div>
          </div>
          <div className="kpi-icon-wrap">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="table-container">
        <div
          className="table-toolbar"
          style={{ flexWrap: 'wrap', gap: '12px' }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="table-search-input" style={{ width: '280px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search by invoice #, patient, phone ( / )..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Status:</span>
            {(['ALL', 'PAID', 'PARTIAL', 'UNPAID'] as const).map(st => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => showToast('Exporting invoices archive as XLS')}
              title="Export XLS"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>INVOICE #</th>
              <th>DATE & TIME</th>
              <th>PATIENT</th>
              <th>TESTS INCLUDED</th>
              <th>REFERRED BY</th>
              <th style={{ textAlign: 'right' }}>TOTAL</th>
              <th style={{ textAlign: 'right' }}>PAID</th>
              <th style={{ textAlign: 'right' }}>DUE</th>
              <th style={{ textAlign: 'center' }}>STATUS</th>
              <th style={{ textAlign: 'center', width: '150px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                    {inv.invoiceNo}
                  </strong>
                </td>
                <td>
                  <div style={{ fontSize: '12px' }}>{inv.date}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inv.time}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{inv.patientName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {inv.patientAge}Y · {inv.patientPhone}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    {inv.items.map(i => i.testName).join(', ').slice(0, 45)}
                    {inv.items.map(i => i.testName).join(', ').length > 45 ? '…' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    {inv.items.length} Test{inv.items.length > 1 ? 's' : ''}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    {inv.referralDoctorName || inv.referredByName || 'Self / Walk-in'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{inv.netTotal.toFixed(2)}</td>
                <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                  ৳{inv.paidAmount.toFixed(2)}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    color: inv.dueAmount > 0 ? '#dc2626' : '#64748b',
                    fontWeight: 700
                  }}
                >
                  ৳{inv.dueAmount.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className={`badge ${
                      inv.paymentStatus === 'PAID'
                        ? 'badge-paid'
                        : inv.paymentStatus === 'PARTIAL'
                        ? 'badge-partial'
                        : 'badge-due'
                    }`}
                  >
                    {inv.paymentStatus}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {/* Thermal Print */}
                    <button
                      className="icon-btn"
                      title="Print 80mm POS Slip"
                      onClick={() => openPrintModal(inv, 'thermal')}
                    >
                      <Printer size={14} />
                    </button>

                    {/* A4 Print */}
                    <button
                      className="icon-btn"
                      title="Print Standard A4 Bill"
                      onClick={() => openPrintModal(inv, 'a4')}
                    >
                      <FileText size={14} />
                    </button>

                    {/* WhatsApp Alert */}
                    <button
                      className="icon-btn"
                      style={{ color: '#16a34a' }}
                      title="Send WhatsApp Invoice"
                      onClick={() => handleWhatsApp(inv)}
                    >
                      <MessageCircle size={14} />
                    </button>

                    {/* Collect Due Payment */}
                    {inv.dueAmount > 0 && (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ padding: '2px 6px', fontSize: '10px' }}
                        title="Collect Due Payment"
                        onClick={() => {
                          setActivePaymentInvoice(inv);
                          setCollectAmount(inv.dueAmount);
                        }}
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Due Payment Modal */}
      {activePaymentInvoice && (
        <div className="modal-backdrop" onClick={() => setActivePaymentInvoice(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Collect Due Payment</h3>
              <button className="icon-btn" onClick={() => setActivePaymentInvoice(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCollectDue}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Invoice: <strong>{activePaymentInvoice.invoiceNo}</strong></div>
                  <div>Patient: <strong>{activePaymentInvoice.patientName}</strong></div>
                  <div style={{ marginTop: '4px', color: '#dc2626', fontWeight: 700 }}>
                    Outstanding Due: ৳{activePaymentInvoice.dueAmount.toFixed(2)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Collection Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    max={activePaymentInvoice.dueAmount}
                    className="form-control"
                    style={{ fontWeight: 700, fontSize: '15px', color: '#059669' }}
                    value={collectAmount}
                    onChange={e => setCollectAmount(Number(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Channel</label>
                  <select
                    className="form-control"
                    value={collectMethod}
                    onChange={e => setCollectMethod(e.target.value as any)}
                  >
                    <option>Cash</option>
                    <option>Mobile Banking</option>
                    <option>Card</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActivePaymentInvoice(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
