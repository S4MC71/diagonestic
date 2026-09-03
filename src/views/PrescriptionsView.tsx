import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Printer, FileText, Calendar, User } from 'lucide-react';

export const PrescriptionsView: React.FC = () => {
  const { setCurrentView, showToast } = useApp();
  const [search, setSearch] = useState('');

  // Sample prescriptions
  const prescriptions = [
    {
      id: 'rx-1',
      rxNo: 'RX-2026-001',
      date: '2026-09-02',
      patientName: 'Md. Rafiqul Islam',
      age: 48,
      gender: 'Male',
      doctorName: 'Prof. Dr. M. A. Rahman',
      diagnosis: 'Essential Hypertension, Type 2 DM',
      drugsCount: 4
    },
    {
      id: 'rx-2',
      rxNo: 'RX-2026-002',
      date: '2026-09-02',
      patientName: 'Begum Rokeya Akter',
      age: 34,
      gender: 'Female',
      doctorName: 'Dr. Nusrat Jahan',
      diagnosis: 'Antenatal Care (2nd Trimester)',
      drugsCount: 3
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">Doctor Consultation History & Digital Rx Archive</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCurrentView('new-prescription')}>
            <Plus size={16} /> New Prescription
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by Rx number, patient or doctor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Rx Number</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Consultant Doctor</th>
              <th>Clinical Diagnosis</th>
              <th>Medicines</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map(rx => (
              <tr key={rx.id}>
                <td><strong style={{ color: '#073f8f' }}>{rx.rxNo}</strong></td>
                <td>{rx.date}</td>
                <td>
                  <strong>{rx.patientName}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{rx.age}Y, {rx.gender}</div>
                </td>
                <td>{rx.doctorName}</td>
                <td>
                  <span style={{ fontSize: '12px', background: '#e0f7f6', color: '#0d7671', padding: '2px 8px', borderRadius: '6px', fontWeight: 500 }}>
                    {rx.diagnosis}
                  </span>
                </td>
                <td>{rx.drugsCount} Drugs Prescribed</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="icon-btn"
                    title="Print Prescription"
                    onClick={() => {
                      window.print();
                      showToast('Opening prescription print layout');
                    }}
                  >
                    <Printer size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
