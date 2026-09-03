import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types';
import {
  Search,
  UserPlus,
  Phone,
  Percent,
  DollarSign,
  Award,
  X,
  CreditCard
} from 'lucide-react';

export const DoctorsView: React.FC = () => {
  const { doctors, addDoctor, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [payoutDoctor, setPayoutDoctor] = useState<Doctor | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  // Form states
  const [name, setName] = useState('');
  const [degrees, setDegrees] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionValue, setCommissionValue] = useState<number>(25);

  const filtered = doctors.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name,
      degrees,
      specialty,
      designation: 'Consultant',
      hospital,
      phone,
      commissionType,
      commissionValue,
      active: true,
      totalReferrals: 0,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0
    };
    addDoctor(newDoc);
    setShowAddModal(false);
    setName('');
    setDegrees('');
    setSpecialty('');
    setHospital('');
    setPhone('');
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutDoctor || payoutAmount <= 0) return;
    payoutDoctor.totalCommissionPaid += payoutAmount;
    showToast(`Paid ৳${payoutAmount} commission to ${payoutDoctor.name}`);
    setPayoutDoctor(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors & Referral Agents</h1>
          <p className="page-subtitle">Referring Consultants, Commission Structures & Payment Disbursal</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add Doctor / Agent
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, mobile…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Active Doctors: <strong>{doctors.length}</strong>
          </span>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Doctor Name & Degrees</th>
              <th>Specialty & Hospital</th>
              <th>Phone</th>
              <th>Commission Rate</th>
              <th style={{ textAlign: 'right' }}>Referrals</th>
              <th style={{ textAlign: 'right' }}>Earned</th>
              <th style={{ textAlign: 'right' }}>Payable</th>
              <th style={{ textAlign: 'center', width: '110px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => {
              const payable = Math.max(0, d.totalCommissionEarned - d.totalCommissionPaid);
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#073f8f' }}>{d.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{d.degrees}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.specialty}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{d.hospital}</div>
                  </td>
                  <td>{d.phone}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#e0f7f6', color: '#0d7671', fontWeight: 600, fontSize: '12px' }}>
                      {d.commissionType === 'percentage' ? `${d.commissionValue}% of Net` : `৳${d.commissionValue} / Test`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.totalReferrals}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{d.totalCommissionEarned.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: payable > 0 ? '#dc2626' : '#16a34a' }}>
                    ৳{payable.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {payable > 0 ? (
                      <button
                        className="btn btn-sm btn-teal"
                        onClick={() => {
                          setPayoutDoctor(d);
                          setPayoutAmount(payable);
                        }}
                      >
                        Disburse
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Cleared</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disburse Commission Modal */}
      {payoutDoctor && (
        <div className="modal-backdrop" onClick={() => setPayoutDoctor(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Disburse Commission</h3>
              <button className="icon-btn" onClick={() => setPayoutDoctor(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handlePayoutSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
                  <div>Doctor: <strong>{payoutDoctor.name}</strong></div>
                  <div style={{ marginTop: '4px', color: '#dc2626', fontWeight: 700 }}>
                    Outstanding Balance: ৳{(payoutDoctor.totalCommissionEarned - payoutDoctor.totalCommissionPaid).toLocaleString()}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(Number(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPayoutDoctor(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Consultant / Referring Doctor</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Md. Ashraful Alam"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Degrees & Qualifications</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MBBS, FCPS (Medicine), MD"
                    value={degrees}
                    onChange={e => setDegrees(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Specialty</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cardiology, Orthopedics"
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                    />
                  </div>
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
                </div>

                <div className="form-group">
                  <label className="form-label">Hospital / Clinic Affiliation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Jhalakathi District Hospital"
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Commission Model</label>
                    <select
                      className="form-control"
                      value={commissionType}
                      onChange={e => setCommissionType(e.target.value as any)}
                    >
                      <option value="percentage">Percentage (% of Net Bill)</option>
                      <option value="fixed">Fixed (৳ per Test)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Commission Value *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={commissionValue}
                      onChange={e => setCommissionValue(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
