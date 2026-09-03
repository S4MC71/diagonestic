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
  X
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { invoices, setCurrentView, openPrintModal, collectDuePayment } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID'>('ALL');

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
    return matchesSearch && matchesStatus;
  });

  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice || collectAmount <= 0) return;
    collectDuePayment(activePaymentInvoice.id, collectAmount, collectMethod);
    setActivePaymentInvoice(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Diagnostic Billing, Invoices & Receipt Archive</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => setCurrentView('new-invoice')}
          >
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by invoice #, patient name, phone, code…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Status:</span>
            {(['ALL', 'PAID', 'PARTIAL', 'UNPAID'] as const).map(st => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Tests Included</th>
              <th>Referred By</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ textAlign: 'right' }}>Paid</th>
              <th style={{ textAlign: 'right' }}>Due</th>
              <th>Status</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <strong style={{ color: '#073f8f' }}>{inv.invoiceNo}</strong>
                </td>
                <td>
                  <div>{inv.date}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inv.time}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{inv.patientName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {inv.patientCode} · {inv.patientPhone}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    {inv.items.map(i => i.testName).join(', ').slice(0, 45)}
                    {inv.items.map(i => i.testName).join(', ').length > 45 ? '…' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0d7671', fontWeight: 600 }}>
                    {inv.items.length} Test{inv.items.length > 1 ? 's' : ''}
                  </div>
                </td>
                <td>{inv.referralDoctorName || 'Self / Walk-in'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{inv.netTotal.toFixed(2)}</td>
                <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                  ৳{inv.paidAmount.toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', color: inv.dueAmount > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                  ৳{inv.dueAmount.toFixed(2)}
                </td>
                <td>
                  <span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-due'}`}>
                    {inv.paymentStatus}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {/* Thermal Print */}
                    <button
                      className="icon-btn"
                      title="Print 80mm Thermal Receipt"
                      onClick={() => openPrintModal(inv, 'thermal')}
                    >
                      <Printer size={15} />
                    </button>

                    {/* A4 Print */}
                    <button
                      className="icon-btn"
                      title="Print Standard A4 Bill"
                      onClick={() => openPrintModal(inv, 'a4')}
                    >
                      <FileText size={15} />
                    </button>

                    {/* Collect Due Payment */}
                    {inv.dueAmount > 0 && (
                      <button
                        className="btn btn-sm btn-teal"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        title="Collect Due Payment"
                        onClick={() => {
                          setActivePaymentInvoice(inv);
                          setCollectAmount(inv.dueAmount);
                        }}
                      >
                        Pay Due
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
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Collect Due Payment</h3>
              <button className="icon-btn" onClick={() => setActivePaymentInvoice(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCollectDue}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
                  <div>Invoice: <strong>{activePaymentInvoice.invoiceNo}</strong></div>
                  <div>Patient: <strong>{activePaymentInvoice.patientName}</strong></div>
                  <div style={{ marginTop: '4px', color: '#dc2626', fontWeight: 'bold' }}>
                    Current Due: ৳{activePaymentInvoice.dueAmount.toFixed(2)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Received Now (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    max={activePaymentInvoice.dueAmount}
                    className="form-control"
                    value={collectAmount}
                    onChange={e => setCollectAmount(Number(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-control"
                    value={collectMethod}
                    onChange={e => setCollectMethod(e.target.value as any)}
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="Mobile Banking">Mobile Banking (bKash/Nagad)</option>
                    <option value="Card">Credit/Debit Card</option>
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
                  Record Payment & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
