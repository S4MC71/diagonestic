import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiagnosticTest, Patient, InvoiceItem, PaymentMethod } from '../types';
import {
  Search,
  Plus,
  Trash2,
  UserPlus,
  CheckCircle,
  Printer,
  ChevronDown,
  ArrowLeft,
  X
} from 'lucide-react';

export const NewInvoiceView: React.FC = () => {
  const {
    currentUser,
    patients,
    addPatient,
    tests,
    doctors,
    chambers,
    createInvoice,
    addAppointment,
    setCurrentView,
    showToast
  } = useApp();

  // Mode Switch: Investigation vs Doctor Visit
  const [invoiceMode, setInvoiceMode] = useState<'investigation' | 'doctor-visit'>('investigation');

  // Step 1: Patient Selection & Inline Register
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showAddPatientDrawer, setShowAddPatientDrawer] = useState(false);

  // Doctor Visit Form state
  const [visitDoctorId, setVisitDoctorId] = useState<string>(doctors[0]?.id || '');
  const [visitType, setVisitType] = useState<'new' | 'followup' | 'report'>('new');
  const [visitFee, setVisitFee] = useState<number>(1000);
  const [visitComplaint, setVisitComplaint] = useState('');

  // Add Patient Form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientWhatsApp, setNewPatientWhatsApp] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<number>(30);
  const [newPatientAgeUnit, setNewPatientAgeUnit] = useState<'yrs' | 'months' | 'days'>('yrs');
  const [newPatientGender, setNewPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newPatientBlood, setNewPatientBlood] = useState<any>('B+');
  const [newPatientAddress, setNewPatientAddress] = useState('');

  // Step 2: Tests & Line items
  const [testSearch, setTestSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Step 3: Discount & Payment
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paidNow, setPaidNow] = useState<number>(0);
  const [userEditedPaidNow, setUserEditedPaidNow] = useState(false);

  // Calculations
  const grossTotal =
    invoiceMode === 'doctor-visit'
      ? visitFee
      : selectedItems.reduce((sum, item) => sum + item.finalPrice, 0);

  const discountAmount =
    discountType === 'percentage'
      ? Math.round((grossTotal * (discountValue || 0)) / 100)
      : Math.min(grossTotal, discountValue || 0);

  const netTotal = Math.max(0, grossTotal - discountAmount);
  const dueAmount = Math.max(0, netTotal - (paidNow || 0));

  const paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' =
    paidNow >= netTotal && netTotal > 0
      ? 'PAID'
      : paidNow > 0
      ? 'PARTIAL'
      : 'UNPAID';

  // Handle Add New Patient
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      alert('Please provide patient name and phone number');
      return;
    }
    const created = addPatient({
      name: newPatientName,
      phone: newPatientPhone,
      whatsApp: newPatientWhatsApp || newPatientPhone,
      age: newPatientAge,
      ageUnit: newPatientAgeUnit,
      gender: newPatientGender,
      bloodGroup: newPatientBlood,
      address: newPatientAddress
    });
    setSelectedPatient(created);
    setShowAddPatientDrawer(false);
    setPatientSearch('');
  };

  // Filtered Patients for dropdown
  const filteredPatients = patientSearch.trim()
    ? patients.filter(
        p =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.phone.includes(patientSearch) ||
          p.code.toLowerCase().includes(patientSearch.toLowerCase())
      )
    : [];

  // Filtered Tests for dropdown
  const filteredTests = testSearch.trim()
    ? tests.filter(
        t =>
          t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
          t.category.toLowerCase().includes(testSearch.toLowerCase()) ||
          t.code.toLowerCase().includes(testSearch.toLowerCase())
      )
    : [];

  // Add Test to Line items
  const handleAddTest = (test: DiagnosticTest) => {
    if (selectedItems.some(item => item.testId === test.id)) {
      showToast(`${test.name} is already in the invoice`);
      return;
    }
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${test.id}`,
      testId: test.id,
      testName: test.name,
      category: test.category,
      vendorType: test.vendorType,
      price: test.price,
      discountType: 'fixed',
      discountValue: 0,
      finalPrice: test.price,
      sampleStatus: 'Pending'
    };
    const newItems = [...selectedItems, newItem];
    setSelectedItems(newItems);
    setTestSearch('');

    // Auto-update Paid Now if user hasn't explicitly customized it
    if (!userEditedPaidNow) {
      const newGross = newItems.reduce((s, i) => s + i.finalPrice, 0);
      const newNet = Math.max(0, newGross - discountAmount);
      setPaidNow(newNet);
    }
  };

  // Remove Test
  const handleRemoveItem = (id: string) => {
    const updated = selectedItems.filter(i => i.id !== id);
    setSelectedItems(updated);
    if (!userEditedPaidNow) {
      const newGross = updated.reduce((s, i) => s + i.finalPrice, 0);
      setPaidNow(newGross);
    }
  };

  // Create & Submit Invoice
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select or register a patient first!');
      return;
    }

    if (invoiceMode === 'doctor-visit') {
      const doc = doctors.find(d => d.id === visitDoctorId) || doctors[0];
      const selectedChamber = chambers.find(c => c.doctorId === doc.id) || chambers[0];
      const consultationItem: InvoiceItem = {
        id: `item-${Date.now()}`,
        testId: `doc-${doc.id}`,
        testName: `Doctor Visit: ${doc.name} (${visitType === 'new' ? 'New Patient' : visitType === 'followup' ? 'Follow-up' : 'Report Review'})`,
        category: 'Consultation',
        price: visitFee,
        discountType,
        discountValue,
        finalPrice: netTotal,
        sampleStatus: 'Not Required'
      };

      createInvoice({
        patientId: selectedPatient.id,
        patientCode: selectedPatient.code,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        type: 'Doctor Visit',
        items: [consultationItem],
        referralDoctorId: doc.id,
        referralDoctorName: doc.name,
        referralCommissionAmount: 0,
        grossTotal: visitFee,
        discountType,
        discountValue,
        discountAmount,
        netTotal,
        paidAmount: paidNow || netTotal,
        dueAmount,
        paymentMethod,
        paymentStatus: (paidNow || netTotal) >= netTotal ? 'PAID' : 'PARTIAL',
        createdBy: currentUser?.username || 'lifecare_admin'
      });

      addAppointment({
        doctorId: doc.id,
        doctorName: doc.name,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        date: new Date().toISOString().split('T')[0],
        timeSlot: doc.visitingTime || selectedChamber?.startTime || '06:00 PM',
        chamberRoom: doc.chamberRoom || (selectedChamber ? `Room #${selectedChamber.roomNo}` : 'Room #101'),
        fee: visitFee,
        paymentStatus: (paidNow || netTotal) >= netTotal ? 'Paid' : 'Unpaid',
        status: 'Waiting'
      });

      showToast(`Issued Doctor Consultation serial for ${selectedPatient.name}`);
      setCurrentView('invoices');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please add at least one investigation test to the invoice!');
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctorId);
    let referralCommission = 0;
    if (doctor) {
      referralCommission =
        doctor.commissionType === 'percentage'
          ? Math.round((netTotal * doctor.commissionValue) / 100)
          : doctor.commissionValue * selectedItems.length;
    }

    createInvoice({
      patientId: selectedPatient.id,
      patientCode: selectedPatient.code,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      type: 'Investigation',
      items: selectedItems,
      referralDoctorId: doctor?.id,
      referralDoctorName: doctor?.name,
      referralCommissionAmount: referralCommission,
      grossTotal,
      discountType,
      discountValue,
      discountAmount,
      netTotal,
      paidAmount: paidNow,
      dueAmount,
      paymentMethod,
      paymentStatus,
      createdBy: currentUser?.username || 'lifecare_admin'
    });

    // Navigate to invoices list
    setCurrentView('invoices');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="icon-btn" onClick={() => setCurrentView('invoices')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">New Invoice</h1>
            <p className="page-subtitle">
              {invoiceMode === 'doctor-visit'
                ? 'Doctor Consultation Serial & Visit Fee Collection'
                : 'Investigation Billing & Thermal Receipt Generator'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
          <button
            type="button"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: invoiceMode === 'investigation' ? '#059669' : 'transparent',
              color: invoiceMode === 'investigation' ? '#ffffff' : '#64748b'
            }}
            onClick={() => {
              setInvoiceMode('investigation');
              setPaidNow(0);
            }}
          >
            Investigation
          </button>
          <button
            type="button"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: invoiceMode === 'doctor-visit' ? '#059669' : 'transparent',
              color: invoiceMode === 'doctor-visit' ? '#ffffff' : '#64748b'
            }}
            onClick={() => {
              setInvoiceMode('doctor-visit');
              setPaidNow(visitFee);
            }}
          >
            Doctor Visit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* CARD 1: PATIENT */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '14px' }}>
            1 · Patient Details
          </h3>

          {!selectedPatient ? (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="table-search-input" style={{ flex: 1 }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by name, code (PAT-xxxx), or mobile number…"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />
                  {patientSearch && (
                    <button type="button" onClick={() => setPatientSearch('')}><X size={14} /></button>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddPatientDrawer(true)}
                  style={{ color: '#059669', borderColor: '#059669' }}
                >
                  <UserPlus size={16} /> + Add new patient
                </button>
              </div>

              {/* Patient Autocomplete Dropdown */}
              {filteredPatients.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    left: 0,
                    right: '180px',
                    background: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 50
                  }}
                >
                  {filteredPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientSearch('');
                      }}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--slate-100)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <strong>{p.name}</strong> ({p.code}) — {p.age} {p.ageUnit}, {p.gender}
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Phone: {p.phone} | {p.address}</div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Select →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Selected Patient Banner */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <CheckCircle size={22} color="#16a34a" />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#166534' }}>
                    {selectedPatient.name}{' '}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>
                      ({selectedPatient.code})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#374151', marginTop: '2px' }}>
                    Age: {selectedPatient.age} {selectedPatient.ageUnit} | Gender: {selectedPatient.gender} | Mobile: <strong>{selectedPatient.phone}</strong> | Blood: {selectedPatient.bloodGroup || 'N/A'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedPatient(null)}
              >
                Change Patient
              </button>
            </div>
          )}
        </div>

        {/* CARD 2: DYNAMIC BASED ON MODE */}
        {invoiceMode === 'doctor-visit' ? (
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '14px' }}>
              2 · Doctor & Consultation Chamber
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Specialist Consultant *</label>
                <select
                  className="form-control"
                  value={visitDoctorId}
                  onChange={e => {
                    const docId = e.target.value;
                    setVisitDoctorId(docId);
                    const d = doctors.find(doc => doc.id === docId);
                    if (d) {
                      const f =
                        visitType === 'new'
                          ? d.consultationFee || 1000
                          : visitType === 'followup'
                          ? 500
                          : 0;
                      setVisitFee(f);
                      setPaidNow(f);
                    }
                  }}
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty} ({d.degrees}) · {d.hospital}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consultation Visit Type Chips */}
              <div>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>
                  Consultation Visit Type
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { type: 'new', label: 'New Patient Consultation', fee: 1000 },
                    { type: 'followup', label: 'Follow-up Visit (within 14 days)', fee: 500 },
                    { type: 'report', label: 'Report Review', fee: 0 }
                  ].map(v => (
                    <button
                      key={v.type}
                      type="button"
                      onClick={() => {
                        setVisitType(v.type as any);
                        setVisitFee(v.fee);
                        setPaidNow(v.fee);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: visitType === v.type ? '2px solid #059669' : '1px solid #cbd5e1',
                        background: visitType === v.type ? '#ecfdf5' : '#ffffff',
                        color: visitType === v.type ? '#059669' : '#334155',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {v.label} (৳{v.fee})
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Consultation Fee (৳)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ fontWeight: 700, fontSize: '14px', color: '#059669' }}
                    value={visitFee}
                    onChange={e => {
                      const f = Number(e.target.value) || 0;
                      setVisitFee(f);
                      setPaidNow(f);
                    }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Chief Complaints / Clinical Notes (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Fever for 3 days, chest discomfort, hypertension"
                    value={visitComplaint}
                    onChange={e => setVisitComplaint(e.target.value)}
                  />
                </div>
              </div>

              {/* Serial & Chamber Info Banner */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Assigned Chamber Room
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                    {doctors.find(d => d.id === visitDoctorId)?.chamberRoom || 'Consultation Suite Room #101'}
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Doctor Sitting: Today, 05:00 PM – 09:00 PM
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned Serial</span>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>
                    #14
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CARD 2: TESTS & INVESTIGATIONS */
          <div className="card">
            <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '14px' }}>
              2 · Tests & Investigations
            </h3>

            <div style={{ position: 'relative', marginBottom: '18px' }}>
              <div className="table-search-input" style={{ width: '100%' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by test name, code (e.g. CBC, RBS, USG, Lipid, Creatinine)…"
                  value={testSearch}
                  onChange={e => setTestSearch(e.target.value)}
                />
                {testSearch && (
                  <button type="button" onClick={() => setTestSearch('')}><X size={14} /></button>
                )}
              </div>

              {/* Test Autocomplete Dropdown */}
              {filteredTests.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-xl)',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    zIndex: 60
                  }}
                >
                  {filteredTests.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleAddTest(t)}
                      style={{
                        padding: '10px 18px',
                        borderBottom: '1px solid var(--slate-100)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <strong>{t.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Category: {t.category} | Sample: {t.sampleType}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span className={`badge ${t.vendorType === 'In-house' ? 'badge-inhouse' : 'badge-sendout'}`}>
                          {t.vendorType}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#059669' }}>৳{t.price}</strong>
                        <span style={{ color: '#059669', fontWeight: 600 }}>+ Add</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Line Items Table */}
            {selectedItems.length > 0 ? (
              <div style={{ border: '1px solid var(--slate-200)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Investigation Test</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Price (৳)</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td><strong>{item.testName}</strong></td>
                        <td>{item.category}</td>
                        <td>
                          <span className={`badge ${item.vendorType === 'In-house' ? 'badge-inhouse' : 'badge-sendout'}`}>
                            {item.vendorType}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{item.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--slate-200)',
                  borderRadius: '12px',
                  padding: '28px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '13px',
                  marginBottom: '20px'
                }}
              >
                Start typing above to search and add tests to this bill.
              </div>
            )}

            {/* Referral Agent / Doctor Dropdown */}
            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '16px' }}>
              <label className="form-label">Referred By (Doctor / Agent) — Optional</label>
              <select
                className="form-control"
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
              >
                <option value="">Self / General Walk-in (No referral)</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.commissionType === 'percentage' ? `${d.commissionValue}%` : `৳${d.commissionValue}/test`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* CARD 3: DISCOUNT & PAYMENT */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '16px' }}>
            3 · Discount & Payment Settlement
          </h3>

          <div className="invoice-settlement-grid">
            {/* Left Controls */}
            <div>
              {/* Discount Selector */}
              <div className="form-group">
                <label className="form-label">Invoice-Level Discount</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-control"
                    style={{ width: '130px' }}
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                  >
                    <option value="fixed">Fixed (৳)</option>
                    <option value="percentage">Percent (%)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0.00"
                    value={discountValue || ''}
                    onChange={e => setDiscountValue(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {(['Cash', 'Mobile Banking', 'Card', 'Bank Transfer'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: paymentMethod === method ? '2px solid #059669' : '1px solid var(--slate-200)',
                        background: paymentMethod === method ? '#ecfdf5' : '#ffffff',
                        color: paymentMethod === method ? '#059669' : '#475569',
                        fontWeight: 600,
                        fontSize: '12px',
                        transition: 'all 0.15s'
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Calculation Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--slate-200)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Gross Total:</span>
                <span>৳{grossTotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669' }}>
                  <span>Discount:</span>
                  <span>-৳{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#0f172a',
                  borderTop: '1px solid var(--slate-200)',
                  paddingTop: '8px'
                }}
              >
                <span>Net Total:</span>
                <span>৳{netTotal.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: '6px' }}>
                <label className="form-label">Paid Now (৳)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}
                  value={paidNow}
                  onChange={e => {
                    setUserEditedPaidNow(true);
                    setPaidNow(Number(e.target.value) || 0);
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginTop: '4px',
                  color: dueAmount > 0 ? '#dc2626' : '#16a34a'
                }}
              >
                <span>Due Amount:</span>
                <span>৳{dueAmount.toFixed(2)}</span>
              </div>

              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <span className={`badge ${paymentStatus === 'PAID' ? 'badge-paid' : 'badge-due'}`}>
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Submit & Print Button */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '15px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #10b981)'
              }}
            >
              <Printer size={18} /> Create Invoice & Open Print Preview
            </button>
          </div>
        </div>
      </form>

      {/* Inline Add Patient Modal / Drawer */}
      {showAddPatientDrawer && (
        <div className="modal-backdrop" onClick={() => setShowAddPatientDrawer(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Patient</h3>
              <button className="icon-btn" onClick={() => setShowAddPatientDrawer(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Md. Tariqul Islam"
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="017xxxxxxxx"
                      value={newPatientPhone}
                      onChange={e => setNewPatientPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="017xxxxxxxx"
                      value={newPatientWhatsApp}
                      onChange={e => setNewPatientWhatsApp(e.target.value)}
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
                        value={newPatientAge}
                        onChange={e => setNewPatientAge(Number(e.target.value) || 0)}
                        required
                      />
                      <select
                        className="form-control"
                        style={{ width: '90px' }}
                        value={newPatientAgeUnit}
                        onChange={e => setNewPatientAgeUnit(e.target.value as any)}
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
                      value={newPatientGender}
                      onChange={e => setNewPatientGender(e.target.value as any)}
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
                      value={newPatientBlood}
                      onChange={e => setNewPatientBlood(e.target.value)}
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
                    placeholder="Village / Thana / District"
                    value={newPatientAddress}
                    onChange={e => setNewPatientAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddPatientDrawer(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Patient & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
