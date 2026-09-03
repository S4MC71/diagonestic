import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Chamber } from '../types';
import { Building, Plus, Clock, Calendar, Phone, DollarSign, X } from 'lucide-react';

export const ChambersView: React.FC = () => {
  const { chambers, addChamber, doctors, showToast } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [visitingDays, setVisitingDays] = useState('Sat, Sun, Tue, Thu');
  const [startTime, setStartTime] = useState('04:00 PM');
  const [endTime, setEndTime] = useState('08:00 PM');
  const [fee, setFee] = useState(800);
  const [followFee, setFollowFee] = useState(400);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === doctorId) || doctors[0];
    const newCh: Chamber = {
      id: `ch-${Date.now()}`,
      name,
      roomNo,
      doctorId: doc.id,
      doctorName: doc.name,
      visitingDays: visitingDays.split(',').map(s => s.trim()),
      startTime,
      endTime,
      maxPatients: 30,
      consultationFee: fee,
      followUpFee: followFee,
      phone: '01711-234567'
    };
    addChamber(newCh);
    setShowModal(false);
    setName('');
    setRoomNo('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Consultation Chambers</h1>
          <p className="page-subtitle">Physical Chamber Rooms, Schedule Allotments & Patient Capacity</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Chamber Room
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {chambers.map(ch => (
          <div key={ch.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#073f8f' }}>{ch.name}</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Room: <strong>#{ch.roomNo}</strong></div>
                </div>
                <span style={{ background: '#e0f7f6', color: '#0d7671', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                  ACTIVE
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '14px' }}>
                {ch.doctorName}
              </div>

              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={15} color="#073f8f" />
                  <span>Days: <strong>{ch.visitingDays.join(', ')}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="#073f8f" />
                  <span>Time: <strong>{ch.startTime} – {ch.endTime}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={15} color="#073f8f" />
                  <span>New Fee: <strong>৳{ch.consultationFee}</strong> | Follow-up: <strong>৳{ch.followUpFee}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Capacity: {ch.maxPatients} Serials</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => showToast(`Opening schedule manager for ${ch.name}`)}
              >
                Manage Sitting
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Configure Chamber Room</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Chamber Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Chamber 103 (Medicine)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room No *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="103"
                      value={roomNo}
                      onChange={e => setRoomNo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Consultant Doctor *</label>
                  <select
                    className="form-control"
                    value={doctorId}
                    onChange={e => setDoctorId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Visiting Days (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={visitingDays}
                    onChange={e => setVisitingDays(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (৳)</label>
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
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Chamber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
