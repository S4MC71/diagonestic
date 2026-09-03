import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PrescriptionDrug } from '../types';
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  FileText
} from 'lucide-react';

export const NewPrescriptionView: React.FC = () => {
  const { doctors, chambers, patients, tests, setCurrentView, showToast } = useApp();

  // Selected Header Info
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedChamberId, setSelectedChamberId] = useState(chambers[0]?.id || '');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');

  // Vitals
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('76');
  const [temp, setTemp] = useState('98.4');
  const [weight, setWeight] = useState('65');
  const [spo2, setSpo2] = useState('99');

  // Clinical findings
  const [complaintText, setComplaintText] = useState('');
  const [complaints, setComplaints] = useState<string[]>(['Fever for 3 days', 'Dry cough', 'Mild weakness']);
  const [diagnosis, setDiagnosis] = useState('Acute Upper Respiratory Tract Infection (URTI)');
  const [advisedTests, setAdvisedTests] = useState<string[]>(['Complete Blood Count (CBC) with ESR', 'Digital X-Ray Chest P/A View']);
  const [testInput, setTestInput] = useState('');

  // Drugs
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([
    {
      id: 'd-1',
      brandName: 'Napa Extra',
      genericName: 'Paracetamol + Caffeine',
      form: 'Tab',
      strength: '500mg+65mg',
      dose: '1+1+1',
      duration: '5 days',
      instructions: 'After meal'
    },
    {
      id: 'd-2',
      brandName: 'Seclo',
      genericName: 'Omeprazole',
      form: 'Cap',
      strength: '20mg',
      dose: '1+0+1',
      duration: '14 days',
      instructions: 'Before meal'
    }
  ]);

  // Drug entry form
  const [newBrand, setNewBrand] = useState('');
  const [newGeneric, setNewGeneric] = useState('');
  const [newForm, setNewForm] = useState('Tab');
  const [newDose, setNewDose] = useState('1+0+1');
  const [newDuration, setNewDuration] = useState('7 days');
  const [newInstruction, setNewInstruction] = useState('After meal');

  // Advice
  const [adviceText, setAdviceText] = useState('Drink plenty of warm water. Avoid cold food and drinks. Take rest.');
  const [nextVisit, setNextVisit] = useState('After 7 days');

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleAddDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    setDrugs([
      ...drugs,
      {
        id: `d-${Date.now()}`,
        brandName: newBrand,
        genericName: newGeneric || '—',
        form: newForm,
        strength: '',
        dose: newDose,
        duration: newDuration,
        instructions: newInstruction
      }
    ]);
    setNewBrand('');
    setNewGeneric('');
  };

  const handleRemoveDrug = (id: string) => {
    setDrugs(drugs.filter(d => d.id !== id));
  };

  const handleAddComplaint = () => {
    if (!complaintText.trim()) return;
    setComplaints([...complaints, complaintText.trim()]);
    setComplaintText('');
  };

  const handleAddAdvisedTest = () => {
    if (!testInput.trim()) return;
    setAdvisedTests([...advisedTests, testInput.trim()]);
    setTestInput('');
  };

  const handleSaveAndPrint = () => {
    window.print();
    showToast('Prescription saved and printed!');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="icon-btn" onClick={() => setCurrentView('prescriptions')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">New Prescription</h1>
            <p className="page-subtitle">Doctor Consultation, Digital Rx & Vitals Recording</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleSaveAndPrint}>
            <Printer size={16} /> Save & Print Prescription
          </button>
        </div>
      </div>

      {/* Main Prescription Paper Canvas */}
      <div
        className="printable-area"
        style={{
          background: '#ffffff',
          border: '1px solid var(--slate-200)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        {/* Doctor Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #051c40 0%, #073f8f 100%)',
            color: '#ffffff',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b9b3', fontWeight: 'bold' }}>
              CONSULTANT SPECIALIST
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>{selectedDoctor.name}</h2>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>{selectedDoctor.degrees}</div>
            <div style={{ fontSize: '12px', color: '#5de8e2', marginTop: '3px' }}>{selectedDoctor.specialty}</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>{selectedDoctor.hospital}</div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.85 }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>Jhalakathi Diagnostic Center</div>
            <div>Hospital Road, Jhalakathi Sadar</div>
            <div>Chamber: Room 101 | Serial: 01711-234567</div>
          </div>
        </div>

        {/* Patient Demographics Bar */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid var(--slate-200)',
            padding: '12px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}
        >
          <div>
            Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.code})
          </div>
          <div>Age: <strong>{selectedPatient.age} Yrs</strong> | Sex: <strong>{selectedPatient.gender}</strong></div>
          <div>Date: <strong>{new Date().toISOString().split('T')[0]}</strong></div>
          <div>Weight: <strong>{weight} kg</strong> | BP: <strong>{bp} mmHg</strong></div>
        </div>

        {/* 2-Column Clinical Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '520px' }}>
          {/* Left Column: Complaints, Vitals, Findings & Tests */}
          <div style={{ borderRight: '1px solid var(--slate-200)', padding: '20px', background: '#fafbfc' }}>
            {/* Vitals */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                VITALS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                <div>BP: <input type="text" value={bp} onChange={e => setBp(e.target.value)} style={{ width: '60px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                <div>Pulse: <input type="text" value={pulse} onChange={e => setPulse(e.target.value)} style={{ width: '45px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                <div>Temp: <input type="text" value={temp} onChange={e => setTemp(e.target.value)} style={{ width: '45px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></div>
                <div>SpO2: <input type="text" value={spo2} onChange={e => setSpo2(e.target.value)} style={{ width: '45px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />%</div>
              </div>
            </div>

            {/* Chief Complaints */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                CHIEF COMPLAINTS
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#334155', marginBottom: '8px' }}>
                {complaints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="+ Add complaint"
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddComplaint}>+</button>
              </div>
            </div>

            {/* Diagnosis */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                DIAGNOSIS
              </div>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                style={{ width: '100%', padding: '4px 6px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>

            {/* Advised Tests */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                INVESTIGATIONS
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#073f8f', marginBottom: '8px' }}>
                {advisedTests.map((t, i) => <li key={i}><strong>{t}</strong></li>)}
              </ul>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="+ Add test"
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  style={{ width: '100%', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddAdvisedTest}>+</button>
              </div>
            </div>
          </div>

          {/* Right Column: Rx (Medicines) & Advice */}
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'serif', color: '#073f8f' }}>
                  ℞
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Prescribed Medicines</span>
              </div>

              {/* Medicine List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {drugs.map((drug, index) => (
                  <div key={drug.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                        {index + 1}. {drug.form}. {drug.brandName}{' '}
                        <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>
                          ({drug.genericName})
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#073f8f', fontWeight: '600', marginTop: '2px', paddingLeft: '16px' }}>
                        {drug.dose} — {drug.duration} — ({drug.instructions})
                      </div>
                    </div>
                    <button type="button" className="icon-btn" onClick={() => handleRemoveDrug(drug.id)}>
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Add Medicine Input Bar */}
              <form onSubmit={handleAddDrug} style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '10px', alignItems: 'center' }}>
                <select value={newForm} onChange={e => setNewForm(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <option>Tab</option>
                  <option>Cap</option>
                  <option>Syr</option>
                  <option>Inj</option>
                </select>
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Napa, Seclo)"
                  value={newBrand}
                  onChange={e => setNewBrand(e.target.value)}
                  style={{ flex: 1.5, padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  placeholder="Dose (1+0+1)"
                  value={newDose}
                  onChange={e => setNewDose(e.target.value)}
                  style={{ width: '80px', padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  placeholder="Duration (7 days)"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                  style={{ width: '90px', padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <select value={newInstruction} onChange={e => setNewInstruction(e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <option>After meal</option>
                  <option>Before meal</option>
                  <option>Empty stomach</option>
                </select>
                <button type="submit" className="btn btn-sm btn-primary">+ Add Rx</button>
              </form>
            </div>

            {/* Advice & Doctor Signature */}
            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '16px', marginTop: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
                    ADVICE
                  </div>
                  <textarea
                    value={adviceText}
                    onChange={e => setAdviceText(e.target.value)}
                    rows={2}
                    className="form-control"
                    style={{ fontSize: '12px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#073f8f', fontWeight: '600', marginTop: '6px' }}>
                    Next Visit: <input type="text" value={nextVisit} onChange={e => setNextVisit(e.target.value)} style={{ border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px solid #0f172a', height: '40px' }} />
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>
                    {selectedDoctor.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Consultant Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
