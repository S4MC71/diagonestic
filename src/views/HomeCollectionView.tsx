import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  MapPin,
  Globe,
  Phone,
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  X,
  FileText,
  DollarSign,
  Search,
  Calendar,
  Check,
  Building,
  AlertCircle,
  ExternalLink,
  Printer
} from 'lucide-react';

interface HomeBooking {
  id: string;
  bookingNo: string;
  patientName: string;
  phone: string;
  address: string;
  area: string;
  date: string;
  preferredTime: string;
  tests: string[];
  technicianName: string;
  status: 'Pending' | 'Scheduled' | 'In Transit' | 'Collected' | 'Delivered to Lab' | 'Cancelled';
  totalAmount: number;
  paymentStatus: 'Paid' | 'Unpaid';
}

interface ServiceArea {
  id: string;
  name: string;
  district: string;
  coveredAreas: string;
  charge: number;
  minFreeAmount: number;
  capacity: number;
  timeFrom: string;
  timeTo: string;
  active: boolean;
}

export const HomeCollectionView: React.FC = () => {
  const { tenantSettings, showToast, diagnosticTests } = useApp();
  const [activeTab, setActiveTab] = useState<'queue' | 'areas' | 'storefront'>('queue');

  // Bookings queue state
  const [bookings, setBookings] = useState<HomeBooking[]>([
    {
      id: 'b-1',
      bookingNo: 'HC-2026-042',
      patientName: 'Mrs. Salma Begum',
      phone: '01712-445566',
      address: 'House 14, Central College Road',
      area: 'Central Town (0-5 km)',
      date: '2026-09-17',
      preferredTime: '08:30 AM',
      tests: ['Fasting Blood Sugar (FBS)', 'Lipid Profile'],
      technicianName: 'Md. Al-Amin (Phlebotomist)',
      status: 'Scheduled',
      totalAmount: 1100,
      paymentStatus: 'Unpaid'
    },
    {
      id: 'b-2',
      bookingNo: 'HC-2026-043',
      patientName: 'Haji Nurul Haque',
      phone: '01819-112233',
      address: 'Station Road, Sector 4',
      area: 'Metro Perimeter (5-15 km)',
      date: '2026-09-17',
      preferredTime: '09:15 AM',
      tests: ['Serum Creatinine', 'Serum Electrolytes', 'Complete Blood Count (CBC)'],
      technicianName: 'Md. Al-Amin',
      status: 'In Transit',
      totalAmount: 1600,
      paymentStatus: 'Paid'
    },
    {
      id: 'b-3',
      bookingNo: 'HC-2026-044',
      patientName: 'Begum Rehana Parveen',
      phone: '01911-889900',
      address: 'Court Road, Mohila College Gate',
      area: 'Central Town (0-5 km)',
      date: '2026-09-17',
      preferredTime: '10:00 AM',
      tests: ['HbA1c (Glycated Hemoglobin)', 'Urine R/M/E'],
      technicianName: 'Unassigned',
      status: 'Pending',
      totalAmount: 950,
      paymentStatus: 'Unpaid'
    }
  ]);

  // Service Areas state
  const [areas, setAreas] = useState<ServiceArea[]>([
    {
      id: 'a-1',
      name: 'Central Town (0-5 km)',
      district: 'Jhalakathi Sadar',
      coveredAreas: 'College Road, Notun Bazar, Launch Ghat, Court Area',
      charge: 150,
      minFreeAmount: 2000,
      capacity: 15,
      timeFrom: '07:00 AM',
      timeTo: '12:00 PM',
      active: true
    },
    {
      id: 'a-2',
      name: 'Metro Perimeter (5-15 km)',
      district: 'Jhalakathi',
      coveredAreas: 'Gabkhan Bridge, Rajapur Road, Nalchity Moor',
      charge: 300,
      minFreeAmount: 3000,
      capacity: 8,
      timeFrom: '07:30 AM',
      timeTo: '11:00 AM',
      active: true
    },
    {
      id: 'a-3',
      name: 'Outer Suburbs (15-25 km)',
      district: 'Barishal Border',
      coveredAreas: 'Dapdapia, Rupatoli perimeter, Kaukhali ferry',
      charge: 450,
      minFreeAmount: 4500,
      capacity: 5,
      timeFrom: '08:00 AM',
      timeTo: '10:30 AM',
      active: true
    }
  ]);

  // Public Storefront Configuration
  const [storefrontHeadline, setStorefrontHeadline] = useState('Certified Diagnostic Sample Collection at Your Doorstep');
  const [storefrontIntro, setStorefrontIntro] = useState('Our trained professional phlebotomists follow cold-chain WHO protocols to collect blood, urine and specimen samples safely from your home.');
  const [storefrontTests, setStorefrontTests] = useState([
    { id: 't-1', name: 'Complete Blood Count (CBC) with ESR', category: 'Hematology', price: 400, online: true, homeSample: true, fasting: 'No fasting required', instructions: 'Avoid intense physical exercise before draw' },
    { id: 't-2', name: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', price: 150, online: true, homeSample: true, fasting: '8-10 hours overnight fasting', instructions: 'Water is allowed, no tea/coffee' },
    { id: 't-3', name: 'Lipid Profile (Full)', category: 'Biochemistry', price: 950, online: true, homeSample: true, fasting: '10-12 hours strict fasting', instructions: 'Avoid fatty dinner night before' },
    { id: 't-4', name: 'Serum Creatinine', category: 'Biochemistry', price: 350, online: true, homeSample: true, fasting: 'No fasting required', instructions: 'Normal routine' },
    { id: 't-5', name: 'Thyroid Profile (TSH, FT3, FT4)', category: 'Immunology', price: 1400, online: true, homeSample: true, fasting: 'Morning sample preferred', instructions: 'Take thyroid pills after blood collection' },
    { id: 't-6', name: 'Digital X-Ray Chest P/A View', category: 'Radiology', price: 500, online: true, homeSample: false, fasting: 'N/A', instructions: 'Requires physical lab machine visit' }
  ]);

  // Modals state
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showCollectorModal, setShowCollectorModal] = useState(false);
  const [showLabReceiptModal, setShowLabReceiptModal] = useState(false);
  const [showSettlementsModal, setShowSettlementsModal] = useState(false);

  // New Booking Form State
  const [nbPatient, setNbPatient] = useState('');
  const [nbPhone, setNbPhone] = useState('');
  const [nbAddress, setNbAddress] = useState('');
  const [nbArea, setNbArea] = useState('Central Town (0-5 km)');
  const [nbDate, setNbDate] = useState(new Date().toISOString().split('T')[0]);
  const [nbTime, setNbTime] = useState('08:00 AM');
  const [nbSelectedTests, setNbSelectedTests] = useState<string[]>(['Complete Blood Count (CBC) with ESR']);

  // New Service Area Form State
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDistrict, setNewZoneDistrict] = useState('Jhalakathi');
  const [newZoneCovered, setNewZoneCovered] = useState('');
  const [newZoneCharge, setNewZoneCharge] = useState('200');
  const [newZoneFreeAbove, setNewZoneFreeAbove] = useState('2500');
  const [newZoneCapacity, setNewZoneCapacity] = useState('10');
  const [newZoneFrom, setNewZoneFrom] = useState('07:00 AM');
  const [newZoneTo, setNewZoneTo] = useState('11:00 AM');

  // Search in queue
  const [queueSearch, setQueueSearch] = useState('');

  const handleUpdateStatus = (id: string, status: HomeBooking['status']) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    showToast(`Booking ${id} status updated to: ${status}`);
  };

  const handleAddServiceArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    const newArea: ServiceArea = {
      id: `a-${Date.now()}`,
      name: newZoneName,
      district: newZoneDistrict,
      coveredAreas: newZoneCovered,
      charge: Number(newZoneCharge) || 200,
      minFreeAmount: Number(newZoneFreeAbove) || 2500,
      capacity: Number(newZoneCapacity) || 10,
      timeFrom: newZoneFrom,
      timeTo: newZoneTo,
      active: true
    };
    setAreas(prev => [...prev, newArea]);
    setNewZoneName('');
    setNewZoneCovered('');
    showToast(`Service zone "${newArea.name}" added successfully`);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nbPatient.trim() || !nbPhone.trim()) return;
    const created: HomeBooking = {
      id: `b-${Date.now()}`,
      bookingNo: `HC-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientName: nbPatient,
      phone: nbPhone,
      address: nbAddress,
      area: nbArea,
      date: nbDate,
      preferredTime: nbTime,
      tests: nbSelectedTests,
      technicianName: 'Md. Al-Amin',
      status: 'Scheduled',
      totalAmount: 1250,
      paymentStatus: 'Unpaid'
    };
    setBookings(prev => [created, ...prev]);
    setShowNewBookingModal(false);
    setNbPatient('');
    setNbPhone('');
    setNbAddress('');
    showToast(`Home collection booking ${created.bookingNo} created!`);
  };

  const filteredBookings = bookings.filter(b =>
    b.patientName.toLowerCase().includes(queueSearch.toLowerCase()) ||
    b.bookingNo.toLowerCase().includes(queueSearch.toLowerCase()) ||
    b.phone.includes(queueSearch) ||
    b.area.toLowerCase().includes(queueSearch.toLowerCase())
  );

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          TOP PAGE HEADER & 4 TOP ACTION BUTTONS (SIHATSUITE PARITY)
          ==================================================================== */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Home Sample Collection
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Doorstep Specimen Draw, Phlebotomist Field Dispatch, Storefront & Settlements
          </p>
        </div>

        {/* 4 Action Buttons Matching SihatSuite */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowCollectorModal(true)}>
            <UserCheck size={15} /> Collector view
          </button>
          <button className="btn btn-secondary" onClick={() => setShowLabReceiptModal(true)}>
            <FileText size={15} /> Lab receipt
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSettlementsModal(true)}>
            <DollarSign size={15} /> Settlements
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewBookingModal(true)}>
            <Plus size={16} /> New booking
          </button>
        </div>
      </div>

      {/* ====================================================================
          3 SUBTABS: Booking queue, Service areas, Public storefront
          ==================================================================== */}
      <div className="subtabs-bar" style={{ marginBottom: '20px' }}>
        <button
          className={`subtab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <Clock size={15} /> Booking queue ({bookings.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'areas' ? 'active' : ''}`}
          onClick={() => setActiveTab('areas')}
        >
          <MapPin size={15} /> Service areas & charges ({areas.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'storefront' ? 'active' : ''}`}
          onClick={() => setActiveTab('storefront')}
        >
          <Globe size={15} /> Public storefront & online tests
        </button>
      </div>

      {/* ====================================================================
          SUBTAB 1: BOOKING QUEUE
          ==================================================================== */}
      {activeTab === 'queue' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input" style={{ width: '380px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search booking #, patient, phone or area..."
                value={queueSearch}
                onChange={e => setQueueSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Status:</span>
              <span className="badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                {bookings.filter(b => b.status === 'Scheduled').length} Scheduled
              </span>
              <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                {bookings.filter(b => b.status === 'In Transit').length} In Transit
              </span>
              <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                {bookings.filter(b => b.status === 'Pending').length} Pending
              </span>
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Patient Details</th>
                <th>Schedule</th>
                <th>Service Area & Address</th>
                <th>Investigations</th>
                <th style={{ textAlign: 'right' }}>Total (৳)</th>
                <th>Assigned Phlebotomist</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ color: '#059669', fontSize: '13px' }}>{b.bookingNo}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.patientName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{b.date}</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>{b.preferredTime}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{b.area}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{b.address}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#334155' }}>
                      {b.tests.map((t, idx) => (
                        <div key={idx}>• {t}</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>৳{b.totalAmount}</div>
                    <span className={`badge ${b.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-due'}`} style={{ fontSize: '10px' }}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{b.technicianName}</div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background:
                          b.status === 'Delivered to Lab' ? '#dcfce7' :
                          b.status === 'Collected' ? '#dbeafe' :
                          b.status === 'In Transit' ? '#e0e7ff' :
                          b.status === 'Scheduled' ? '#ecfdf5' : '#fef3c7',
                        color:
                          b.status === 'Delivered to Lab' ? '#16a34a' :
                          b.status === 'Collected' ? '#1d4ed8' :
                          b.status === 'In Transit' ? '#4338ca' :
                          b.status === 'Scheduled' ? '#059669' : '#d97706',
                        fontSize: '11px'
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <select
                      value={b.status}
                      onChange={e => handleUpdateStatus(b.id, e.target.value as any)}
                      style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Collected">Collected</option>
                      <option value="Delivered to Lab">Delivered to Lab</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================
          SUBTAB 2: SERVICE AREAS & COVERAGE CONFIGURATION
          ==================================================================== */}
      {activeTab === 'areas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Add Service Area Form (Exact SihatSuite fields) */}
          <div
            className="card"
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Add Coverage Zone
            </h3>

            <form onSubmit={handleAddServiceArea} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Sadar & Ferry Ghat"
                  className="form-control form-control-sm"
                  value={newZoneName}
                  onChange={e => setNewZoneName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <input
                  type="text"
                  required
                  className="form-control form-control-sm"
                  value={newZoneDistrict}
                  onChange={e => setNewZoneDistrict(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Covered Locations / Areas</label>
                <textarea
                  rows={2}
                  placeholder="Key neighborhoods, road landmarks..."
                  className="form-control form-control-sm"
                  value={newZoneCovered}
                  onChange={e => setNewZoneCovered(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Draw Fee (৳) *</label>
                  <input
                    type="number"
                    required
                    className="form-control form-control-sm"
                    value={newZoneCharge}
                    onChange={e => setNewZoneCharge(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Free Above (৳)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={newZoneFreeAbove}
                    onChange={e => setNewZoneFreeAbove(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Daily Patient Capacity</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={newZoneCapacity}
                  onChange={e => setNewZoneCapacity(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Window From</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={newZoneFrom}
                    onChange={e => setNewZoneFrom(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Window To</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={newZoneTo}
                    onChange={e => setNewZoneTo(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                <Plus size={15} /> Save Service Zone
              </button>
            </form>
          </div>

          {/* Service Areas Table */}
          <div className="table-container">
            <div className="table-toolbar">
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                Active Service Zones ({areas.length})
              </span>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Zone & District</th>
                  <th>Covered Landmarks</th>
                  <th style={{ textAlign: 'right' }}>Draw Fee</th>
                  <th style={{ textAlign: 'right' }}>Free If Order &gt;</th>
                  <th>Capacity</th>
                  <th>Time Window</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ color: '#059669', fontSize: '13px' }}>{a.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{a.district}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#334155' }}>
                      {a.coveredAreas}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{a.charge}</td>
                    <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>৳{a.minFreeAmount}</td>
                    <td>{a.capacity} draws / day</td>
                    <td style={{ fontSize: '12px' }}>{a.timeFrom} – {a.timeTo}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-paid">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUBTAB 3: PUBLIC STOREFRONT CONFIGURATION & TESTS MATRIX
          ==================================================================== */}
      {activeTab === 'storefront' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Storefront Hero Configuration Card */}
          <div
            className="card"
            style={{
              padding: '20px 24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              Online Storefront Settings
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Headline Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={storefrontHeadline}
                  onChange={e => setStorefrontHeadline(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Storefront Introduction</label>
                <input
                  type="text"
                  className="form-control"
                  value={storefrontIntro}
                  onChange={e => setStorefrontIntro(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={() => showToast('Storefront content updated!')}>
                Save Storefront Content
              </button>
            </div>
          </div>

          {/* Tests Available Online Matrix Table */}
          <div className="table-container">
            <div className="table-toolbar">
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                Investigations Available for Online & Home Booking
              </span>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Investigation Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Price (৳)</th>
                  <th style={{ textAlign: 'center' }}>Enable Online</th>
                  <th style={{ textAlign: 'center' }}>Home Collection</th>
                  <th>Fasting Protocol</th>
                  <th>Patient Instructions</th>
                </tr>
              </thead>
              <tbody>
                {storefrontTests.map(t => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '13px' }}>{t.name}</strong>
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{t.price}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={t.online}
                        onChange={() => {
                          setStorefrontTests(prev =>
                            prev.map(item => item.id === t.id ? { ...item, online: !item.online } : item)
                          );
                          showToast(`Updated online visibility for ${t.name}`);
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={t.homeSample}
                        onChange={() => {
                          setStorefrontTests(prev =>
                            prev.map(item => item.id === t.id ? { ...item, homeSample: !item.homeSample } : item)
                          );
                          showToast(`Updated doorstep draw eligibility for ${t.name}`);
                        }}
                      />
                    </td>
                    <td style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>{t.fasting}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{t.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: NEW BOOKING MODAL
          ==================================================================== */}
      {showNewBookingModal && (
        <div className="modal-backdrop" onClick={() => setShowNewBookingModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Book Home Sample Collection</h3>
              <button className="icon-btn" onClick={() => setShowNewBookingModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name of patient"
                    className="form-control"
                    value={nbPatient}
                    onChange={e => setNbPatient(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    className="form-control"
                    value={nbPhone}
                    onChange={e => setNbPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Home Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Holding number, floor, street, landmark..."
                    className="form-control"
                    value={nbAddress}
                    onChange={e => setNbAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Service Area *</label>
                    <select
                      className="form-control"
                      value={nbArea}
                      onChange={e => setNbArea(e.target.value)}
                    >
                      {areas.map(a => (
                        <option key={a.id} value={a.name}>
                          {a.name} (+৳{a.charge})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={nbDate}
                      onChange={e => setNbDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time Slot *</label>
                  <select
                    className="form-control"
                    value={nbTime}
                    onChange={e => setNbTime(e.target.value)}
                  >
                    <option>07:30 AM - 08:30 AM (Early Fasting)</option>
                    <option>08:30 AM - 09:30 AM</option>
                    <option>09:30 AM - 10:30 AM</option>
                    <option>10:30 AM - 11:30 AM</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: COLLECTOR VIEW MODAL
          ==================================================================== */}
      {showCollectorModal && (
        <div className="modal-backdrop" onClick={() => setShowCollectorModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Phlebotomist Field Collector View</h3>
              <button className="icon-btn" onClick={() => setShowCollectorModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '13px' }}>
                  Today’s Field Schedule: Md. Al-Amin (Phlebotomist)
                </div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                  Coolbox Temperature Target: 2°C – 8°C | 3 Stops Assigned
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookings.map((b, idx) => (
                  <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: '#059669', fontSize: '13px' }}>
                          Stop #{idx + 1} — {b.patientName}
                        </span>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{b.phone}</div>
                        <div style={{ fontSize: '12px', color: '#0f172a', marginTop: '4px' }}>
                          📍 {b.address}
                        </div>
                      </div>
                      <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                        {b.preferredTime}
                      </span>
                    </div>

                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        Tests: <strong>{b.tests.join(', ')}</strong>
                      </div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          handleUpdateStatus(b.id, 'Collected');
                          showToast(`Specimens collected for ${b.patientName}`);
                        }}
                      >
                        Mark Collected
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCollectorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: LAB RECEIPT MODAL
          ==================================================================== */}
      {showLabReceiptModal && (
        <div className="modal-backdrop" onClick={() => setShowLabReceiptModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Central Lab Ingestion & Barcoding</h3>
              <button className="icon-btn" onClick={() => setShowLabReceiptModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Scan or ingest specimens brought back by phlebotomists into the central analyzer workflow:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {bookings.filter(b => b.status === 'Collected' || b.status === 'In Transit').map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{b.bookingNo}</strong> — {b.patientName}
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.tests.length} tubes collected</div>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        handleUpdateStatus(b.id, 'Delivered to Lab');
                        showToast(`Samples from ${b.bookingNo} checked into lab!`);
                      }}
                    >
                      Receive in Lab
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLabReceiptModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: SETTLEMENTS MODAL
          ==================================================================== */}
      {showSettlementsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettlementsModal(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Phlebotomist Daily Cash Settlements</h3>
              <button className="icon-btn" onClick={() => setShowSettlementsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Field Cash Collected</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>৳2,700</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Conveyance Allowance</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>৳450</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#475569' }}>
                Collector <strong>Md. Al-Amin</strong> completed 3 draws today. Net payable to cash counter: <strong>৳2,250</strong>.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSettlementsModal(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowSettlementsModal(false);
                  showToast('Cash counter clearance receipt generated & settled');
                }}
              >
                Clear & Settle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
