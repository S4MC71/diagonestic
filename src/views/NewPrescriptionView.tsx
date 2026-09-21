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
  FileText,
  Search,
  Calendar,
  Clock,
  User,
  Activity,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  Stethoscope,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ExpandableSection {
  id: string;
  title: string;
  count: number;
}

export const NewPrescriptionView: React.FC = () => {
  const { tenantSettings, doctors, chambers, patients, tests, setCurrentView, showToast, addPatient } = useApp();

  // Top Selectors
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedChamberId, setSelectedChamberId] = useState(chambers[0]?.id || '');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Add Patient Modal State
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPtName, setNewPtName] = useState('');
  const [newPtPhone, setNewPtPhone] = useState('');
  const [newPtAge, setNewPtAge] = useState('30');
  const [newPtGender, setNewPtGender] = useState<'Male' | 'Female'>('Male');

  // Clinical Details & Vitals Accordion State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    complaints: true,
    vitals: true,
    examination: false,
    pastHistory: false,
    drugHistory: false,
    investigations: true,
    diagnosis: true,
    diffDiagnosis: false,
    treatmentPlan: false,
    operationNotes: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Vitals
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('76');
  const [temp, setTemp] = useState('98.4');
  const [weight, setWeight] = useState('65');
  const [spo2, setSpo2] = useState('99');

  // Complaints
  const [complaintInput, setComplaintInput] = useState('');
  const [complaints, setComplaints] = useState<string[]>([
    'Fever with chills for 3 days',
    'Dry persistent cough',
    'Generalized body ache & weakness'
  ]);

  // On Examination
  const [examInput, setExamInput] = useState('');
  const [examinations, setExaminations] = useState<string[]>([
    'Anaemia: Mild',
    'Jaundice: Absent',
    'Chest: Bilateral vesicular breath sounds'
  ]);

  // Past History
  const [pastHistoryInput, setPastHistoryInput] = useState('');
  const [pastHistory, setPastHistory] = useState<string[]>([
    'Hypertension for 5 years on regular medication',
    'No known drug allergy'
  ]);

  // Drug History
  const [drugHistoryInput, setDrugHistoryInput] = useState('');
  const [drugHistory, setDrugHistory] = useState<string[]>([
    'Tab. Amlodipine 5mg (1+0+0)'
  ]);

  // Advised Investigations
  const [testInput, setTestInput] = useState('');
  const [advisedTests, setAdvisedTests] = useState<string[]>([
    'Complete Blood Count (CBC) with ESR',
    'Digital X-Ray Chest P/A View',
    'Serum Creatinine'
  ]);

  // Diagnosis
  const [diagnosis, setDiagnosis] = useState('Acute Upper Respiratory Tract Infection (URTI) with Essential Hypertension');

  // Differential Diagnosis
  const [diffDiagnosisInput, setDiffDiagnosisInput] = useState('');
  const [diffDiagnoses, setDiffDiagnoses] = useState<string[]>([
    'Viral Bronchitis',
    'Early Lobar Pneumonia'
  ]);

  // Treatment Plan & Operation Notes
  const [treatmentPlan, setTreatmentPlan] = useState('Supportive hydration, empirical oral antibiotics and symptomatic relief.');
  const [operationNotes, setOperationNotes] = useState('');

  // Master Drug Directory Search for Autocomplete
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [isDrugDropdownOpen, setIsDrugDropdownOpen] = useState(false);

  const MASTER_DRUG_DATABASE = [
    { brand: 'Napa', form: 'Tab', strength: '500mg', generic: 'Paracetamol', inStock: true },
    { brand: 'Napa Extra', form: 'Tab', strength: '500mg+65mg', generic: 'Paracetamol + Caffeine', inStock: true },
    { brand: 'Seclo', form: 'Cap', strength: '20mg', generic: 'Omeprazole', inStock: true },
    { brand: 'Ciprocin', form: 'Tab', strength: '500mg', generic: 'Ciprofloxacin', inStock: true },
    { brand: 'Monas', form: 'Tab', strength: '10mg', generic: 'Montelukast Sodium', inStock: true },
    { brand: 'Fexo', form: 'Tab', strength: '120mg', generic: 'Fexofenadine HCl', inStock: true },
    { brand: 'Azithrocin', form: 'Tab', strength: '500mg', generic: 'Azithromycin', inStock: false },
    { brand: 'Torax', form: 'Tab', strength: '10mg', generic: 'Ketorolac Tromethamine', inStock: true },
    { brand: 'Almex', form: 'Susp', strength: '400mg/5ml', generic: 'Albendazole', inStock: false },
    { brand: 'Panum', form: 'Tab', strength: '40mg', generic: 'Pantoprazole', inStock: true }
  ];

  // Current Prescribed Drugs List
  const [drugs, setDrugs] = useState<PrescriptionDrug[]>([
    {
      id: 'd-1',
      brandName: 'Napa Extra',
      genericName: 'Paracetamol + Caffeine',
      form: 'Tab',
      strength: '500mg+65mg',
      dose: '1+0+1',
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
    },
    {
      id: 'd-3',
      brandName: 'Monas',
      genericName: 'Montelukast Sodium',
      form: 'Tab',
      strength: '10mg',
      dose: '0+0+1',
      duration: '14 days',
      instructions: 'At night'
    }
  ]);

  // Drug entry inputs
  const [activeForm, setActiveForm] = useState('Tab');
  const [activeBrand, setActiveBrand] = useState('');
  const [activeGeneric, setActiveGeneric] = useState('');
  const [activeStrength, setActiveStrength] = useState('');
  const [activeDose, setActiveDose] = useState('1+0+1');
  const [activeDuration, setActiveDuration] = useState('7 days');
  const [activeInstruction, setActiveInstruction] = useState('After meal');

  // Advice & Next Follow-up
  const [adviceText, setAdviceText] = useState('Drink plenty of boiled warm water. Maintain light diet. Avoid smoking and cold environment. Complete the full antibiotic course.');
  const [followUpDays, setFollowUpDays] = useState('7');
  const [followUpUnit, setFollowUpUnit] = useState<'days' | 'weeks' | 'months'>('days');

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0] || {
    name: 'Prof. Dr. M. A. Rahman',
    degrees: 'MBBS, FCPS (Medicine), MD (Cardiology)',
    specialty: 'Medicine & Cardiology Specialist',
    hospital: 'Dhaka Medical College & Hospital',
    bmdcReg: 'BMDC Reg: A-28491'
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || {
    name: 'Md. Rafiqul Islam',
    code: 'P0000001',
    age: 48,
    gender: 'Male',
    phone: '01712-345678'
  };

  // Autocomplete filter
  const filteredCatalogDrugs = MASTER_DRUG_DATABASE.filter(d =>
    d.brand.toLowerCase().includes(drugSearchQuery.toLowerCase()) ||
    d.generic.toLowerCase().includes(drugSearchQuery.toLowerCase())
  );

  const handleSelectDrugFromCatalog = (drug: typeof MASTER_DRUG_DATABASE[0]) => {
    setActiveBrand(drug.brand);
    setActiveGeneric(drug.generic);
    setActiveForm(drug.form);
    setActiveStrength(drug.strength);
    setDrugSearchQuery(drug.brand);
    setIsDrugDropdownOpen(false);
  };

  const handleAddDrugToRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrand.trim()) {
      showToast('Please specify a medicine name');
      return;
    }
    const newDrug: PrescriptionDrug = {
      id: `rx-item-${Date.now()}`,
      brandName: activeBrand.trim(),
      genericName: activeGeneric.trim() || '—',
      form: activeForm,
      strength: activeStrength,
      dose: activeDose,
      duration: activeDuration,
      instructions: activeInstruction
    };
    setDrugs(prev => [...prev, newDrug]);
    setActiveBrand('');
    setActiveGeneric('');
    setActiveStrength('');
    setDrugSearchQuery('');
    showToast(`Added ${newDrug.brandName} to prescription`);
  };

  const handleRemoveDrug = (id: string) => {
    setDrugs(prev => prev.filter(d => d.id !== id));
  };

  // Add items to arrays
  const handleAddComplaint = () => {
    if (!complaintInput.trim()) return;
    setComplaints(prev => [...prev, complaintInput.trim()]);
    setComplaintInput('');
  };

  const handleAddExam = () => {
    if (!examInput.trim()) return;
    setExaminations(prev => [...prev, examInput.trim()]);
    setExamInput('');
  };

  const handleAddPastHistory = () => {
    if (!pastHistoryInput.trim()) return;
    setPastHistory(prev => [...prev, pastHistoryInput.trim()]);
    setPastHistoryInput('');
  };

  const handleAddDrugHistory = () => {
    if (!drugHistoryInput.trim()) return;
    setDrugHistory(prev => [...prev, drugHistoryInput.trim()]);
    setDrugHistoryInput('');
  };

  const handleAddAdvisedTest = () => {
    if (!testInput.trim()) return;
    setAdvisedTests(prev => [...prev, testInput.trim()]);
    setTestInput('');
  };

  const handleAddDiffDiagnosis = () => {
    if (!diffDiagnosisInput.trim()) return;
    setDiffDiagnoses(prev => [...prev, diffDiagnosisInput.trim()]);
    setDiffDiagnosisInput('');
  };

  // Add Patient Modal Submit
  const handleSaveNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtName.trim() || !newPtPhone.trim()) {
      alert('Please fill in Name and Phone number');
      return;
    }
    const created = addPatient({
      name: newPtName,
      phone: newPtPhone,
      age: parseInt(newPtAge) || 30,
      gender: newPtGender,
      bloodGroup: 'O+',
      address: 'Jhalakathi'
    });
    setSelectedPatientId(created.id);
    setShowAddPatientModal(false);
    setNewPtName('');
    setNewPtPhone('');
    showToast(`Patient ${created.name} added & selected!`);
  };

  const handleSaveAndPrint = () => {
    window.print();
    showToast('Prescription saved & sent to printer!');
  };

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="icon-btn" onClick={() => setCurrentView('prescriptions')} title="Back to Prescriptions">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>New Prescription</h1>
            <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Electronic Medical Record, Clinical Examination & Digital Rx Generation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setCurrentView('prescriptions')}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveAndPrint}>
            <Printer size={16} /> Create & Print
          </button>
        </div>
      </div>

      {/* ====================================================================
          TOP METADATA BAR: Patient, Doctor, Chamber, Date, Template
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          {/* Patient Select + Add new patient */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '12px' }}>
                Patient *
              </label>
              <button
                type="button"
                onClick={() => setShowAddPatientModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                + Add new patient
              </button>
            </div>
            <select
              className="form-control"
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.gender}, {p.age}y
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Select */}
          <div>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
              Doctor / Consultant *
            </label>
            <select
              className="form-control"
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Chamber Select */}
          <div>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
              Chamber *
            </label>
            <select
              className="form-control"
              value={selectedChamberId}
              onChange={e => setSelectedChamberId(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              {chambers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.roomName} — Floor {c.floor}
                </option>
              ))}
            </select>
          </div>

          {/* Visit Date */}
          <div>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
              Visit Date
            </label>
            <input
              type="date"
              className="form-control"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              style={{ fontSize: '13px' }}
            >
            </input>
          </div>

          {/* Templates Dropdown & Save as Template */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '12px' }}>
                Load Template
              </label>
              <select
                className="form-control"
                value={selectedTemplate}
                onChange={e => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value === 'fever') {
                    setComplaints(['Fever 102°F for 3 days', 'Severe headache', 'Body aches']);
                    setDiagnosis('Acute Viral Pyrexia');
                    showToast('Loaded Fever & Body Ache template');
                  } else if (e.target.value === 'gastric') {
                    setComplaints(['Epigastric burning pain', 'Acid reflux', 'Nausea after meal']);
                    setDiagnosis('Gastroesophageal Reflux Disease (GERD) / Dyspepsia');
                    showToast('Loaded Dyspepsia template');
                  }
                }}
                style={{ fontSize: '13px' }}
              >
                <option value="">-- Choose Template --</option>
                <option value="fever">Fever & Acute URTI</option>
                <option value="gastric">Dyspepsia / Peptic Ulcer</option>
                <option value="hypertension">Hypertension Regular Follow-up</option>
                <option value="diabetic">Diabetes Mellitus Glycemic Review</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ opacity: 0 }}>Save</label>
              <button
                type="button"
                className="btn btn-secondary"
                title="Save current layout as template"
                onClick={() => showToast('Current prescription saved as reusable template!')}
                style={{ whiteSpace: 'nowrap', fontSize: '12px', height: '38px' }}
              >
                <Save size={14} /> Save Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TWO-PANEL WORKSPACE: LEFT (CLINICAL DETAILS & VITALS) | RIGHT (RX & ADVICE)
          ==================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '18px', alignItems: 'start' }}>
        {/* ==================================================================
            LEFT PANEL: 10 CLINICAL ACCORDION SECTIONS
            ================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Section 1: Complaints */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('complaints')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Complaints
                </span>
                <span className="badge" style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', padding: '1px 6px' }}>
                  {complaints.length}
                </span>
              </div>
              {openSections.complaints ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.complaints && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {complaints.map((c, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>• {c}</span>
                      <button
                        onClick={() => setComplaints(complaints.filter((_, idx) => idx !== i))}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="+ Add complaint"
                    value={complaintInput}
                    onChange={e => setComplaintInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddComplaint(); } }}
                    style={{ fontSize: '12px' }}
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddComplaint}>
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Vitals */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('vitals')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Vitals
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>BP, Pulse, Temp, SpO₂</span>
              </div>
              {openSections.vitals ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.vitals && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>BP (mmHg)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={bp}
                      onChange={e => setBp(e.target.value)}
                      placeholder="120/80"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Pulse (bpm)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={pulse}
                      onChange={e => setPulse(e.target.value)}
                      placeholder="76"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Temp (°F)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={temp}
                      onChange={e => setTemp(e.target.value)}
                      placeholder="98.4"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Weight (kg)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="65"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SpO₂ (%)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={spo2}
                      onChange={e => setSpo2(e.target.value)}
                      placeholder="99"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: On Examination */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('examination')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  On Examination
                </span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '1px 6px' }}>
                  {examinations.length}
                </span>
              </div>
              {openSections.examination ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.examination && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {examinations.map((ex, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>• {ex}</span>
                      <button
                        onClick={() => setExaminations(examinations.filter((_, idx) => idx !== i))}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="+ Physical findings"
                    value={examInput}
                    onChange={e => setExamInput(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddExam}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Past History */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('pastHistory')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Past History
                </span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '1px 6px' }}>
                  {pastHistory.length}
                </span>
              </div>
              {openSections.pastHistory ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.pastHistory && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {pastHistory.map((ph, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>• {ph}</span>
                      <button
                        onClick={() => setPastHistory(pastHistory.filter((_, idx) => idx !== i))}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="+ Past illness / surgery"
                    value={pastHistoryInput}
                    onChange={e => setPastHistoryInput(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddPastHistory}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Drug History */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('drugHistory')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Drug History
                </span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '1px 6px' }}>
                  {drugHistory.length}
                </span>
              </div>
              {openSections.drugHistory ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.drugHistory && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {drugHistory.map((dh, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>• {dh}</span>
                      <button
                        onClick={() => setDrugHistory(drugHistory.filter((_, idx) => idx !== i))}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="+ Current medications"
                    value={drugHistoryInput}
                    onChange={e => setDrugHistoryInput(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddDrugHistory}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Investigations */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('investigations')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Advised Tests
                </span>
                <span className="badge" style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', padding: '1px 6px' }}>
                  {advisedTests.length}
                </span>
              </div>
              {openSections.investigations ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.investigations && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#059669', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {advisedTests.map((t, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{t}</span>
                      <button
                        onClick={() => setAdvisedTests(advisedTests.filter((_, idx) => idx !== i))}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="+ Add lab / imaging test"
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddAdvisedTest}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Diagnosis */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('diagnosis')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Diagnosis
              </span>
              {openSections.diagnosis ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.diagnosis && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <textarea
                  className="form-control"
                  rows={2}
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}
                />
              </div>
            )}
          </div>

          {/* Section 8: Differential Diagnosis */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('diffDiagnosis')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  Differential Diagnosis
                </span>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '1px 6px' }}>
                  {diffDiagnoses.length}
                </span>
              </div>
              {openSections.diffDiagnosis ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.diffDiagnosis && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {diffDiagnoses.map((d, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>• {d}</span>
                      <button
                        onClick={() => setDiffDiagnoses(diffDiagnoses.filter((_, idx) => idx !== i))}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="+ Add D/D"
                    value={diffDiagnosisInput}
                    onChange={e => setDiffDiagnosisInput(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAddDiffDiagnosis}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Section 9: Treatment Plan */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('treatmentPlan')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Treatment Plan
              </span>
              {openSections.treatmentPlan ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.treatmentPlan && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <textarea
                  className="form-control"
                  rows={2}
                  value={treatmentPlan}
                  onChange={e => setTreatmentPlan(e.target.value)}
                  placeholder="Outline management & therapy..."
                  style={{ fontSize: '12px' }}
                />
              </div>
            )}
          </div>

          {/* Section 10: Operation Notes */}
          <div className="card" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div
              onClick={() => toggleSection('operationNotes')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                Operation Notes
              </span>
              {openSections.operationNotes ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </div>

            {openSections.operationNotes && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <textarea
                  className="form-control"
                  rows={2}
                  value={operationNotes}
                  onChange={e => setOperationNotes(e.target.value)}
                  placeholder="Surgical findings, incision, sutures, post-op orders..."
                  style={{ fontSize: '12px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            RIGHT PANEL: PRESCRIPTION RX CANVAS & MEDICINE CATALOG SEARCH
            ================================================================== */}
        <div
          className="card"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '680px'
          }}
        >
          <div>
            {/* Rx Heading with + Rx Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, fontStyle: 'italic', fontFamily: 'serif', color: '#059669', lineHeight: 1 }}>
                  ℞
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Medication Order (Rx)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {drugs.length} item(s) prescribed
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  const input = document.getElementById('drug-search-box');
                  if (input) input.focus();
                }}
              >
                <Plus size={14} /> + Rx
              </button>
            </div>

            {/* LIVE AUTOCOMPLETE SEARCH INPUT FROM DGDA DRUG DIRECTORY */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    id="drug-search-box"
                    type="text"
                    className="form-control"
                    placeholder="Search medicines by brand or generic name (e.g. Napa, Omeprazole, Monas)..."
                    value={drugSearchQuery}
                    onChange={e => {
                      setDrugSearchQuery(e.target.value);
                      setIsDrugDropdownOpen(true);
                      setActiveBrand(e.target.value);
                    }}
                    onFocus={() => setIsDrugDropdownOpen(true)}
                    style={{ paddingLeft: '36px', fontSize: '13px' }}
                  />
                  {drugSearchQuery && (
                    <button
                      type="button"
                      onClick={() => { setDrugSearchQuery(''); setIsDrugDropdownOpen(false); }}
                      style={{ position: 'absolute', right: '10px', top: '10px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Suggestions */}
              {isDrugDropdownOpen && drugSearchQuery.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}
                >
                  {filteredCatalogDrugs.length === 0 ? (
                    <div style={{ padding: '12px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                      No exact matches in pharmacy catalog. You can still type custom medicine name below.
                    </div>
                  ) : (
                    filteredCatalogDrugs.map((d, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectDrugFromCatalog(d)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          background: '#ffffff'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                      >
                        <div>
                          <strong style={{ color: '#059669', fontSize: '13px' }}>
                            {d.brand}
                          </strong>{' '}
                          <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                            {d.form} {d.strength}
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Generic: {d.generic}
                          </div>
                        </div>

                        <div>
                          {d.inStock ? (
                            <span className="badge badge-paid" style={{ fontSize: '10px' }}>In Stock</span>
                          ) : (
                            <span className="badge" style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '10px' }}>
                              not carried
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Medicine Config Add Row */}
            <form
              onSubmit={handleAddDrugToRx}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: '80px 1.5fr 1fr 1fr 1.2fr 90px',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Form</label>
                <select
                  value={activeForm}
                  onChange={e => setActiveForm(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ fontSize: '12px', padding: '4px 6px' }}
                >
                  <option>Tab</option>
                  <option>Cap</option>
                  <option>Syr</option>
                  <option>Inj</option>
                  <option>Oint</option>
                  <option>Drop</option>
                  <option>Inh</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Napa Extra"
                  className="form-control form-control-sm"
                  value={activeBrand}
                  onChange={e => setActiveBrand(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Dose Schedule</label>
                <select
                  value={activeDose}
                  onChange={e => setActiveDose(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ fontSize: '12px', padding: '4px 6px' }}
                >
                  <option>1+0+1</option>
                  <option>1+1+1</option>
                  <option>1+0+0</option>
                  <option>0+0+1</option>
                  <option>0+1+0</option>
                  <option>1+1+1+1</option>
                  <option>SOS</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Duration</label>
                <select
                  value={activeDuration}
                  onChange={e => setActiveDuration(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ fontSize: '12px', padding: '4px 6px' }}
                >
                  <option>3 days</option>
                  <option>5 days</option>
                  <option>7 days</option>
                  <option>10 days</option>
                  <option>14 days</option>
                  <option>1 month</option>
                  <option>Continue</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Instruction</label>
                <select
                  value={activeInstruction}
                  onChange={e => setActiveInstruction(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ fontSize: '12px', padding: '4px 6px' }}
                >
                  <option>After meal (খাবারের পর)</option>
                  <option>Before meal (খাবারের আগে)</option>
                  <option>Empty stomach (খালি পেটে)</option>
                  <option>At bedtime (ঘুমানোর আগে)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <button type="submit" className="btn btn-sm btn-primary" style={{ width: '100%', height: '34px', fontSize: '12px' }}>
                  + Add
                </button>
              </div>
            </form>

            {/* Prescribed Medicines List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {drugs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontSize: '13px' }}>
                  No medications added yet. Use the search bar or form above to prescribe medicines.
                </div>
              ) : (
                drugs.map((d, index) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                          {index + 1}. {d.form}. {d.brandName}
                        </span>
                        {d.strength && (
                          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                            ({d.strength})
                          </span>
                        )}
                        {d.genericName && d.genericName !== '—' && (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            — {d.genericName}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, marginTop: '3px', paddingLeft: '18px' }}>
                        <span style={{ color: '#059669' }}>{d.dose}</span> &nbsp;|&nbsp;{' '}
                        <span>{d.duration}</span> &nbsp;|&nbsp;{' '}
                        <span style={{ color: '#64748b', fontWeight: 'normal' }}>{d.instructions}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => handleRemoveDrug(d.id)}
                      title="Remove medicine"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Advice Section */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                Advice & Special Instructions (পরামর্শ)
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={adviceText}
                onChange={e => setAdviceText(e.target.value)}
                placeholder="Enter patient lifestyle advice, diet restrictions, precautionary guidelines..."
                style={{ fontSize: '13px' }}
              />
            </div>

            {/* Next Follow-up Date Selector & Quick Duration Presets */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Next Follow-up Visit:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="number"
                    value={followUpDays}
                    onChange={e => setFollowUpDays(e.target.value)}
                    style={{ width: '60px', padding: '4px 8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                  <select
                    value={followUpUnit}
                    onChange={e => setFollowUpUnit(e.target.value as any)}
                    style={{ padding: '4px 8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              {/* Quick Presets matching SihatSuite (1, 7, 15, 30, 90, 180 days) */}
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Quick Presets:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: '1 Day', days: '1', unit: 'days' },
                    { label: '7 Days', days: '7', unit: 'days' },
                    { label: '15 Days', days: '15', unit: 'days' },
                    { label: '1 Month', days: '1', unit: 'months' },
                    { label: '3 Months', days: '3', unit: 'months' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setFollowUpDays(preset.days);
                        setFollowUpUnit(preset.unit as any);
                      }}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '18px',
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button className="btn btn-secondary" onClick={() => setCurrentView('prescriptions')}>
              Cancel
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  showToast('Prescription draft saved successfully');
                  setCurrentView('prescriptions');
                }}
              >
                <Save size={15} /> Save as Draft
              </button>
              <button className="btn btn-primary" onClick={handleSaveAndPrint}>
                <Printer size={16} /> Create & Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          + ADD NEW PATIENT MODAL
          ==================================================================== */}
      {showAddPatientModal && (
        <div className="modal-backdrop" onClick={() => setShowAddPatientModal(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Patient</h3>
              <button className="icon-btn" onClick={() => setShowAddPatientModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewPatient}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Begum Rokeya"
                    value={newPtName}
                    onChange={e => setNewPtName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="form-control"
                    placeholder="017xxxxxxxx"
                    value={newPtPhone}
                    onChange={e => setNewPtPhone(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Age (Years) *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={newPtAge}
                      onChange={e => setNewPtAge(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select
                      className="form-control"
                      value={newPtGender}
                      onChange={e => setNewPtGender(e.target.value as any)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPatientModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
