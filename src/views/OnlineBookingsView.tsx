import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PublicBookingRequest } from '../types';
import {
  Globe,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User,
  FlaskConical,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export const OnlineBookingsView: React.FC = () => {
  const {
    bookingRequests,
    confirmBookingRequest,
    cancelBookingRequest,
    addAppointment,
    doctors,
    sendSmsNotification,
    showToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirm modal state
  const [confirmModalBooking, setConfirmModalBooking] = useState<PublicBookingRequest | null>(null);
  const [sendSms, setSendSms] = useState(true);
  const [confirmedDoctorId, setConfirmedDoctorId] = useState(doctors[0]?.id || '');

  const filtered = bookingRequests.filter(b => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesType = filterType === 'ALL' || b.bookingType === filterType;
    const matchesSearch = !searchQuery ||
      b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientPhone.includes(searchQuery);
    return matchesStatus && matchesType && matchesSearch;
  });

  const newCount = bookingRequests.filter(b => b.status === 'NEW').length;
  const confirmedCount = bookingRequests.filter(b => b.status === 'CONFIRMED').length;

  const handleOpenConfirm = (b: PublicBookingRequest) => {
    setConfirmModalBooking(b);
    if (b.doctorId) {
      setConfirmedDoctorId(b.doctorId);
    }
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmModalBooking) return;

    confirmBookingRequest(confirmModalBooking.id, 'Reception Desk');

    // If it was an appointment, create actual appointment record in clinic system
    if (confirmModalBooking.bookingType === 'appointment') {
      const doc = doctors.find(d => d.id === confirmedDoctorId) || doctors[0];
      addAppointment({
        doctorId: doc?.id || 'doc-1',
        doctorName: doc?.name || confirmModalBooking.doctorName || 'Consultant',
        patientId: `pat-${Date.now()}`,
        patientName: confirmModalBooking.patientName,
        patientPhone: confirmModalBooking.patientPhone,
        patientAge: confirmModalBooking.patientAge || 30,
        patientGender: (confirmModalBooking.patientGender as any) || 'Male',
        date: confirmModalBooking.preferredDate || new Date().toISOString().split('T')[0],
        timeSlot: confirmModalBooking.preferredTime || '06:00 PM',
        status: 'Booked',
        fee: 1000,
        paymentStatus: 'Unpaid',
        chamberRoom: doc?.chamberRoom || doc?.chamberNo || 'Chamber-101',
        chamberNo: doc?.chamberRoom || doc?.chamberNo || 'Chamber-101'
      });
    }

    // Send SMS confirmation if checked
    if (sendSms) {
      const msg = `Dear ${confirmModalBooking.patientName}, your online booking has been CONFIRMED. Please visit reception at the scheduled time. Thank you!`;
      sendSmsNotification(confirmModalBooking.patientPhone, msg, 'BOOKING_CONFIRM');
    }

    setConfirmModalBooking(null);
    showToast('Booking confirmed & converted to active schedule!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Online Patient Booking Requests
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Manage diagnostic test bookings and specialist appointment inquiries received from your public website
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '16px 20px', border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>New Requests</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>{newCount}</div>
          <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>Awaiting reception confirmation</div>
        </div>

        <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #a7f3d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Confirmed Bookings</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>{confirmedCount}</div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>Scheduled & converted</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Inquiries</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{bookingRequests.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Via public website portal</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Test Bookings</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            {bookingRequests.filter(b => b.bookingType === 'test').length}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Pathology & imaging inquiries</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search patient name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['ALL', 'NEW', 'CONFIRMED', 'CANCELLED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 12px',
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

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              outline: 'none'
            }}
          >
            <option value="ALL">All Types</option>
            <option value="appointment">Doctor Appointment</option>
            <option value="test">Diagnostic Test</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Showing <strong>{filtered.length}</strong> of {bookingRequests.length} inquiries
        </div>
      </div>

      {/* Table */}
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
                <th style={{ padding: '14px 20px' }}>Patient Details</th>
                <th style={{ padding: '14px 16px' }}>Booking Type</th>
                <th style={{ padding: '14px 16px' }}>Requested Service / Doctor</th>
                <th style={{ padding: '14px 16px' }}>Preferred Schedule</th>
                <th style={{ padding: '14px 16px' }}>Patient Notes</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <Globe size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No online booking requests found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr
                    key={req.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Patient */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.patientName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                        <Phone size={12} />
                        <span>{req.patientPhone}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {req.patientGender || 'Male'}, {req.patientAge || '30'} yrs
                      </div>
                    </td>

                    {/* Booking Type */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: req.bookingType === 'appointment' ? '#eff6ff' : '#f3e8ff',
                        color: req.bookingType === 'appointment' ? '#2563eb' : '#7c3aed'
                      }}>
                        {req.bookingType === 'appointment' ? <User size={12} /> : <FlaskConical size={12} />}
                        {req.bookingType === 'appointment' ? 'DOCTOR SERIAL' : 'DIAGNOSTIC TEST'}
                      </span>
                    </td>

                    {/* Service / Doctor details */}
                    <td style={{ padding: '14px 16px' }}>
                      {req.bookingType === 'appointment' ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.doctorName || 'Specialist Consultation'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Chamber Serial Request</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {req.requestedTests?.join(', ') || 'Lab Tests'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Pathology specimen collection</div>
                        </div>
                      )}
                    </td>

                    {/* Preferred Date */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.preferredDate || 'Earliest Slot'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{req.preferredTime || 'Morning Slot'}</div>
                    </td>

                    {/* Notes */}
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', maxWidth: '240px' }}>
                      {req.notes || '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          req.status === 'NEW' ? '#fef3c7' :
                          req.status === 'CONFIRMED' ? '#ecfdf5' : '#fee2e2',
                        color:
                          req.status === 'NEW' ? '#d97706' :
                          req.status === 'CONFIRMED' ? '#059669' : '#ef4444'
                      }}>
                        {req.status}
                      </span>
                      {req.confirmedBy && (
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                          By {req.confirmedBy}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {req.status === 'NEW' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenConfirm(req)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#059669',
                              color: '#fff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Check size={13} />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => cancelBookingRequest(req.id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              color: '#64748b',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                            title="Cancel Request"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Processed ✓</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModalBooking && (
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
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Confirm & Convert Booking</h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Add to clinic active appointments and notify patient</div>
              </div>
              <button onClick={() => setConfirmModalBooking(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleConfirmSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>{confirmModalBooking.patientName}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Phone: {confirmModalBooking.patientPhone}</div>
                <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  Requested: {confirmModalBooking.bookingType === 'appointment' ? `Doctor consultation (${confirmModalBooking.doctorName || 'Doctor'})` : `Tests: ${confirmModalBooking.requestedTests?.join(', ')}`}
                </div>
              </div>

              {confirmModalBooking.bookingType === 'appointment' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Confirm Assigned Doctor & Chamber
                  </label>
                  <select
                    value={confirmedDoctorId}
                    onChange={e => setConfirmedDoctorId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty} · Chamber: {d.chamberRoom || d.chamberNo || '101'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <input
                  type="checkbox"
                  id="smsNotifyCheck"
                  checked={sendSms}
                  onChange={e => setSendSms(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="smsNotifyCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', cursor: 'pointer' }}>
                  Send automated SMS confirmation to patient ({confirmModalBooking.patientPhone})
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="button" onClick={() => setConfirmModalBooking(null)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Confirm & Convert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
