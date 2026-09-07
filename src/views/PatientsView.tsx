import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  FilePlus,
  X,
  ExternalLink
} from 'lucide-react';

export const PatientsView: React.FC = () => {
  const { patients, addPatient, setCurrentView, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Add form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [age, setAge] = useState<number>(35);
  const [ageUnit, setAgeUnit] = useState<'yrs' | 'months' | 'days'>('yrs');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<any>('B+');
  const [address, setAddress] = useState('');
  const [nid, setNid] = useState('');

  const filtered = patients.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addPatient({
      name,
      phone,
      whatsApp: whatsApp || phone,
      age,
      ageUnit,
      gender,
      bloodGroup,
      address,
      nid
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setWhatsApp('');
    setAddress('');
    setNid('');
  };

  const handleWhatsAppChat = (p: Patient) => {
    const num = p.whatsApp || p.phone;
    window.open(`https://wa.me/88${num.replace(/[^0-9]/g, '')}`, '_blank');
    showToast(`Opening WhatsApp chat with ${p.name}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Registered Patients Directory, Medical History & Dues</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Register Patient
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by name, mobile number, patient code (/ shortcut)…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong>{filtered.length}</strong> of {patients.length} patients
          </span>
        </div>

        {/* Table */}
        <table className="custom-table">
          <thead>
            <tr>
              <th>Patient Code</th>
              <th>Full Name</th>
              <th>Age & Sex</th>
              <th>Mobile & WhatsApp</th>
              <th>Address</th>
              <th style={{ textAlign: 'right' }}>Total Billed</th>
              <th style={{ textAlign: 'right' }}>Due</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><strong style={{ color: '#059669' }}>{p.code}</strong></td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Reg: {p.createdAt}</div>
                </td>
                <td>{p.age} {p.ageUnit}, {p.gender}</td>
                <td>
                  <div>{p.phone}</div>
                  {p.bloodGroup && (
                    <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                      Blood: {p.bloodGroup}
                    </span>
                  )}
                </td>
                <td>{p.address || '—'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{p.totalBilled.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: p.outstandingDue > 0 ? '#dc2626' : '#16a34a' }}>
                  ৳{p.outstandingDue.toFixed(2)}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      style={{ color: '#16a34a' }}
                      title="WhatsApp Chat"
                      onClick={() => handleWhatsAppChat(p)}
                    >
                      <MessageCircle size={15} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedPatient(p)}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient Details Drawer / Modal */}
      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedPatient.name}</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{selectedPatient.code}</span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedPatient(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                <div><strong>WhatsApp:</strong> {selectedPatient.whatsApp || selectedPatient.phone}</div>
                <div><strong>Age & Gender:</strong> {selectedPatient.age} {selectedPatient.ageUnit}, {selectedPatient.gender}</div>
                <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'Not Specified'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedPatient.address || '—'}</div>
                {selectedPatient.nid && <div style={{ gridColumn: 'span 2' }}><strong>NID:</strong> {selectedPatient.nid}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#e0f7f6', borderRadius: '10px', color: '#0d7671' }}>
                <div>Visits Count: <strong>{selectedPatient.visitCount}</strong></div>
                <div>Total Lifetime Billed: <strong>৳{selectedPatient.totalBilled}</strong></div>
                <div>Due: <strong style={{ color: selectedPatient.outstandingDue > 0 ? '#dc2626' : '#16a34a' }}>৳{selectedPatient.outstandingDue}</strong></div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => handleWhatsAppChat(selectedPatient)}
              >
                <MessageCircle size={15} color="#16a34a" /> WhatsApp Message
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedPatient(null);
                  setCurrentView('new-invoice');
                }}
              >
                <FilePlus size={15} /> Create New Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register Patient</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Patient's Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="017xxxxxxxx"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="017xxxxxxxx"
                      value={whatsApp}
                      onChange={e => setWhatsApp(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={age}
                        onChange={e => setAge(Number(e.target.value) || 0)}
                        required
                      />
                      <select
                        className="form-control"
                        style={{ width: '85px' }}
                        value={ageUnit}
                        onChange={e => setAgeUnit(e.target.value as any)}
                      >
                        <option value="yrs">yrs</option>
                        <option value="months">mos</option>
                        <option value="days">days</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select
                      className="form-control"
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-control"
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Road, Village, Thana"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NID / National ID (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="National ID Number"
                    value={nid}
                    onChange={e => setNid(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
