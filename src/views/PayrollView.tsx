import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PayrollRecord, SalaryAdvance } from '../types';
import {
  Calculator,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Printer,
  Download,
  Plus,
  CreditCard,
  Building,
  Calendar,
  X,
  Edit2,
  AlertCircle
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const {
    staffMembers,
    payrollRecords,
    salaryAdvances,
    generatePayroll,
    markPayrollPaid,
    updatePayrollRecord,
    giveSalaryAdvance,
    tenantSettings,
    showToast
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [activeTab, setActiveTab] = useState<'payroll' | 'advances'>('payroll');

  // Modals
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [payMethodModalRecord, setPayMethodModalRecord] = useState<PayrollRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash (Main Counter)');

  // Advance form states
  const [advanceStaffId, setAdvanceStaffId] = useState(staffMembers[0]?.id || '');
  const [advanceAmount, setAdvanceAmount] = useState<number>(3000);
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceDeductMonth, setAdvanceDeductMonth] = useState('2026-10');
  const [advanceNote, setAdvanceNote] = useState('');

  // Edit Payroll record states
  const [editBasic, setEditBasic] = useState<number>(0);
  const [editBonus, setEditBonus] = useState<number>(0);
  const [editOvertime, setEditOvertime] = useState<number>(0);
  const [editDeduction, setEditDeduction] = useState<number>(0);

  // Month navigation
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr) || 2026;
  const month = parseInt(monthStr) || 9;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    let newM = month - 1;
    let newY = year;
    if (newM < 1) { newM = 12; newY -= 1; }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) { newM = 1; newY += 1; }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const currentMonthRecords = payrollRecords.filter(p => p.month === selectedMonth);

  const totalGross = currentMonthRecords.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalDeductions = currentMonthRecords.reduce((sum, p) => sum + p.deductions, 0);
  const totalNet = currentMonthRecords.reduce((sum, p) => sum + p.netSalary, 0);
  const paidCount = currentMonthRecords.filter(p => p.status === 'PAID').length;

  const handleAutoGenerate = () => {
    generatePayroll(selectedMonth);
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceAmount || advanceAmount <= 0) {
      showToast('Please enter a valid advance amount');
      return;
    }
    const staff = staffMembers.find(s => s.id === advanceStaffId);
    giveSalaryAdvance({
      staffId: advanceStaffId,
      staffName: staff?.name || 'Staff',
      amount: Number(advanceAmount),
      givenDate: advanceDate,
      deductMonth: advanceDeductMonth,
      note: advanceNote.trim()
    });
    setShowAdvanceModal(false);
    setAdvanceNote('');
  };

  const openEditModal = (rec: PayrollRecord) => {
    setEditingRecord(rec);
    setEditBasic(rec.basicSalary);
    setEditBonus(rec.bonus);
    setEditOvertime(rec.overtimeAmount);
    setEditDeduction(rec.deductions);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const gross = editBasic + editBonus + editOvertime;
    const net = Math.max(0, gross - editDeduction);

    updatePayrollRecord(editingRecord.id, {
      basicSalary: editBasic,
      bonus: editBonus,
      overtimeAmount: editOvertime,
      grossSalary: gross,
      deductions: editDeduction,
      netSalary: net
    });
    setEditingRecord(null);
  };

  const handleConfirmPayment = () => {
    if (!payMethodModalRecord) return;
    markPayrollPaid(payMethodModalRecord.id, paymentMethod, 'Administrator');
    setPayMethodModalRecord(null);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Payroll & Staff Disbursal
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Automated monthly salary calculation, advance deductions, payslips, and payment records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAdvanceModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              background: '#fff',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>Give Salary Advance</span>
          </button>

          <button
            onClick={handleAutoGenerate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
            }}
          >
            <Calculator size={16} />
            <span>Auto-Generate Payroll</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Gross Payroll</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            ৳{totalGross.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Basic + bonus + overtime</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Advance Deductions</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
            ৳{totalDeductions.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Pre-paid advances recovered</div>
        </div>

        <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Net Disbursal Amount</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            ৳{totalNet.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>Actual payable to staff</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Payment Status</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            {paidCount} / {currentMonthRecords.length}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            {currentMonthRecords.length - paidCount} pending draft
          </div>
        </div>
      </div>

      {/* Month Navigation & Tab Controls */}
      <div style={{
        background: '#fff',
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handlePrevMonth}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', minWidth: '180px', textAlign: 'center' }}>
            {monthNames[month - 1]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('payroll')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'payroll' ? '#fff' : 'transparent',
              color: activeTab === 'payroll' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'payroll' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Monthly Payroll Sheet ({currentMonthRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'advances' ? '#fff' : 'transparent',
              color: activeTab === 'advances' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'advances' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Salary Advances ({salaryAdvances.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PAYROLL SHEET */}
      {activeTab === 'payroll' && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          {currentMonthRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <Calculator size={44} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>
                No Payroll Generated for {monthNames[month - 1]} {year}
              </h3>
              <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                Click below to auto-calculate payroll from staff attendance and basic salary.
              </p>
              <button
                onClick={handleAutoGenerate}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Generate Payroll Now
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                    <th style={{ padding: '14px 20px' }}>Staff Member</th>
                    <th style={{ padding: '14px 14px' }}>Basic Salary</th>
                    <th style={{ padding: '14px 14px' }}>Days (P/30)</th>
                    <th style={{ padding: '14px 14px' }}>Bonus & OT</th>
                    <th style={{ padding: '14px 14px' }}>Deductions</th>
                    <th style={{ padding: '14px 14px' }}>Net Salary</th>
                    <th style={{ padding: '14px 14px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthRecords.map(rec => (
                    <tr
                      key={rec.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.staffName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {rec.role} · {rec.department || 'General'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 14px', fontWeight: 600, color: '#334155' }}>
                        ৳{rec.basicSalary.toLocaleString()}
                      </td>

                      <td style={{ padding: '14px 14px', color: '#475569' }}>
                        <strong>{rec.presentDays}</strong> / 30
                      </td>

                      <td style={{ padding: '14px 14px', color: '#059669', fontWeight: 600 }}>
                        +৳{(rec.bonus + rec.overtimeAmount).toLocaleString()}
                      </td>

                      <td style={{ padding: '14px 14px', color: rec.deductions > 0 ? '#dc2626' : '#94a3b8', fontWeight: 600 }}>
                        {rec.deductions > 0 ? `-৳${rec.deductions.toLocaleString()}` : '৳0'}
                      </td>

                      <td style={{ padding: '14px 14px', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                        ৳{rec.netSalary.toLocaleString()}
                      </td>

                      <td style={{ padding: '14px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: rec.status === 'PAID' ? '#ecfdf5' : '#fffbeb',
                          color: rec.status === 'PAID' ? '#059669' : '#d97706'
                        }}>
                          {rec.status === 'PAID' ? 'PAID ✓' : 'DRAFT'}
                        </span>
                        {rec.paidAt && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            {rec.paymentMethod}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {rec.status !== 'PAID' && (
                            <button
                              onClick={() => setPayMethodModalRecord(rec)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: '#059669',
                                color: '#fff',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Pay Now
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedPayslip(rec)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="View / Print Official Payslip"
                          >
                            <Printer size={13} />
                            <span>Slip</span>
                          </button>

                          <button
                            onClick={() => openEditModal(rec)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              color: '#64748b',
                              cursor: 'pointer'
                            }}
                            title="Adjust amounts manually"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SALARY ADVANCES */}
      {activeTab === 'advances' && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Staff Salary Advance Ledger
            </h3>
            <button
              onClick={() => setShowAdvanceModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>Record New Advance</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                  <th style={{ padding: '12px 20px' }}>Staff Name</th>
                  <th style={{ padding: '12px 16px' }}>Advance Amount</th>
                  <th style={{ padding: '12px 16px' }}>Disbursal Date</th>
                  <th style={{ padding: '12px 16px' }}>Deduction Target Month</th>
                  <th style={{ padding: '12px 16px' }}>Note / Purpose</th>
                  <th style={{ padding: '12px 20px' }}>Recovery Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryAdvances.map(adv => (
                  <tr key={adv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>{adv.staffName}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>৳{adv.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{adv.givenDate}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>{adv.deductMonth || 'Immediate'}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{adv.note || '—'}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: adv.isDeducted ? '#ecfdf5' : '#fffbeb',
                        color: adv.isDeducted ? '#059669' : '#d97706'
                      }}>
                        {adv.isDeducted ? 'Deducted ✓' : 'Pending Recovery'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GIVE ADVANCE MODAL */}
      {showAdvanceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Give Salary Advance</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Record an advance payment to be deducted from payroll</div>
              </div>
              <button onClick={() => setShowAdvanceModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdvanceSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Select Staff Member *</label>
                <select
                  value={advanceStaffId}
                  onChange={e => setAdvanceStaffId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role} · ৳{s.salary.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Advance Amount (৳) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    step="500"
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Disbursal Date</label>
                  <input
                    type="date"
                    value={advanceDate}
                    onChange={e => setAdvanceDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Deduct in Month</label>
                <input
                  type="month"
                  value={advanceDeductMonth}
                  onChange={e => setAdvanceDeductMonth(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Medical emergency advance"
                  value={advanceNote}
                  onChange={e => setAdvanceNote(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAdvanceModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Disburse Advance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYSLIP PRINT / PREVIEW MODAL */}
      {selectedPayslip && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Official Salary Payslip</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Period: {monthNames[month - 1]} {year}</div>
              </div>
              <button onClick={() => setSelectedPayslip(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Center Details */}
              <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>{tenantSettings.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{tenantSettings.address}, {tenantSettings.thana}, {tenantSettings.district}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Phone: {tenantSettings.phone} · Email: {tenantSettings.email}</div>
              </div>

              {/* Staff Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0', fontSize: '13px' }}>
                <div>Employee Name: <strong>{selectedPayslip.staffName}</strong></div>
                <div>Designation: <strong>{selectedPayslip.role}</strong></div>
                <div>Department: <strong>{selectedPayslip.department || 'General'}</strong></div>
                <div>Working Days: <strong>{selectedPayslip.presentDays} / 30</strong></div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', margin: '16px 0' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Earnings</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>Basic Salary</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>৳{selectedPayslip.basicSalary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>Bonus & Festival Allowance</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>৳{selectedPayslip.bonus.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px' }}>Overtime Allowance</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>৳{selectedPayslip.overtimeAmount.toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderTop: '1px dashed #cbd5e1', fontWeight: 700 }}>
                    <td style={{ padding: '8px 12px' }}>Gross Salary</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>৳{selectedPayslip.grossSalary.toLocaleString()}</td>
                  </tr>
                  <tr style={{ color: '#dc2626' }}>
                    <td style={{ padding: '8px 12px' }}>Less: Advance & Deductions</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>-৳{selectedPayslip.deductions.toLocaleString()}</td>
                  </tr>
                  <tr style={{ background: '#ecfdf5', borderTop: '2px solid #059669', fontWeight: 800, fontSize: '15px' }}>
                    <td style={{ padding: '10px 12px', color: '#059669' }}>Net Payable Amount</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#059669' }}>৳{selectedPayslip.netSalary.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', borderTop: '1px solid #94a3b8', margin: '0 auto 4px auto' }} />
                  <span>Prepared By</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', borderTop: '1px solid #94a3b8', margin: '0 auto 4px auto' }} />
                  <span>Employee Signature</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', borderTop: '1px solid #94a3b8', margin: '0 auto 4px auto' }} />
                  <span>Authorized Signature</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Printer size={16} />
                  <span>Print Payslip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MARK PAID PAYMENT METHOD MODAL */}
      {payMethodModalRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#059669', color: '#fff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Disburse Salary</h3>
              <button onClick={() => setPayMethodModalRecord(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Paying to:</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{payMethodModalRecord.staffName}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                  ৳{payMethodModalRecord.netSalary.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Select Disbursal Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  <option value="Cash (Main Counter)">Cash (Main Counter)</option>
                  <option value="Bank Transfer (City Bank)">Bank Transfer (City Bank)</option>
                  <option value="Bank Transfer (Islami Bank)">Bank Transfer (Islami Bank)</option>
                  <option value="bKash Merchant">bKash (Mobile Banking)</option>
                  <option value="Nagad">Nagad (Mobile Banking)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="button" onClick={() => setPayMethodModalRecord(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={handleConfirmPayment} style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Confirm Disbursal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
