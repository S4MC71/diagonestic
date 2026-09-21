import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Search,
  Printer,
  DollarSign,
  ArrowDownLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Calendar,
  CreditCard
} from 'lucide-react';

interface PaymentEntry {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  method: string;
  receivedBy: string;
}

interface PaymentRecord {
  id: string;
  invoiceNo: string;
  patientName: string;
  patientCode: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Due';
  date: string;
  entries: PaymentEntry[];
}

export const PaymentsView: React.FC = () => {
  const { invoices, collectDuePayment, openPrintModal, showToast, setCurrentView } = useApp();

  // Status Tabs (Exact SihatSuite layout: All, Due, Paid)
  const [activeTab, setActiveTab] = useState<'All' | 'Due' | 'Paid'>('All');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Expandable row state for payment audit trail
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>('inv-2');

  // Collect Payment Modal State
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState('Cash');
  const [collectRef, setCollectRef] = useState('');

  // Payment Records list (synced with invoices)
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([
    {
      id: 'inv-1',
      invoiceNo: 'INV-2026-0001',
      patientName: 'Md. Rafiqul Islam',
      patientCode: 'P0000001',
      totalAmount: 900,
      paidAmount: 900,
      dueAmount: 0,
      status: 'Paid',
      date: '2026-09-15',
      entries: [
        {
          id: 'pe-1',
          receiptNo: 'MR-2026-0001',
          date: '2026-09-15 10:30 AM',
          amount: 900,
          method: 'Cash',
          receivedBy: 'lifecare_admin'
        }
      ]
    },
    {
      id: 'inv-2',
      invoiceNo: 'INV-2026-0002',
      patientName: 'Begum Rokeya Akter',
      patientCode: 'P0000002',
      totalAmount: 1450,
      paidAmount: 1000,
      dueAmount: 450,
      status: 'Due',
      date: '2026-09-16',
      entries: [
        {
          id: 'pe-2',
          receiptNo: 'MR-2026-0002',
          date: '2026-09-16 02:15 PM',
          amount: 700,
          method: 'Cash',
          receivedBy: 'lifecare_admin'
        },
        {
          id: 'pe-3',
          receiptNo: 'MR-2026-0003',
          date: '2026-09-16 05:40 PM',
          amount: 300,
          method: 'bKash Merchant',
          receivedBy: 'reception_staff'
        }
      ]
    },
    {
      id: 'inv-3',
      invoiceNo: 'INV-2026-0003',
      patientName: 'Haji Nurul Haque',
      patientCode: 'P0000003',
      totalAmount: 1800,
      paidAmount: 1800,
      dueAmount: 0,
      status: 'Paid',
      date: '2026-09-17',
      entries: [
        {
          id: 'pe-4',
          receiptNo: 'MR-2026-0004',
          date: '2026-09-17 09:10 AM',
          amount: 1800,
          method: 'Visa / Mastercard',
          receivedBy: 'cashier_1'
        }
      ]
    }
  ]);

  const toggleExpandRow = (id: string) => {
    setExpandedInvoiceId(prev => (prev === id ? null : id));
  };

  const handleOpenCollect = () => {
    // Select first due invoice
    const firstDue = paymentRecords.find(p => p.dueAmount > 0);
    if (firstDue) {
      setSelectedInvoiceId(firstDue.id);
      setCollectAmount(firstDue.dueAmount.toString());
    } else {
      setSelectedInvoiceId(paymentRecords[0]?.id || '');
      setCollectAmount('500');
    }
    setCollectMethod('Cash');
    setCollectRef('');
    setShowCollectModal(true);
  };

  const handleSaveCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(collectAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const target = paymentRecords.find(p => p.id === selectedInvoiceId);
    if (!target) return;

    const newPaid = target.paidAmount + amountNum;
    const newDue = Math.max(0, target.totalAmount - newPaid);
    const newStatus: 'Paid' | 'Due' = newDue === 0 ? 'Paid' : 'Due';

    const newEntry: PaymentEntry = {
      id: `pe-${Date.now()}`,
      receiptNo: `MR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString('en-GB'),
      amount: amountNum,
      method: collectMethod,
      receivedBy: 'lifecare_admin'
    };

    setPaymentRecords(prev =>
      prev.map(p =>
        p.id === selectedInvoiceId
          ? {
              ...p,
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newStatus,
              entries: [...p.entries, newEntry]
            }
          : p
      )
    );

    // Call context due payment collector if invoice exists
    collectDuePayment(selectedInvoiceId, amountNum, collectMethod);

    setShowCollectModal(false);
    showToast(`Payment of ৳${amountNum} received for ${target.invoiceNo}`);
  };

  // Filtered payments list
  const filtered = paymentRecords.filter(p => {
    const matchesTab =
      activeTab === 'All' ? true :
      activeTab === 'Due' ? p.status === 'Due' :
      p.status === 'Paid';

    const matchesSearch =
      p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod =
      selectedMethod === 'ALL'
        ? true
        : p.entries.some(e => e.method.toLowerCase().includes(selectedMethod.toLowerCase()));

    return matchesTab && matchesSearch && matchesMethod;
  });

  const selectedTargetInvoice = paymentRecords.find(p => p.id === selectedInvoiceId);

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Payments
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Patient collection records, receipt audit trails, and due recovery settlements.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCollect}>
          <Plus size={16} /> Collect Payment
        </button>
      </div>

      {/* ====================================================================
          STATUS TABS: All, Due, Paid (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="subtabs-bar" style={{ marginBottom: '16px' }}>
        <button
          className={`subtab-btn ${activeTab === 'All' ? 'active' : ''}`}
          onClick={() => setActiveTab('All')}
        >
          All ({paymentRecords.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'Due' ? 'active' : ''}`}
          onClick={() => setActiveTab('Due')}
        >
          Due ({paymentRecords.filter(p => p.status === 'Due').length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'Paid' ? 'active' : ''}`}
          onClick={() => setActiveTab('Paid')}
        >
          Paid ({paymentRecords.filter(p => p.status === 'Paid').length})
        </button>
      </div>

      {/* ====================================================================
          FILTERS TOOLBAR: Search, Method, Dates, Reset
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
          {/* Invoice Search Input */}
          <div className="table-search-input" style={{ width: '100%' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search invoice no (e.g. INV-...) or patient name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <select
              className="form-control"
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="ALL">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Card">Card</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* To Date */}
          <div>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedMethod !== 'ALL' || fromDate || toDate) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedMethod('ALL');
                setFromDate('');
                setToDate('');
              }}
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          PAYMENTS TABLE (MATCHING SIHATSUITE COLUMNS & EXPANDABLE AUDIT ROWS)
          ==================================================================== */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Invoice #</th>
              <th>Patient</th>
              <th style={{ textAlign: 'right' }}>Total Bill (৳)</th>
              <th style={{ textAlign: 'right' }}>Amount Paid (৳)</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Entries</th>
              <th>Invoice Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const isExpanded = expandedInvoiceId === p.id;

              return (
                <React.Fragment key={p.id}>
                  <tr>
                    <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleExpandRow(p.id)}>
                      {isExpanded ? (
                        <ChevronDown size={16} color="#059669" />
                      ) : (
                        <ChevronRight size={16} color="#94a3b8" />
                      )}
                    </td>
                    <td>
                      <strong
                        onClick={() => toggleExpandRow(p.id)}
                        style={{ color: '#059669', fontSize: '14px', cursor: 'pointer' }}
                      >
                        {p.invoiceNo}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.patientName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{p.patientCode}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{p.totalAmount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      ৳{p.paidAmount.toFixed(2)}
                      {p.dueAmount > 0 && (
                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                          Due: ৳{p.dueAmount}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${p.status === 'Paid' ? 'badge-paid' : 'badge-due'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                        {p.entries.length} {p.entries.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>{p.date}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button
                          className="icon-btn"
                          title="View Invoice Details"
                          onClick={() => {
                            setCurrentView('invoices');
                            showToast(`Navigated to invoice ${p.invoiceNo}`);
                          }}
                        >
                          <FileText size={15} color="#0284c7" />
                        </button>
                        <button
                          className="icon-btn"
                          title="Print Money Receipt / Invoice"
                          onClick={() => {
                            const mockInv: any = {
                              id: p.id,
                              invoiceNo: p.invoiceNo,
                              patientId: p.patientCode,
                              patientName: p.patientName,
                              patientAge: 45,
                              patientGender: 'Male',
                              patientPhone: '01712-345678',
                              doctorName: 'Prof. Dr. M. A. Rahman',
                              items: [{ id: '1', name: 'Diagnostic Clinical Package', price: p.totalAmount }],
                              subtotal: p.totalAmount,
                              discount: 0,
                              tax: 0,
                              total: p.totalAmount,
                              paid: p.paidAmount,
                              due: p.dueAmount,
                              paymentMethod: p.entries[0]?.method || 'Cash',
                              paymentStatus: p.status,
                              createdAt: p.date,
                              deliveryDate: p.date,
                              status: 'Ready'
                            };
                            openPrintModal(mockInv, 'thermal');
                          }}
                        >
                          <Printer size={15} color="#059669" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDABLE AUDIT LOG OF INDIVIDUAL MONEY RECEIPTS (MATCHING SIHATSUITE) */}
                  {isExpanded && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={9} style={{ padding: '12px 24px 16px 48px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                          Money Receipts & Audit Trail for {p.invoiceNo}:
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                              <th style={{ padding: '8px 12px' }}>Money Receipt #</th>
                              <th style={{ padding: '8px 12px' }}>Timestamp</th>
                              <th style={{ padding: '8px 12px' }}>Payment Channel</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Collected Amount</th>
                              <th style={{ padding: '8px 12px' }}>Cashier / Received By</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Slip</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.entries.map((entry, idx) => (
                              <tr key={entry.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#059669' }}>
                                  {entry.receiptNo}
                                </td>
                                <td style={{ padding: '8px 12px', color: '#64748b' }}>{entry.date}</td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span className="badge badge-inhouse" style={{ fontSize: '10px' }}>
                                    {entry.method}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                  ৳{entry.amount.toFixed(2)}
                                </td>
                                <td style={{ padding: '8px 12px', color: '#334155' }}>{entry.receivedBy}</td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => {
                                      window.print();
                                      showToast(`Printing receipt slip ${entry.receiptNo}`);
                                    }}
                                    style={{ fontSize: '10px', padding: '2px 8px' }}
                                  >
                                    Print Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ====================================================================
          + COLLECT PAYMENT MODAL (MATCHING SIHATSUITE)
          ==================================================================== */}
      {showCollectModal && (
        <div className="modal-backdrop" onClick={() => setShowCollectModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Collect Payment</h3>
              <button className="icon-btn" onClick={() => setShowCollectModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCollectPayment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Invoice *</label>
                  <select
                    className="form-control"
                    value={selectedInvoiceId}
                    onChange={e => {
                      setSelectedInvoiceId(e.target.value);
                      const inv = paymentRecords.find(p => p.id === e.target.value);
                      if (inv && inv.dueAmount > 0) {
                        setCollectAmount(inv.dueAmount.toString());
                      }
                    }}
                  >
                    {paymentRecords.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNo} — {inv.patientName} (Total: ৳{inv.totalAmount}, Due: ৳{inv.dueAmount})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTargetInvoice && (
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Total Billed:</span>
                      <strong style={{ display: 'block', fontSize: '13px' }}>৳{selectedTargetInvoice.totalAmount}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Current Paid:</span>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#059669' }}>৳{selectedTargetInvoice.paidAmount}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Outstanding Due:</span>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#dc2626' }}>৳{selectedTargetInvoice.dueAmount}</strong>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Amount (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Collection amount"
                    className="form-control"
                    value={collectAmount}
                    onChange={e => setCollectAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select
                    className="form-control"
                    value={collectMethod}
                    onChange={e => setCollectMethod(e.target.value)}
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="bKash Merchant">bKash Merchant (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Visa / Mastercard">Visa / Mastercard POS</option>
                    <option value="Bank Transfer">Bank Transfer (ব্যাংক ডিপোজিট)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">TrxID / Reference Note</label>
                  <input
                    type="text"
                    placeholder="e.g. TrxID / Check No (Optional)"
                    className="form-control"
                    value={collectRef}
                    onChange={e => setCollectRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCollectModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
