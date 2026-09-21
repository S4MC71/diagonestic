import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Printer,
  ShoppingCart,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  X,
  UserCheck
} from 'lucide-react';

interface PrescriptionItem {
  id: string;
  rxNo: string;
  date: string;
  patientName: string;
  patientCode: string;
  age: number;
  gender: string;
  doctorName: string;
  chamber: string;
  chiefComplaint: string;
  diagnosis: string;
  followUp: string;
  drugsCount: number;
}

const INITIAL_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: 'rx-1',
    rxNo: 'RX-2026-0001',
    date: '14 Sept 2026',
    patientName: 'Md. Rafiqul Islam',
    patientCode: 'P0000001',
    age: 48,
    gender: 'Male',
    doctorName: 'Prof. Dr. M. A. Rahman',
    chamber: 'Consultation Room 1',
    chiefComplaint: 'Chest tightness on exertion, intermittent cough',
    diagnosis: 'Essential Hypertension, Type 2 DM',
    followUp: '21 Sept',
    drugsCount: 4
  },
  {
    id: 'rx-2',
    rxNo: 'RX-2026-0002',
    date: '15 Sept 2026',
    patientName: 'TEST Rahim Uddin',
    patientCode: 'P0000002',
    age: 35,
    gender: 'Male',
    doctorName: 'Dr. Farhana Islam',
    chamber: 'Consultation Room 2',
    chiefComplaint: 'Mild generalized weakness, joint ache',
    diagnosis: 'Nutritional Deficiency / Iron Deficiency Anaemia',
    followUp: '28 Sept',
    drugsCount: 3
  }
];

export const PrescriptionsView: React.FC = () => {
  const { setCurrentView, showToast } = useApp();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(INITIAL_PRESCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [chamberFilter, setChamberFilter] = useState('ALL');
  const [selectedRx, setSelectedRx] = useState<PrescriptionItem | null>(null);

  const filtered = prescriptions.filter(rx => {
    const matchesSearch =
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.rxNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChamber = chamberFilter === 'ALL' || rx.chamber === chamberFilter;
    return matchesSearch && matchesChamber;
  });

  const handleDelete = (rx: PrescriptionItem) => {
    if (window.confirm(`Are you sure you want to delete prescription record "${rx.rxNo}" for ${rx.patientName}?`)) {
      setPrescriptions(prev => prev.filter(r => r.id !== rx.id));
      showToast(`Prescription ${rx.rxNo} removed`);
    }
  };

  const handleAddToCart = (rx: PrescriptionItem) => {
    showToast(`Transferred ${rx.drugsCount} prescribed medicines to Pharmacy POS counter`);
    setCurrentView('pharmacy-pos');
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
            Prescriptions
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Write and manage patient prescriptions.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCurrentView('new-prescription')}
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
            <Plus size={16} /> New prescription
          </button>
        </div>
      </div>

      {/* ====================================================================
          MAIN CARD WITH SEARCH BAR & TABLE
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
        {/* Top title & search controls */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            All Prescriptions
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            {prescriptions.length} prescription{prescriptions.length > 1 ? 's' : ''}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 320px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Patient name, phone, code or doctor... ( / )"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
              />
            </div>

            <select
              className="form-control"
              value={chamberFilter}
              onChange={e => setChamberFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
            >
              <option value="ALL">All chambers</option>
              <option value="Consultation Room 1">Consultation Room 1</option>
              <option value="Consultation Room 2">Consultation Room 2</option>
            </select>

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

        {/* Data Table Matching SihatSuite Layout */}
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  DATE
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  PATIENT
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  DOCTOR
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  CHAMBER
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  CHIEF COMPLAINT
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  DIAGNOSIS
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  FOLLOW-UP
                </th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', color: '#64748b' }}>
                    No prescriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map(rx => (
                  <tr
                    key={rx.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s ease' }}
                    className="table-row-hover"
                  >
                    {/* DATE */}
                    <td style={{ padding: '12px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {rx.date}
                    </td>

                    {/* PATIENT */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{rx.patientName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                        {rx.patientCode} · {rx.age}y · {rx.gender}
                      </div>
                    </td>

                    {/* DOCTOR */}
                    <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 600 }}>
                      {rx.doctorName}
                    </td>

                    {/* CHAMBER */}
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {rx.chamber}
                    </td>

                    {/* CHIEF COMPLAINT */}
                    <td style={{ padding: '12px 14px', color: '#475569', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rx.chiefComplaint || '—'}
                      </div>
                    </td>

                    {/* DIAGNOSIS */}
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {rx.diagnosis}
                      </span>
                    </td>

                    {/* FOLLOW-UP */}
                    <td style={{ padding: '12px 14px' }}>
                      {rx.followUp ? (
                        <span style={{ fontSize: '11px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          {rx.followUp}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* 4 ROW ACTIONS */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* 1. Print Prescription */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            window.print();
                            showToast(`Printing prescription for ${rx.patientName}`);
                          }}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#059669' }}
                          title="Print prescription"
                        >
                          <Printer size={13} />
                        </button>

                        {/* 2. Pharmacy Cart */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAddToCart(rx)}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#0284c7' }}
                          title="Send to Pharmacy Counter"
                        >
                          <ShoppingCart size={13} />
                        </button>

                        {/* 3. Edit */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCurrentView('new-prescription')}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#334155' }}
                          title="Edit prescription"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* 4. Delete */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelete(rx)}
                          style={{ padding: '5px 7px', borderRadius: '6px', background: '#fff', border: '1px solid #fecdd3', color: '#e11d48' }}
                          title="Delete prescription"
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

        {/* Footer pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          <div>Page 1 of 1 ({filtered.length} prescriptions)</div>
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
    </div>
  );
};
