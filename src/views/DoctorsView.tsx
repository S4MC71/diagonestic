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
  CreditCard,
  MessageSquare,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Stethoscope
} from 'lucide-react';

export const DoctorsView: React.FC = () => {
  const { doctors, addDoctor, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [payoutDoctor, setPayoutDoctor] = useState<Doctor | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [linkPortalDoctor, setLinkPortalDoctor] = useState<Doctor | null>(null);
  const [portalUsername, setPortalUsername] = useState('');
  const [portalPassword, setPortalPassword] = useState('');

  // Form states for Add Doctor
  const [name, setName] = useState('');
  const [degrees, setDegrees] = useState('');
  const [bmdcReg, setBmdcReg] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionValue, setCommissionValue] = useState<number>(25);
  const [allowLogin, setAllowLogin] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const filtered = doctors.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      (d.bmdcReg && d.bmdcReg.toLowerCase().includes(search.toLowerCase()));

    const matchComm =
      commissionFilter === 'ALL' ||
      (commissionFilter === 'PERCENTAGE' && d.commissionType === 'percentage') ||
      (commissionFilter === 'FIXED' && d.commissionType === 'fixed');

    return matchSearch && matchComm;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name,
      degrees,
      bmdcReg: bmdcReg || `A-${Math.floor(10000 + Math.random() * 90000)}`,
      specialty,
      designation: 'Consultant Specialist',
      hospital: hospital || 'District General Hospital',
      phone,
      commissionType,
      commissionValue,
      active: true,
      hasLogin: allowLogin,
      loginUsername: allowLogin ? newUsername : undefined,
      totalReferrals: 0,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0
    };
    addDoctor(newDoc);
    setShowAddModal(false);
    resetAddForm();
    showToast(`Added referring doctor: ${name}`);
  };

  const resetAddForm = () => {
    setName('');
    setDegrees('');
    setBmdcReg('');
    setSpecialty('General Medicine');
    setHospital('');
    setPhone('');
    setCommissionType('percentage');
    setCommissionValue(25);
    setAllowLogin(false);
    setNewUsername('');
    setNewPassword('');
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutDoctor || payoutAmount <= 0) return;
    payoutDoctor.totalCommissionPaid += payoutAmount;
    showToast(`Paid ৳${payoutAmount.toLocaleString()} commission to ${payoutDoctor.name}`);
    setPayoutDoctor(null);
  };

  const handleLinkPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkPortalDoctor) return;
    linkPortalDoctor.hasLogin = true;
    linkPortalDoctor.loginUsername = portalUsername;
    showToast(`Linked portal login credentials for ${linkPortalDoctor.name}`);
    setLinkPortalDoctor(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Referring Doctors</h1>
          <p className="page-subtitle">
            Directory of Referring Consultants, Commission Rates, Disbursals & Portal Access
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> + Add Doctor
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="table-search-input" style={{ width: '280px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search by doctor, specialty, BMDC ( / )"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '190px', height: '34px', fontSize: '12px' }}
              value={commissionFilter}
              onChange={e => setCommissionFilter(e.target.value)}
            >
              <option value="ALL">All commission types</option>
              <option value="PERCENTAGE">Percentage Commission</option>
              <option value="FIXED">Fixed Amount per Test</option>
            </select>
          </div>

          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Total Registered: <strong>{doctors.length}</strong> doctors
          </span>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>SPECIALIZATION</th>
              <th>PHONE</th>
              <th>COMMISSION</th>
              <th style={{ textAlign: 'center' }}>LOGIN</th>
              <th style={{ textAlign: 'right' }}>EARNED</th>
              <th style={{ textAlign: 'right' }}>OUTSTANDING</th>
              <th style={{ textAlign: 'center', width: '130px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => {
              const payable = Math.max(0, d.totalCommissionEarned - d.totalCommissionPaid);
              const isLinked = Boolean(d.hasLogin);

              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}
                      >
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '13px' }}>{d.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>BMDC: {d.bmdcReg || 'A-45812'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{d.specialty}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {d.degrees} · {d.hospital}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                        {d.phone}
                      </span>
                      <a
                        href={`https://wa.me/${d.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Chat on WhatsApp"
                        style={{ color: '#16a34a', display: 'inline-flex' }}
                      >
                        <MessageSquare size={14} />
                      </a>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#ecfdf5',
                        color: '#047857',
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'inline-block'
                      }}
                    >
                      {d.commissionType === 'percentage'
                        ? `${d.commissionValue}% Net`
                        : `৳${d.commissionValue} Fixed`}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isLinked ? (
                      <span
                        className="badge badge-paid"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ShieldCheck size={12} /> Active
                      </span>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                        onClick={() => {
                          setLinkPortalDoctor(d);
                          setPortalUsername(`doc_${d.phone.slice(-4)}`);
                          setPortalPassword('care@1234');
                        }}
                      >
                        <KeyRound size={12} /> Link
                      </button>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ৳{d.totalCommissionEarned.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: payable > 0 ? '#dc2626' : '#16a34a'
                    }}
                  >
                    ৳{payable.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      {payable > 0 && (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          title="Settle Due Commission"
                          onClick={() => {
                            setPayoutDoctor(d);
                            setPayoutAmount(payable);
                          }}
                        >
                          Disburse
                        </button>
                      )}
                      <button
                        className="icon-btn"
                        title="Edit Doctor"
                        onClick={() => {
                          setEditingDoctor(d);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        style={{ color: '#dc2626' }}
                        title="Delete Doctor"
                        onClick={() => {
                          showToast(`Deactivated doctor: ${d.name}`);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* MODAL: Add Doctor                                         */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register Referring Doctor</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Doctor Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Prof. Dr. M. A. Rahman"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">BMDC Reg. No.</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. A-34891"
                      value={bmdcReg}
                      onChange={e => setBmdcReg(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Qualifications / Degrees</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. MBBS, FCPS (Medicine)"
                      value={degrees}
                      onChange={e => setDegrees(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select
                      className="form-control"
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                    >
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Gynecology & Obstetrics</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                      <option>Neurology</option>
                      <option>Gastroenterology</option>
                      <option>Dermatology</option>
                      <option>General Surgery</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="01711-XXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital / Chamber</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Central Medical College"
                      value={hospital}
                      onChange={e => setHospital(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                    Commission Rate Structure
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b' }}>Commission Type</label>
                      <select
                        className="form-control"
                        value={commissionType}
                        onChange={e => setCommissionType(e.target.value as any)}
                      >
                        <option value="percentage">Percentage (%) of Net Invoice</option>
                        <option value="fixed">Fixed Amount (৳) Per Test</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b' }}>
                        Default Value ({commissionType === 'percentage' ? '%' : '৳'})
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={commissionValue}
                        onChange={e => setCommissionValue(Number(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Allow Portal Login */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={allowLogin}
                      onChange={e => setAllowLogin(e.target.checked)}
                      style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                    />
                    <strong style={{ fontSize: '13px', color: '#047857' }}>
                      Enable Doctor Online Portal Access
                    </strong>
                  </label>

                  {allowLogin && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Portal Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="doctor_username"
                          value={newUsername}
                          onChange={e => setNewUsername(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Portal Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
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
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Disburse Commission                                */}
      {/* ========================================================= */}
      {payoutDoctor && (
        <div className="modal-backdrop" onClick={() => setPayoutDoctor(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Disburse Commission Settlement</h3>
              <button className="icon-btn" onClick={() => setPayoutDoctor(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePayoutSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                  <div>Doctor: <strong style={{ color: '#0f172a' }}>{payoutDoctor.name}</strong></div>
                  <div style={{ marginTop: '4px', color: '#64748b' }}>
                    Total Referrals: <strong>{payoutDoctor.totalReferrals} patients</strong>
                  </div>
                  <div style={{ marginTop: '6px', color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
                    Outstanding Balance: ৳{(payoutDoctor.totalCommissionEarned - payoutDoctor.totalCommissionPaid).toLocaleString()}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    style={{ fontSize: '15px', fontWeight: 700, color: '#059669' }}
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(Number(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select className="form-control">
                    <option>Cash Voucher</option>
                    <option>bKash Merchant / Agent</option>
                    <option>Nagad</option>
                    <option>Bank Account Transfer</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPayoutDoctor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Disbursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Link Doctor Portal Login                           */}
      {/* ========================================================= */}
      {linkPortalDoctor && (
        <div className="modal-backdrop" onClick={() => setLinkPortalDoctor(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Doctor Portal Credentials</h3>
              <button className="icon-btn" onClick={() => setLinkPortalDoctor(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLinkPortal}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Generate doctor credentials to let <strong>{linkPortalDoctor.name}</strong> inspect patient lab reports & commission logs.
                </p>

                <div className="form-group">
                  <label className="form-label">Login Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={portalUsername}
                    onChange={e => setPortalUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temporary Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={portalPassword}
                    onChange={e => setPortalPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLinkPortalDoctor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Link Portal Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Edit Doctor                                        */}
      {/* ========================================================= */}
      {editingDoctor && (
        <div className="modal-backdrop" onClick={() => setEditingDoctor(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Doctor Information</h3>
              <button className="icon-btn" onClick={() => setEditingDoctor(null)}>
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                showToast(`Updated doctor profile for ${editingDoctor.name}`);
                setEditingDoctor(null);
              }}
            >
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingDoctor.name}
                    onChange={e => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Specialty</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingDoctor.specialty}
                      onChange={e =>
                        setEditingDoctor({ ...editingDoctor, specialty: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingDoctor.phone}
                      onChange={e =>
                        setEditingDoctor({ ...editingDoctor, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Commission Type</label>
                    <select
                      className="form-control"
                      value={editingDoctor.commissionType}
                      onChange={e =>
                        setEditingDoctor({
                          ...editingDoctor,
                          commissionType: e.target.value as any
                        })
                      }
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Commission Value</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingDoctor.commissionValue}
                      onChange={e =>
                        setEditingDoctor({
                          ...editingDoctor,
                          commissionValue: Number(e.target.value) || 0
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
                  onClick={() => setEditingDoctor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
