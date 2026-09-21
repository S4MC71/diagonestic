import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  FilePlus,
  FileText,
  Heart,
  Activity,
  Edit2,
  Trash2,
  X,
  Check,
  Building,
  UserCheck
} from 'lucide-react';

export const PatientsView: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient, setCurrentView, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Add form fields matching SihatSuite
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [age, setAge] = useState<number>(35);
  const [ageUnit, setAgeUnit] = useState<'yrs' | 'months' | 'days'>('yrs');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [nationality, setNationality] = useState('Bangladeshi');
  const [address, setAddress] = useState('');
  const [nid, setNid] = useState('');
  const [isWholesale, setIsWholesale] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNid, setEditNid] = useState('');

  const filtered = patients.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Please enter full name and phone number');
      return;
    }

    addPatient({
      name: name.trim(),
      phone: phone.trim(),
      whatsApp: whatsApp.trim() || phone.trim(),
      age,
      ageUnit,
      gender,
      bloodGroup: 'B+',
      address: address.trim(),
      nid: nid.trim()
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setWhatsApp('');
    setAddress('');
    setNid('');
    setIsWholesale(false);
    showToast(`Patient ${name.trim()} registered successfully`);
  };

  const handleStartEdit = (p: Patient) => {
    setEditingPatient(p);
    setEditName(p.name);
    setEditPhone(p.phone);
    setEditWhatsApp(p.whatsApp || p.phone);
    setEditAddress(p.address || '');
    setEditNid(p.nid || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    updatePatient(editingPatient.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      whatsApp: editWhatsApp.trim(),
      address: editAddress.trim(),
      nid: editNid.trim()
    });

    setEditingPatient(null);
    showToast(`Patient ${editName.trim()} updated`);
  };

  const handleDelete = (p: Patient) => {
    if (window.confirm(`Are you sure you want to delete patient record "${p.name}" (${p.code})?`)) {
      deletePatient(p.id);
      showToast(`Patient ${p.code} removed`);
    }
  };

  const handleWhatsAppChat = (p: Patient) => {
    const num = p.whatsApp || p.phone;
    window.open(`https://wa.me/88${num.replace(/[^0-9]/g, '')}`, '_blank');
    showToast(`Opening WhatsApp chat with ${p.name}`);
  };

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER MATCHING SIHATSUITE
          ==================================================================== */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Patients
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Search, register, and manage patients for this facility.
          </p>
        </div>

        {/* Top Right Action Button */}
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#059669',
              color: '#ffffff',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(5,150,105,0.2)'
            }}
          >
            <Plus size={16} /> Add Patient
          </button>
        </div>
      </div>

      {/* ====================================================================
          CARD WRAPPER WITH SEARCH BAR & DATA TABLE
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        {/* Card Top Title & Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            All Patients
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            {patients.length} patient{patients.length > 1 ? 's' : ''}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', maxWidth: '460px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Name, mobile or patient code... ( / )"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '34px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                background: '#059669',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Patients Table Matching SihatSuite */}
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  CODE
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  NAME
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  PHONE
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  GENDER / AGE
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  ACTIVITY
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: '#64748b' }}>
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s ease' }}
                    className="table-row-hover"
                  >
                    {/* CODE */}
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: '#059669', fontFamily: 'monospace', fontSize: '12.5px' }}>
                        {p.code}
                      </strong>
                    </td>

                    {/* NAME */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                      {p.address && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {p.address}
                        </div>
                      )}
                    </td>

                    {/* PHONE */}
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {p.phone || '—'}
                    </td>

                    {/* GENDER / AGE */}
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {p.gender}, {p.age} {p.ageUnit}
                    </td>

                    {/* ACTIVITY PILLS */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setCurrentView('new-invoice')}
                          style={{
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Invoice
                        </button>

                        <span
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          ✓ 1 report
                        </span>

                        <span
                          style={{
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            color: '#7c3aed',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          📄 1 rx
                        </span>
                      </div>
                    </td>

                    {/* 6 ROW ACTIONS */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* Add Bill */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCurrentView('new-invoice')}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#059669' }}
                          title="Issue new bill"
                        >
                          <FilePlus size={13} />
                        </button>

                        {/* Add Report */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCurrentView('lab-reports')}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#0284c7' }}
                          title="View lab reports"
                        >
                          <FileText size={13} />
                        </button>

                        {/* Vitals */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedPatient(p)}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#e11d48' }}
                          title="Record vitals"
                        >
                          <Heart size={13} />
                        </button>

                        {/* Health Activity */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedPatient(p)}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#7c3aed' }}
                          title="Clinical history"
                        >
                          <Activity size={13} />
                        </button>

                        {/* Edit Patient */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStartEdit(p)}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#334155' }}
                          title="Edit patient"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Patient */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelete(p)}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #fecdd3', color: '#e11d48' }}
                          title="Delete patient"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          <div>Page 1 of 1 ({filtered.length} patients)</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5, padding: '4px 10px', fontSize: '11px' }}>
              Prev
            </button>
            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5, padding: '4px 10px', fontSize: '11px' }}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL 1: ADD PATIENT MODAL (MATCHING SIHATSUITE)
          ==================================================================== */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '560px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Add Patient
              </h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '8px' }}
                  />
                </div>

                {/* Phone & WhatsApp */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Phone *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      WhatsApp No
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+8801XXXXXXXXX"
                      value={whatsApp}
                      onChange={e => setWhatsApp(e.target.value)}
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      International format, e.g. +8801XXXXXXXXX
                    </div>
                  </div>
                </div>

                {/* Age & Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Age *
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="Age"
                        value={age}
                        onChange={e => setAge(Number(e.target.value) || 0)}
                        required
                        style={{ height: '40px', borderRadius: '8px' }}
                      />
                      <select
                        className="form-control"
                        value={ageUnit}
                        onChange={e => setAgeUnit(e.target.value as any)}
                        style={{ width: '85px', height: '40px', borderRadius: '8px' }}
                      >
                        <option value="yrs">yrs</option>
                        <option value="months">mos</option>
                        <option value="days">days</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Gender *
                    </label>
                    <select
                      className="form-control"
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      style={{ height: '40px', borderRadius: '8px' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Nationality */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Nationality
                  </label>
                  <select
                    className="form-control"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    style={{ height: '40px', borderRadius: '8px' }}
                  >
                    <option value="Bangladeshi">Bangladeshi</option>
                    <option value="Indian">Indian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Address */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={{ height: '40px', borderRadius: '8px' }}
                  />
                </div>

                {/* Government ID */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Government ID (NID / Passport / SSN)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Government ID"
                    value={nid}
                    onChange={e => setNid(e.target.value)}
                    style={{ height: '40px', borderRadius: '8px' }}
                  />
                </div>

                {/* Wholesale Account Checkbox */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isWholesale}
                      onChange={e => setIsWholesale(e.target.checked)}
                      style={{ accentColor: '#059669', marginTop: '3px' }}
                    />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        Wholesale account
                      </span>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                        Another shop, not a walk-in. The counter opens their bill on the wholesale price list — still switchable per sale.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Create patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: EDIT PATIENT MODAL
          ==================================================================== */}
      {editingPatient && (
        <div className="modal-backdrop" onClick={() => setEditingPatient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Patient: {editingPatient.code}
              </h3>
              <button className="icon-btn" onClick={() => setEditingPatient(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Phone *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      required
                      style={{ height: '40px', borderRadius: '7px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      WhatsApp No
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editWhatsApp}
                      onChange={e => setEditWhatsApp(e.target.value)}
                      style={{ height: '40px', borderRadius: '7px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingPatient(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 600,
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '7px'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: PATIENT CLINICAL VITALS & DETAILS
          ==================================================================== */}
      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '92%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedPatient.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>{selectedPatient.code}</span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedPatient(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                <div><strong>WhatsApp:</strong> {selectedPatient.whatsApp || selectedPatient.phone}</div>
                <div><strong>Age & Gender:</strong> {selectedPatient.age} {selectedPatient.ageUnit}, {selectedPatient.gender}</div>
                <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'Not Specified'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedPatient.address || '—'}</div>
                {selectedPatient.nid && <div style={{ gridColumn: 'span 2' }}><strong>NID / Govt ID:</strong> {selectedPatient.nid}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#ecfdf5', borderRadius: '10px', color: '#065f46' }}>
                <div>Visits: <strong>{selectedPatient.visitCount}</strong></div>
                <div>Total Lifetime Billed: <strong>৳{selectedPatient.totalBilled}</strong></div>
                <div>Due: <strong style={{ color: selectedPatient.outstandingDue > 0 ? '#dc2626' : '#059669' }}>৳{selectedPatient.outstandingDue}</strong></div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleWhatsAppChat(selectedPatient)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageCircle size={15} color="#16a34a" /> WhatsApp Message
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedPatient(null);
                  setCurrentView('new-invoice');
                }}
                style={{
                  background: '#059669',
                  color: '#fff',
                  fontWeight: 600,
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '7px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FilePlus size={15} /> Create New Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
