import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment, WeeklySitting } from '../types';
import {
  Calendar,
  Clock,
  UserCheck,
  Printer,
  FileText,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  X
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    weeklySittings,
    doctors,
    updateAppointmentStatus,
    addAppointment,
    addWeeklySitting,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'daily' | 'waiting-room' | 'schedule' | 'report'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSittingModal, setShowSittingModal] = useState(false);

  // Live waiting room 30-second countdown
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c <= 1 ? 30 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form states
  const [bookDoctorId, setBookDoctorId] = useState(doctors[0]?.id || '');
  const [bookPatientName, setBookPatientName] = useState('');
  const [bookPatientPhone, setBookPatientPhone] = useState('');
  const [bookPatientAge, setBookPatientAge] = useState<number>(35);
  const [bookPatientGender, setBookPatientGender] = useState('Male');
  const [bookTimeSlot, setBookTimeSlot] = useState('06:00 PM');
  const [bookFee, setBookFee] = useState<number>(1000);

  // Sitting form
  const [sittingDoctorId, setSittingDoctorId] = useState(doctors[0]?.id || '');
  const [sittingDay, setSittingDay] = useState<WeeklySitting['dayOfWeek']>('Sunday');
  const [sittingStart, setSittingStart] = useState('05:00 PM');
  const [sittingEnd, setSittingEnd] = useState('09:00 PM');
  const [sittingMax, setSittingMax] = useState<number>(25);
  const [sittingFee, setSittingFee] = useState<number>(1000);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPatientName || !bookPatientPhone) return;
    const doc = doctors.find(d => d.id === bookDoctorId);
    addAppointment({
      doctorId: bookDoctorId,
      doctorName: doc?.name || 'Consultant Specialist',
      patientName: bookPatientName,
      patientPhone: bookPatientPhone,
      patientAge: bookPatientAge,
      patientGender: bookPatientGender,
      date: selectedDate,
      timeSlot: bookTimeSlot,
      chamberRoom: doc?.chamberRoom || 'Room 101',
      fee: bookFee,
      paymentStatus: 'Paid',
      status: 'Waiting'
    });
    setShowBookingModal(false);
    setBookPatientName('');
    setBookPatientPhone('');
  };

  const handleCreateSitting = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === sittingDoctorId);
    addWeeklySitting({
      doctorId: sittingDoctorId,
      doctorName: doc?.name || 'Doctor',
      dayOfWeek: sittingDay,
      startTime: sittingStart,
      endTime: sittingEnd,
      maxSerials: sittingMax,
      fee: sittingFee
    });
    setShowSittingModal(false);
  };

  return (
    <div>
      {/* Top Header matching SihatSuite live */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">
            Thursday, 3 September 2026 — serials issued against each doctor's sitting.
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Action Buttons Toolbar matching SihatSuite */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="date"
            className="form-control"
            style={{ width: '160px', height: '36px' }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Loaded appointments for ${selectedDate}`)}>
            Go
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Serials
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'waiting-room' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('waiting-room')}
          >
            Waiting Room
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('schedule')}
          >
            Weekly Sittings
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('report')}
          >
            <FileText size={14} /> Report
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              window.print();
              showToast('Printing doctor serial sheets');
            }}
          >
            <Printer size={14} /> Print All Sheets
          </button>
        </div>
      </div>

      {/* 1. DAILY SERIALS TABLE */}
      {activeTab === 'daily' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Serial #</th>
                <th>Patient Details</th>
                <th>Doctor & Chamber</th>
                <th>Time Slot</th>
                <th style={{ textAlign: 'right' }}>Fee (৳)</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 800,
                        fontSize: '13px'
                      }}
                    >
                      {app.serialNo}
                    </span>
                  </td>
                  <td>
                    <strong>{app.patientName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {app.patientAge}Y, {app.patientGender} · {app.patientPhone}
                    </div>
                  </td>
                  <td>
                    <strong>{app.doctorName}</strong>
                    <div style={{ fontSize: '11px', color: '#073f8f' }}>{app.chamberRoom}</div>
                  </td>
                  <td>{app.timeSlot}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{app.fee}</td>
                  <td>
                    <span
                      className={`badge ${
                        app.status === 'Completed'
                          ? 'badge-paid'
                          : app.status === 'With Doctor'
                          ? 'badge-partial'
                          : app.status === 'Waiting'
                          ? 'badge-inhouse'
                          : 'badge-due'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      {app.status === 'Waiting' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px' }}
                          onClick={() => updateAppointmentStatus(app.id, 'With Doctor')}
                        >
                          <Play size={11} /> Call Doctor
                        </button>
                      )}
                      {app.status === 'With Doctor' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '11px' }}
                          onClick={() => updateAppointmentStatus(app.id, 'Completed')}
                        >
                          <CheckCircle size={11} /> Mark Done
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. WAITING ROOM QUEUE */}
      {activeTab === 'waiting-room' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }}></span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Live Waiting Room Monitor</h3>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={13} className="spin-icon" /> Auto-refreshing in {countdown}s
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {doctors.map(doc => {
              const docApps = appointments.filter(a => a.doctorId === doc.id);
              const currentPatient = docApps.find(a => a.status === 'With Doctor');
              const waitingList = docApps.filter(a => a.status === 'Waiting');

              return (
                <div key={doc.id} className="card" style={{ borderTop: '4px solid #073f8f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#073f8f' }}>{doc.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.specialty} · {doc.chamberRoom}</div>
                    </div>
                    <span className="badge badge-inhouse">{waitingList.length} Waiting</span>
                  </div>

                  {/* Now In Consultation */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>
                      NOW IN CONSULTATION
                    </div>
                    {currentPatient ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <div>
                          <strong>Serial #{currentPatient.serialNo}: {currentPatient.patientName}</strong>
                          <div style={{ fontSize: '11px', color: '#475569' }}>{currentPatient.patientPhone}</div>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateAppointmentStatus(currentPatient.id, 'Completed')}
                        >
                          Complete
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Doctor chamber ready for next patient.
                      </div>
                    )}
                  </div>

                  {/* Next in Line */}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Next in Line:
                  </div>
                  {waitingList.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>No patients waiting.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {waitingList.slice(0, 3).map(w => (
                        <div
                          key={w.id}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}
                        >
                          <div>
                            <strong>#{w.serialNo}</strong> — {w.patientName}
                          </div>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '10px', padding: '2px 8px' }}
                            onClick={() => updateAppointmentStatus(w.id, 'With Doctor')}
                          >
                            Call Next
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. WEEKLY SITTINGS */}
      {activeTab === 'schedule' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Doctor Weekly Sittings</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Schedule doctor visit days, visiting hours, and serial allotment capacity.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSittingModal(true)}>
              <Plus size={14} /> Add Sitting
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Day of Week</th>
                  <th>Sitting Hours</th>
                  <th>Max Serials</th>
                  <th style={{ textAlign: 'right' }}>Consultation Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklySittings.map(ws => (
                  <tr key={ws.id}>
                    <td><strong>{ws.doctorName}</strong></td>
                    <td><span className="badge badge-inhouse">{ws.dayOfWeek}</span></td>
                    <td>{ws.startTime} – {ws.endTime}</td>
                    <td><strong>{ws.maxSerials}</strong> serials limit</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{ws.fee}</td>
                    <td><span className="badge badge-paid">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. APPOINTMENT REPORT */}
      {activeTab === 'report' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <div className="kpi-card kpi-cyan">
              <div>
                <div className="kpi-label">SERIALS ISSUED</div>
                <div className="kpi-value">{appointments.length}</div>
                <div className="kpi-sub">In selected period</div>
              </div>
              <div className="kpi-icon-wrap"><UserCheck size={24} /></div>
            </div>

            <div className="kpi-card kpi-green">
              <div>
                <div className="kpi-label">PATIENTS SEEN</div>
                <div className="kpi-value">{appointments.filter(a => a.status === 'Completed').length}</div>
                <div className="kpi-sub">Completed consultations</div>
              </div>
              <div className="kpi-icon-wrap"><CheckCircle size={24} /></div>
            </div>

            <div className="kpi-card kpi-amber">
              <div>
                <div className="kpi-label">NO-SHOWS / CANCELLED</div>
                <div className="kpi-value">{appointments.filter(a => a.status === 'Cancelled').length}</div>
                <div className="kpi-sub">Missed consultations</div>
              </div>
              <div className="kpi-icon-wrap"><XCircle size={24} /></div>
            </div>

            <div className="kpi-card kpi-purple">
              <div>
                <div className="kpi-label">FEES COLLECTED</div>
                <div className="kpi-value">৳{appointments.reduce((s, a) => s + a.fee, 0).toLocaleString()}</div>
                <div className="kpi-sub">Consultation charges</div>
              </div>
              <div className="kpi-icon-wrap"><Clock size={24} /></div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Doctor Breakdown</h3>
            <table className="custom-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Serials Issued</th>
                  <th>Completed</th>
                  <th>Fees Collected</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{appointments.filter(a => a.doctorId === d.id).length}</td>
                    <td>{appointments.filter(a => a.doctorId === d.id && a.status === 'Completed').length}</td>
                    <td>৳{(appointments.filter(a => a.doctorId === d.id).length * d.consultationFee).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-backdrop" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book Doctor Appointment Serial</h3>
              <button className="icon-btn" onClick={() => setShowBookingModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Doctor / Consultant *</label>
                  <select
                    className="form-control"
                    value={bookDoctorId}
                    onChange={e => setBookDoctorId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty}) — Fee: ৳{d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Patient Full Name"
                    value={bookPatientName}
                    onChange={e => setBookPatientName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="017xxxxxxxx"
                      value={bookPatientPhone}
                      onChange={e => setBookPatientPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bookPatientAge}
                      onChange={e => setBookPatientAge(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-control"
                      value={bookPatientGender}
                      onChange={e => setBookPatientGender(e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Preferred Time Slot</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookTimeSlot}
                      onChange={e => setBookTimeSlot(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bookFee}
                      onChange={e => setBookFee(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Booking Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Weekly Sitting Modal */}
      {showSittingModal && (
        <div className="modal-backdrop" onClick={() => setShowSittingModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Weekly Sitting</h3>
              <button className="icon-btn" onClick={() => setShowSittingModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSitting}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Doctor *</label>
                  <select
                    className="form-control"
                    value={sittingDoctorId}
                    onChange={e => setSittingDoctorId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Day of Week *</label>
                  <select
                    className="form-control"
                    value={sittingDay}
                    onChange={e => setSittingDay(e.target.value as any)}
                  >
                    {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sittingStart}
                      onChange={e => setSittingStart(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sittingEnd}
                      onChange={e => setSittingEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Max Serial Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={sittingMax}
                      onChange={e => setSittingMax(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Visit Fee (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={sittingFee}
                      onChange={e => setSittingFee(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSittingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Sitting Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
