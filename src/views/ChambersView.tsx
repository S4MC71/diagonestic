import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Chamber, WeeklySitting } from '../types';
import {
  Building,
  Plus,
  Clock,
  Calendar,
  Phone,
  DollarSign,
  X,
  User,
  Users,
  Search,
  CheckCircle,
  CalendarCheck,
  Edit2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

const WEEKDAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const ChambersView: React.FC = () => {
  const { chambers, addChamber, doctors, appointments, addAppointment, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingChamber, setBookingChamber] = useState<Chamber | null>(null);
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null);

  // Form states for Add Chamber
  const [name, setName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Saturday', 'Sunday', 'Tuesday', 'Thursday']);
  const [startTime, setStartTime] = useState('05:00 PM');
  const [endTime, setEndTime] = useState('09:00 PM');
  const [fee, setFee] = useState<number>(1000);
  const [followFee, setFollowFee] = useState<number>(500);
  const [maxPatients, setMaxPatients] = useState<number>(25);
  const [chamberPhone, setChamberPhone] = useState('01711-234567');

  // Booking modal form states
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(35);
  const [patientGender, setPatientGender] = useState('Male');
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const filteredChambers = chambers.filter(ch => {
    const matchSearch =
      ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.roomNo.toLowerCase().includes(search.toLowerCase()) ||
      ch.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchDoctor = doctorFilter === 'ALL' || ch.doctorId === doctorFilter;
    return matchSearch && matchDoctor;
  });

  const handleCreateChamber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomNo) return;
    const doc = doctors.find(d => d.id === doctorId) || doctors[0];
    const newCh: Chamber = {
      id: `ch-${Date.now()}`,
      name,
      roomNo,
      doctorId: doc.id,
      doctorName: doc.name,
      visitingDays: selectedDays,
      startTime,
      endTime,
      maxPatients,
      consultationFee: fee,
      followUpFee: followFee,
      phone: chamberPhone
    };
    addChamber(newCh);
    setShowAddModal(false);
    resetForm();
    showToast(`Created chamber room #${roomNo}: ${name}`);
  };

  const resetForm = () => {
    setName('');
    setRoomNo('');
    setSelectedDays(['Saturday', 'Sunday', 'Tuesday', 'Thursday']);
    setStartTime('05:00 PM');
    setEndTime('09:00 PM');
    setFee(1000);
    setFollowFee(500);
    setMaxPatients(25);
  };

  const handleBookSerialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingChamber || !patientName || !patientPhone) return;

    addAppointment({
      doctorId: bookingChamber.doctorId,
      doctorName: bookingChamber.doctorName,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      date: bookingDate,
      timeSlot: bookingChamber.startTime,
      chamberRoom: `Room #${bookingChamber.roomNo}`,
      fee: bookingChamber.consultationFee,
      paymentStatus: 'Paid',
      status: 'Waiting'
    });

    showToast(`Booked appointment serial for ${patientName} with ${bookingChamber.doctorName}`);
    setBookingChamber(null);
    setPatientName('');
    setPatientPhone('');
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Consultation Chambers</h1>
          <p className="page-subtitle">
            Physical Chamber Rooms, Schedule Allotments, Doctor Sittings & Serial Queues
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> + Add Chamber Room
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="table-search-input" style={{ width: '280px' }}>
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search chamber name, room #, or doctor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: '200px', height: '34px', fontSize: '12px' }}
            value={doctorFilter}
            onChange={e => setDoctorFilter(e.target.value)}
          >
            <option value="ALL">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Active Consultation Rooms: <strong>{chambers.length}</strong>
        </span>
      </div>

      {/* Chambers Grid Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredChambers.map(ch => {
          // Count active appointments booked today for this chamber/doctor
          const bookedCount = appointments.filter(
            a => a.doctorId === ch.doctorId && a.status !== 'Cancelled'
          ).length;
          const capacityPercent = Math.min(100, Math.round((bookedCount / ch.maxPatients) * 100));

          return (
            <div
              key={ch.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Card Top Title & Room Badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      {ch.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Room No: <strong style={{ color: '#059669' }}>#{ch.roomNo}</strong>
                    </div>
                  </div>
                  <span className="badge badge-inhouse" style={{ fontWeight: 700 }}>
                    ACTIVE
                  </span>
                </div>

                {/* Doctor Assigned Banner */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                      {ch.doctorName}
                    </strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Consultant Specialist
                    </div>
                  </div>
                </div>

                {/* Schedule & Fees List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#059669" />
                    <span>
                      Visiting Days: <strong>{ch.visitingDays.join(', ')}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="#059669" />
                    <span>
                      Sitting Time: <strong>{ch.startTime} – {ch.endTime}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={14} color="#059669" />
                    <span>
                      New Fee: <strong>৳{ch.consultationFee}</strong> · Follow-up: <strong>৳{ch.followUpFee}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#059669" />
                    <span>
                      Desk Phone: <strong>{ch.phone || '01711-234567'}</strong>
                    </span>
                  </div>
                </div>

                {/* Patient Capacity Progress Bar */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      marginBottom: '4px'
                    }}
                  >
                    <span style={{ color: '#64748b' }}>Serial Capacity:</span>
                    <strong style={{ color: capacityPercent > 80 ? '#dc2626' : '#059669' }}>
                      {bookedCount} / {ch.maxPatients} Serials ({capacityPercent}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e2e8f0',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${capacityPercent}%`,
                        backgroundColor: capacityPercent > 80 ? '#ef4444' : '#059669',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setBookingChamber(ch)}
                >
                  <Plus size={14} /> Book Serial
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditingChamber(ch)}
                >
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL: Add Chamber Room                                   */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Consultation Chamber Room</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateChamber}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Chamber / Department Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cardiology & Chest Suite"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 101"
                      value={roomNo}
                      onChange={e => setRoomNo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Visiting Doctor *</label>
                  <select
                    className="form-control"
                    value={doctorId}
                    onChange={e => setDoctorId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visiting Days Checkbox Multi-Picker */}
                <div className="form-group">
                  <label className="form-label">Visiting Schedule Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {WEEKDAYS.map(day => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid #059669' : '1px solid #cbd5e1',
                            background: isSelected ? '#ecfdf5' : '#ffffff',
                            color: isSelected ? '#047857' : '#475569'
                          }}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Sitting Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sitting End Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">New Fee (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fee}
                      onChange={e => setFee(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Follow-up Fee (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={followFee}
                      onChange={e => setFollowFee(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Patients</label>
                    <input
                      type="number"
                      className="form-control"
                      value={maxPatients}
                      onChange={e => setMaxPatients(Number(e.target.value) || 25)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Chamber Room Direct Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={chamberPhone}
                    onChange={e => setChamberPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Chamber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Book Appointment Serial for Chamber                */}
      {/* ========================================================= */}
      {bookingChamber && (
        <div className="modal-backdrop" onClick={() => setBookingChamber(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book Doctor Appointment Serial</h3>
              <button className="icon-btn" onClick={() => setBookingChamber(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBookSerialSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px'
                  }}
                >
                  <div>Doctor: <strong style={{ color: '#059669' }}>{bookingChamber.doctorName}</strong></div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Chamber: Room #{bookingChamber.roomNo} · Fee: ৳{bookingChamber.consultationFee}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Patient Name"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="017XXXXXXXX"
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      value={patientAge}
                      onChange={e => setPatientAge(Number(e.target.value) || 30)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-control"
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookingChamber(null)}
                >
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

      {/* ========================================================= */}
      {/* MODAL: Edit Chamber                                       */}
      {/* ========================================================= */}
      {editingChamber && (
        <div className="modal-backdrop" onClick={() => setEditingChamber(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Chamber Room #{editingChamber.roomNo}</h3>
              <button className="icon-btn" onClick={() => setEditingChamber(null)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast(`Updated chamber ${editingChamber.name}`);
                setEditingChamber(null);
              }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Chamber Room Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingChamber.name}
                    onChange={e =>
                      setEditingChamber({ ...editingChamber, name: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingChamber.roomNo}
                      onChange={e =>
                        setEditingChamber({ ...editingChamber, roomNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingChamber.consultationFee}
                      onChange={e =>
                        setEditingChamber({
                          ...editingChamber,
                          consultationFee: Number(e.target.value) || 0
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingChamber(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
