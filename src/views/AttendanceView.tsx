import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord } from '../types';
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  CheckCheck,
  UserCheck,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    staffMembers,
    attendanceRecords,
    markAttendance,
    markBulkAttendance,
    showToast
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState<string>('2026-09');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'daily'>('matrix');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Bulk form draft state
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStatusMap, setBulkStatusMap] = useState<Record<string, AttendanceRecord['status']>>({});
  const [bulkCheckInMap, setBulkCheckInMap] = useState<Record<string, string>>({});
  const [bulkNotesMap, setBulkNotesMap] = useState<Record<string, string>>({});

  // Parse month
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr) || 2026;
  const month = parseInt(monthStr) || 9; // 1-indexed

  // Days in selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    let newM = month - 1;
    let newY = year;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setCurrentMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setCurrentMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const openBulkModal = () => {
    const initialStatus: Record<string, AttendanceRecord['status']> = {};
    const initialCheckIn: Record<string, string> = {};
    const initialNotes: Record<string, string> = {};

    staffMembers.forEach(staff => {
      const existing = attendanceRecords.find(a => a.staffId === staff.id && a.date === bulkDate);
      initialStatus[staff.id] = existing?.status || 'PRESENT';
      initialCheckIn[staff.id] = existing?.checkIn || '09:00 AM';
      initialNotes[staff.id] = existing?.note || '';
    });

    setBulkStatusMap(initialStatus);
    setBulkCheckInMap(initialCheckIn);
    setBulkNotesMap(initialNotes);
    setShowBulkModal(true);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceRecord['status']> = {};
    staffMembers.forEach(s => {
      updated[s.id] = 'PRESENT';
    });
    setBulkStatusMap(updated);
    showToast('All staff marked Present in draft.');
  };

  const handleSaveBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const recordsToSave = staffMembers.map(staff => ({
      staffId: staff.id,
      staffName: staff.name,
      date: bulkDate,
      status: bulkStatusMap[staff.id] || 'PRESENT',
      checkIn: bulkCheckInMap[staff.id] || '09:00 AM',
      note: bulkNotesMap[staff.id] || '',
      markedBy: 'Administrator'
    }));

    markBulkAttendance(recordsToSave);
    setShowBulkModal(false);
  };

  const exportCsv = () => {
    const headers = ['Staff Name', 'Role', 'Department', ...daysArray.map(d => `${d}`), 'Total Present', 'Late', 'Absent', 'Leave'];
    const rows = staffMembers.map(staff => {
      const staffAtt = attendanceRecords.filter(a => a.staffId === staff.id && a.date.startsWith(currentMonth));
      let p = 0, l = 0, a = 0, lv = 0;

      const dayCols = daysArray.map(d => {
        const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`;
        const rec = staffAtt.find(att => att.date === dateStr);
        if (!rec) return '-';
        if (rec.status === 'PRESENT') { p++; return 'P'; }
        if (rec.status === 'LATE') { l++; return 'Lt'; }
        if (rec.status === 'ABSENT') { a++; return 'A'; }
        if (rec.status === 'LEAVE') { lv++; return 'L'; }
        return 'H';
      });

      return [
        `"${staff.name}"`,
        `"${staff.role}"`,
        `"${staff.department || 'General'}"`,
        ...dayCols,
        p, l, a, lv
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported to CSV!');
  };

  // Today stats
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(a => a.date === todayDateStr);
  const presentToday = todayRecords.filter(a => a.status === 'PRESENT').length;
  const lateToday = todayRecords.filter(a => a.status === 'LATE').length;
  const absentToday = todayRecords.filter(a => a.status === 'ABSENT').length;
  const leaveToday = todayRecords.filter(a => a.status === 'LEAVE').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Staff Attendance & Biometrics
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Daily check-in tracking, monthly working days matrix, and automated payroll sync
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={exportCsv}
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
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openBulkModal}
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
            <UserCheck size={16} />
            <span>Mark Daily Attendance</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Staff</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{staffMembers.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Registered employees</div>
        </div>

        <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Present Today</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{presentToday}</div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>On-time attendance</div>
        </div>

        <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '16px 20px', border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Late Today</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>{lateToday}</div>
          <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>Checked in after 09:15 AM</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Absent / Leave</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: absentToday + leaveToday > 0 ? '#ef4444' : '#64748b', marginTop: '6px' }}>
            {absentToday + leaveToday}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Absent ({absentToday}), On Leave ({leaveToday})</div>
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

          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', minWidth: '160px', textAlign: 'center' }}>
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
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'matrix' ? '#fff' : 'transparent',
              color: activeTab === 'matrix' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'matrix' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Monthly Matrix View
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'daily' ? '#fff' : 'transparent',
              color: activeTab === 'daily' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Daily Log Details
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> P=Present
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Lt=Late
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> A=Absent
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> L=Leave
          </span>
        </div>
      </div>

      {/* TAB 1: MONTHLY MATRIX TABLE */}
      {activeTab === 'matrix' && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', minWidth: '180px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 10 }}>
                    Staff Member
                  </th>
                  {daysArray.map(d => (
                    <th key={d} style={{ padding: '8px 4px', minWidth: '28px', color: '#475569' }}>
                      {d}
                    </th>
                  ))}
                  <th style={{ padding: '12px 10px', background: '#ecfdf5', color: '#059669', minWidth: '50px' }}>P</th>
                  <th style={{ padding: '12px 10px', background: '#fffbeb', color: '#d97706', minWidth: '50px' }}>Lt</th>
                  <th style={{ padding: '12px 10px', background: '#fef2f2', color: '#dc2626', minWidth: '50px' }}>A</th>
                  <th style={{ padding: '12px 10px', background: '#eff6ff', color: '#2563eb', minWidth: '50px' }}>L</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map(staff => {
                  const staffAtt = attendanceRecords.filter(a => a.staffId === staff.id && a.date.startsWith(currentMonth));
                  let pCount = 0;
                  let ltCount = 0;
                  let aCount = 0;
                  let lCount = 0;

                  return (
                    <tr
                      key={staff.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Sticky Staff Name Column */}
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        position: 'sticky',
                        left: 0,
                        background: '#fff',
                        zIndex: 5,
                        fontWeight: 700,
                        color: '#0f172a',
                        borderRight: '1px solid #e2e8f0'
                      }}>
                        <div>{staff.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{staff.role}</div>
                      </td>

                      {/* Day Columns */}
                      {daysArray.map(dayNum => {
                        const dateString = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
                        const record = staffAtt.find(r => r.date === dateString);

                        if (!record) {
                          return (
                            <td key={dayNum} style={{ padding: '6px 2px', color: '#cbd5e1' }}>
                              ·
                            </td>
                          );
                        }

                        if (record.status === 'PRESENT') {
                          pCount++;
                          return (
                            <td key={dayNum} style={{ padding: '4px 2px' }}>
                              <span style={{ display: 'inline-block', width: '22px', height: '22px', lineHeight: '22px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '11px' }}>
                                P
                              </span>
                            </td>
                          );
                        }

                        if (record.status === 'LATE') {
                          ltCount++;
                          return (
                            <td key={dayNum} style={{ padding: '4px 2px' }}>
                              <span style={{ display: 'inline-block', width: '22px', height: '22px', lineHeight: '22px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontWeight: 700, fontSize: '10px' }} title={record.checkIn ? `Checked in: ${record.checkIn}` : 'Late'}>
                                Lt
                              </span>
                            </td>
                          );
                        }

                        if (record.status === 'ABSENT') {
                          aCount++;
                          return (
                            <td key={dayNum} style={{ padding: '4px 2px' }}>
                              <span style={{ display: 'inline-block', width: '22px', height: '22px', lineHeight: '22px', borderRadius: '4px', background: '#fee2e2', color: '#ef4444', fontWeight: 700, fontSize: '11px' }}>
                                A
                              </span>
                            </td>
                          );
                        }

                        if (record.status === 'LEAVE') {
                          lCount++;
                          return (
                            <td key={dayNum} style={{ padding: '4px 2px' }}>
                              <span style={{ display: 'inline-block', width: '22px', height: '22px', lineHeight: '22px', borderRadius: '4px', background: '#dbeafe', color: '#2563eb', fontWeight: 700, fontSize: '11px' }}>
                                L
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={dayNum} style={{ padding: '4px 2px' }}>
                            <span style={{ display: 'inline-block', width: '22px', height: '22px', lineHeight: '22px', borderRadius: '4px', background: '#f3e8ff', color: '#9333ea', fontWeight: 700, fontSize: '11px' }}>
                              H
                            </span>
                          </td>
                        );
                      })}

                      {/* Summary Badges */}
                      <td style={{ padding: '8px', background: '#f0fdf4', fontWeight: 800, color: '#059669' }}>{pCount}</td>
                      <td style={{ padding: '8px', background: '#fffbeb', fontWeight: 800, color: '#d97706' }}>{ltCount}</td>
                      <td style={{ padding: '8px', background: '#fef2f2', fontWeight: 800, color: '#dc2626' }}>{aCount}</td>
                      <td style={{ padding: '8px', background: '#eff6ff', fontWeight: 800, color: '#2563eb' }}>{lCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY LOG DETAILS */}
      {activeTab === 'daily' && (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: '#059669' }} />
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Records for {selectedDate}: <strong>{attendanceRecords.filter(a => a.date === selectedDate).length} staff marked</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Staff Name</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Check In</th>
                  <th style={{ padding: '12px 16px' }}>Note / Reason</th>
                  <th style={{ padding: '12px 16px' }}>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map(staff => {
                  const record = attendanceRecords.find(a => a.staffId === staff.id && a.date === selectedDate);
                  const statusVal = record?.status || 'NOT_MARKED';

                  return (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{staff.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{staff.role}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background:
                            statusVal === 'PRESENT' ? '#ecfdf5' :
                            statusVal === 'LATE' ? '#fef3c7' :
                            statusVal === 'ABSENT' ? '#fee2e2' :
                            statusVal === 'LEAVE' ? '#dbeafe' : '#f1f5f9',
                          color:
                            statusVal === 'PRESENT' ? '#059669' :
                            statusVal === 'LATE' ? '#d97706' :
                            statusVal === 'ABSENT' ? '#ef4444' :
                            statusVal === 'LEAVE' ? '#2563eb' : '#94a3b8'
                        }}>
                          {statusVal}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                        {record?.checkIn || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {record?.note || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '12px' }}>
                        {record?.markedBy || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BULK ATTENDANCE MARKING MODAL */}
      {showBulkModal && (
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
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Mark Daily Staff Attendance</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Batch update attendance status for all team members</div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBulk} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Attendance Date:</label>
                  <input
                    type="date"
                    required
                    value={bulkDate}
                    onChange={e => setBulkDate(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <CheckCheck size={14} />
                  <span>Mark All Present</span>
                </button>
              </div>

              <div style={{ maxHeight: '55vh', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      <th style={{ padding: '10px 14px' }}>Staff Name</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                      <th style={{ padding: '10px 14px' }}>Check In</th>
                      <th style={{ padding: '10px 14px' }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map(staff => (
                      <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{staff.role}</div>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <select
                            value={bulkStatusMap[staff.id] || 'PRESENT'}
                            onChange={e => setBulkStatusMap(prev => ({ ...prev, [staff.id]: e.target.value as any }))}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              fontWeight: 700,
                              outline: 'none',
                              background: '#fff'
                            }}
                          >
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LEAVE">On Leave</option>
                            <option value="HOLIDAY">Holiday</option>
                          </select>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <input
                            type="text"
                            placeholder="09:00 AM"
                            value={bulkCheckInMap[staff.id] || ''}
                            onChange={e => setBulkCheckInMap(prev => ({ ...prev, [staff.id]: e.target.value }))}
                            style={{
                              width: '90px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <input
                            type="text"
                            placeholder="Optional note"
                            value={bulkNotesMap[staff.id] || ''}
                            onChange={e => setBulkNotesMap(prev => ({ ...prev, [staff.id]: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Save All Attendance Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
