import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeaveType, LeaveRequest } from '../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  UserCheck,
  X,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export const HRMView: React.FC = () => {
  const {
    staffMembers,
    leaveTypes,
    leaveRequests,
    addLeaveType,
    deleteLeaveType,
    submitLeaveRequest,
    reviewLeaveRequest,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'types'>('requests');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Leave Request Form state
  const [reqStaffId, setReqStaffId] = useState(staffMembers[0]?.id || '');
  const [reqTypeId, setReqTypeId] = useState(leaveTypes[0]?.id || '');
  const [reqFrom, setReqFrom] = useState(new Date().toISOString().split('T')[0]);
  const [reqTo, setReqTo] = useState(new Date().toISOString().split('T')[0]);
  const [reqDays, setReqDays] = useState<number>(1);
  const [reqReason, setReqReason] = useState('');

  // Leave Type Form state
  const [typeName, setTypeName] = useState('');
  const [typeDays, setTypeDays] = useState<number>(12);
  const [typeIsPaid, setTypeIsPaid] = useState<boolean>(true);

  // Compute duration
  const handleDateChange = (from: string, to: string) => {
    setReqFrom(from);
    setReqTo(to);
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setReqDays(Math.max(1, diffDays));
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffMembers.find(s => s.id === reqStaffId);
    const lType = leaveTypes.find(t => t.id === reqTypeId);

    submitLeaveRequest({
      staffId: reqStaffId,
      staffName: staff?.name || 'Staff Member',
      leaveTypeId: reqTypeId,
      leaveTypeName: lType?.name || 'Leave',
      fromDate: reqFrom,
      toDate: reqTo,
      days: reqDays,
      reason: reqReason.trim()
    });

    setShowRequestModal(false);
    setReqReason('');
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      showToast('Please enter leave policy name');
      return;
    }
    addLeaveType({
      name: typeName.trim(),
      daysPerYear: Number(typeDays) || 10,
      isPaid: typeIsPaid
    });
    setShowTypeModal(false);
    setTypeName('');
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'APPROVED').length;

  const filteredRequests = leaveRequests.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            HRM & Leave Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Configure clinic leave policies, review staff applications, and track leave balances
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowTypeModal(true)}
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
            <span>Add Leave Type</span>
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
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
            <Calendar size={16} />
            <span>Submit Leave Request</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Configured Leave Policies</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{leaveTypes.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Annual, Sick, Casual, etc.</div>
        </div>

        <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '16px 20px', border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Pending Approvals</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>{pendingCount}</div>
          <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>Awaiting manager action</div>
        </div>

        <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Approved Leaves</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{approvedCount}</div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>Approved applications</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Staff Eligible</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>{staffMembers.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Active clinic personnel</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff',
        borderRadius: '14px',
        padding: '12px 20px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'requests' ? '#fff' : 'transparent',
              color: activeTab === 'requests' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'requests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Leave Applications ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('types')}
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'types' ? '#fff' : 'transparent',
              color: activeTab === 'types' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'types' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Leave Policy Rules ({leaveTypes.length})
          </button>
        </div>

        {activeTab === 'requests' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: filterStatus === st ? '#059669' : '#cbd5e1',
                  background: filterStatus === st ? '#ecfdf5' : '#fff',
                  color: filterStatus === st ? '#059669' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: LEAVE REQUESTS */}
      {activeTab === 'requests' && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px' }}>Staff Applicant</th>
                  <th style={{ padding: '14px 16px' }}>Leave Type</th>
                  <th style={{ padding: '14px 16px' }}>Dates & Duration</th>
                  <th style={{ padding: '14px 16px' }}>Reason</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      <Calendar size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No leave applications found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr
                      key={req.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.staffName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Applied: {new Date(req.createdAt).toLocaleDateString()}</div>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                        {req.leaveTypeName}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {req.fromDate} to {req.toDate}
                        </div>
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                          {req.days} Day{req.days > 1 ? 's' : ''} Duration
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '300px' }}>
                        {req.reason || 'No detailed reason provided'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background:
                            req.status === 'APPROVED' ? '#ecfdf5' :
                            req.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                          color:
                            req.status === 'APPROVED' ? '#059669' :
                            req.status === 'REJECTED' ? '#ef4444' : '#d97706'
                        }}>
                          {req.status}
                        </span>
                        {req.reviewedBy && (
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            By {req.reviewedBy}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {req.status === 'PENDING' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => reviewLeaveRequest(req.id, 'APPROVED')}
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
                              Approve
                            </button>
                            <button
                              onClick={() => reviewLeaveRequest(req.id, 'REJECTED')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: '#fff',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                            Reviewed ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE TYPES POLICY */}
      {activeTab === 'types' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {leaveTypes.map(t => (
            <div
              key={t.id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: t.isPaid ? '#ecfdf5' : '#f1f5f9',
                    color: t.isPaid ? '#059669' : '#64748b'
                  }}>
                    {t.isPaid ? 'PAID LEAVE' : 'UNPAID'}
                  </span>

                  <button
                    onClick={() => deleteLeaveType(t.id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                    title="Delete Policy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {t.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Annual allowance entitlement for all permanent clinic staff.
                </p>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Entitlement:</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                  {t.daysPerYear} Days / Year
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT LEAVE REQUEST MODAL */}
      {showRequestModal && (
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
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Submit Staff Leave Request</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Record an official leave application for review</div>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleRequestSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Staff Member *</label>
                <select
                  value={reqStaffId}
                  onChange={e => setReqStaffId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Leave Category *</label>
                <select
                  value={reqTypeId}
                  onChange={e => setReqTypeId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.daysPerYear} days/yr)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>From Date *</label>
                  <input
                    type="date"
                    required
                    value={reqFrom}
                    onChange={e => handleDateChange(e.target.value, reqTo)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>To Date *</label>
                  <input
                    type="date"
                    required
                    value={reqTo}
                    onChange={e => handleDateChange(reqFrom, e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#059669', fontWeight: 700 }}>
                Calculated Leave Duration: {reqDays} Day{reqDays > 1 ? 's' : ''}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Reason / Explanation</label>
                <textarea
                  rows={3}
                  placeholder="State the reason for leave application..."
                  value={reqReason}
                  onChange={e => setReqReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowRequestModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LEAVE TYPE MODAL */}
      {showTypeModal && (
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
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Create Leave Type Policy</h3>
              <button onClick={() => setShowTypeModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleTypeSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Policy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study Leave (অধ্যয়ন ছুটি)"
                  value={typeName}
                  onChange={e => setTypeName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Allowed Days / Year</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={typeDays}
                  onChange={e => setTypeDays(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="isPaidCheck"
                  checked={typeIsPaid}
                  onChange={e => setTypeIsPaid(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="isPaidCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  This is a Paid Leave policy (no salary deduction)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowTypeModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Leave Type</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
