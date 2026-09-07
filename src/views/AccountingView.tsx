import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Plus, ArrowUpRight, ArrowDownRight, Download, Printer, X } from 'lucide-react';

export const AccountingView: React.FC = () => {
  const { transactions, addExpense, showToast } = useApp();
  const [tab, setTab] = useState<'cashbook' | 'expenses' | 'income' | 'staff' | 'pnl' | 'year'>('cashbook');
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Expense modal fields
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('Electricity Utility');
  const [expAmount, setExpAmount] = useState<number>(1500);
  const [expMethod, setExpMethod] = useState<'Cash' | 'Mobile Banking' | 'Bank Transfer'>('Cash');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expStaffSalary, setExpStaffSalary] = useState('');
  const [expVoucherNo, setExpVoucherNo] = useState('');
  const [expNote, setExpNote] = useState('');

  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME');

  const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;
    addExpense({
      date: expDate,
      type: 'EXPENSE',
      category: expCategory,
      description: expNote || `${expCategory} payment`,
      amount: expAmount,
      paymentMethod: expMethod,
      account: expMethod === 'Cash' ? 'Main Cash Counter' : 'bKash Merchant',
      paidTo: expPaidTo,
      voucherNo: expVoucherNo
    });
    setShowExpenseModal(false);
    setExpPaidTo('');
    setExpVoucherNo('');
    setExpNote('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounting & Expenses</h1>
          <p className="page-subtitle">Cash Book Ledger, Operating Overhead, Staff Payroll & Profit & Loss Statement</p>
        </div>

        <div className="page-actions">
          {tab === 'expenses' && (
            <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
              <Plus size={16} /> Add Expense
            </button>
          )}
          {tab === 'pnl' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('Exporting P&L as CSV')}>
                <Download size={14} /> Export CSV
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  window.print();
                  showToast('Printing P&L Report');
                }}
              >
                <Printer size={14} /> Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="subtabs-bar">
        <button className={`subtab-btn ${tab === 'cashbook' ? 'active' : ''}`} onClick={() => setTab('cashbook')}>
          Cash Book
        </button>
        <button className={`subtab-btn ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
          Expenses ({expenseTransactions.length})
        </button>
        <button className={`subtab-btn ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}>
          Other Income
        </button>
        <button className={`subtab-btn ${tab === 'staff' ? 'active' : ''}`} onClick={() => setTab('staff')}>
          Staff
        </button>
        <button className={`subtab-btn ${tab === 'pnl' ? 'active' : ''}`} onClick={() => setTab('pnl')}>
          Profit & Loss
        </button>
        <button className={`subtab-btn ${tab === 'year' ? 'active' : ''}`} onClick={() => setTab('year')}>
          Year
        </button>
      </div>

      {/* 1. CASH BOOK TAB */}
      {tab === 'cashbook' && (
        <div>
          <div className="kpi-grid">
            <div className="kpi-card kpi-green">
              <div>
                <div className="kpi-label">TOTAL INCOME (CASH BASIS)</div>
                <div className="kpi-value">৳{totalIncome.toLocaleString()}</div>
                <div className="kpi-sub">Collections received</div>
              </div>
              <div className="kpi-icon-wrap"><ArrowUpRight size={26} /></div>
            </div>

            <div className="kpi-card kpi-amber">
              <div>
                <div className="kpi-label">TOTAL EXPENSES</div>
                <div className="kpi-value">৳{totalExpenses.toLocaleString()}</div>
                <div className="kpi-sub">Operating expenditures</div>
              </div>
              <div className="kpi-icon-wrap"><ArrowDownRight size={26} /></div>
            </div>

            <div className="kpi-card kpi-cyan">
              <div>
                <div className="kpi-label">NET BALANCE / CASH SURPLUS</div>
                <div className="kpi-value">৳{netProfit.toLocaleString()}</div>
                <div className="kpi-sub">Net liquid cash</div>
              </div>
              <div className="kpi-icon-wrap"><Calculator size={26} /></div>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction Description</th>
                  <th>Account</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Inflow / Received (৳)</th>
                  <th style={{ textAlign: 'right' }}>Outflow / Paid (৳)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>
                      <strong>{t.description}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Category: {t.category}</div>
                    </td>
                    <td>{t.account}</td>
                    <td><span className="badge badge-inhouse">{t.paymentMethod}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                      {t.type === 'INCOME' ? `+৳${t.amount.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                      {t.type === 'EXPENSE' ? `-৳${t.amount.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. EXPENSES TAB */}
      {tab === 'expenses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Expenses — {selectedMonth} <span style={{ color: '#64748b', fontWeight: 500 }}>(Total: ৳{totalExpenses.toFixed(2)})</span>
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('Exported expenses CSV')}>
                Export CSV
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('Expense categories opened')}>
                Manage Categories
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Paid To</th>
                  <th>Method</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'right' }}>Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {expenseTransactions.map(e => (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td><span className="badge badge-inhouse">{e.category}</span></td>
                    <td><strong>{e.paidTo || '—'}</strong></td>
                    <td>{e.paymentMethod}</td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{e.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                      ৳{e.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PROFIT & LOSS TAB */}
      {tab === 'pnl' && (
        <div style={{ maxWidth: '840px' }}>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            Cash basis — collections as received
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Income Card */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#16a34a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
                Income — {selectedMonth}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Diagnostic Invoices Collected:</span>
                  <strong>৳{totalIncome.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 800 }}>
                  <span>Total Income:</span>
                  <span style={{ color: '#16a34a' }}>৳{totalIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
                Expenses — {selectedMonth}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Operating & Clinic Overhead:</span>
                  <strong>৳{totalExpenses.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 800 }}>
                  <span>Total Expenses:</span>
                  <span style={{ color: '#dc2626' }}>৳{totalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* NET PROFIT CARD */}
          <div className="card" style={{ background: '#064e3b', color: '#ffffff', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
                  NET PROFIT — {selectedMonth.toUpperCase()}
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
                  Income ৳{totalIncome.toLocaleString()} − Expenses ৳{totalExpenses.toLocaleString()}
                </div>
              </div>

              <div style={{ fontSize: '28px', fontWeight: 900, color: netProfit >= 0 ? '#34d399' : '#f87171' }}>
                ৳{netProfit.toLocaleString()}.00
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. OTHER INCOME & STAFF */}
      {(tab === 'income' || tab === 'staff' || tab === 'year') && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', textTransform: 'capitalize' }}>
            {tab} Records
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            No secondary transactions recorded in {selectedMonth}.
          </p>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Expense</h3>
              <button className="icon-btn" onClick={() => setShowExpenseModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={expDate}
                      onChange={e => setExpDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={expCategory}
                      onChange={e => setExpCategory(e.target.value)}
                    >
                      <option>Electricity Utility</option>
                      <option>Doctor Commission</option>
                      <option>Reagents & Supplies</option>
                      <option>Staff Salary</option>
                      <option>Stationery & Rolls</option>
                      <option>Rent & Maintenance</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (৳) *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={expAmount}
                      onChange={e => setExpAmount(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method *</label>
                    <select
                      className="form-control"
                      value={expMethod}
                      onChange={e => setExpMethod(e.target.value as any)}
                    >
                      <option>Cash</option>
                      <option>Mobile Banking</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Paid To (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Vendor / person name"
                      value={expPaidTo}
                      onChange={e => setExpPaidTo(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Voucher No (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. VCH-089"
                      value={expVoucherNo}
                      onChange={e => setExpVoucherNo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Expense details"
                    value={expNote}
                    onChange={e => setExpNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
