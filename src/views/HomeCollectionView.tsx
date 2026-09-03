import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, MapPin, Globe, Phone, UserCheck, CheckCircle2, Clock, Plus, X } from 'lucide-react';

export const HomeCollectionView: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'queue' | 'areas' | 'storefront' | 'collector'>('queue');

  // Bookings queue
  const [bookings, setBookings] = useState([
    {
      id: 'b-1',
      bookingNo: 'HC-2026-042',
      patientName: 'Mrs. Salma Begum',
      phone: '01712-445566',
      address: 'House 14, College Road, Jhalakathi Sadar',
      area: 'Jhalakathi Sadar',
      date: '2026-09-03',
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
      address: 'Station Road, Nalchity',
      area: 'Nalchity Upazila',
      date: '2026-09-03',
      preferredTime: '09:15 AM',
      tests: ['Serum Creatinine', 'Serum Electrolytes', 'Complete Blood Count (CBC)'],
      technicianName: 'Md. Al-Amin',
      status: 'In Transit',
      totalAmount: 1600,
      paymentStatus: 'Paid'
    }
  ]);

  // Service Areas
  const [areas, setAreas] = useState([
    { id: 'a-1', name: 'Jhalakathi Sadar Town', distanceKm: 5, charge: 150, minFreeAmount: 2000, active: true },
    { id: 'a-2', name: 'Nalchity Upazila', distanceKm: 14, charge: 300, minFreeAmount: 3000, active: true },
    { id: 'a-3', name: 'Rajapur Bazar', distanceKm: 18, charge: 400, minFreeAmount: 4000, active: true }
  ]);

  const handleUpdateStatus = (id: string, status: any) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    showToast(`Home collection ${id} updated to ${status}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Home Sample Collection</h1>
          <p className="page-subtitle">Doorstep Blood & Specimen Draw Requests, Field Dispatch & Settlements</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => showToast('New booking form opened')}
          >
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <Clock size={15} /> Booking Queue ({bookings.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'areas' ? 'active' : ''}`}
          onClick={() => setActiveTab('areas')}
        >
          <MapPin size={15} /> Service Areas & Charges
        </button>
        <button
          className={`subtab-btn ${activeTab === 'storefront' ? 'active' : ''}`}
          onClick={() => setActiveTab('storefront')}
        >
          <Globe size={15} /> Public Online Storefront
        </button>
        <button
          className={`subtab-btn ${activeTab === 'collector' ? 'active' : ''}`}
          onClick={() => setActiveTab('collector')}
        >
          <UserCheck size={15} /> Collector App View
        </button>
      </div>

      {activeTab === 'queue' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Patient & Address</th>
                <th>Schedule</th>
                <th>Tests Requested</th>
                <th>Assigned Technician</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td><strong style={{ color: '#073f8f' }}>{b.bookingNo}</strong></td>
                  <td>
                    <strong>{b.patientName}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{b.phone}</div>
                    <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>{b.address}</div>
                  </td>
                  <td>
                    <div>{b.date}</div>
                    <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>{b.preferredTime}</div>
                  </td>
                  <td>{b.tests.join(', ')}</td>
                  <td>{b.technicianName}</td>
                  <td>
                    <strong>৳{b.totalAmount}</strong>
                    <div style={{ fontSize: '11px', color: b.paymentStatus === 'Paid' ? '#16a34a' : '#dc2626' }}>
                      {b.paymentStatus}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${b.status === 'Collected' ? 'badge-paid' : b.status === 'In Transit' ? 'badge-partial' : 'badge-inhouse'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <select
                      value={b.status}
                      onChange={e => handleUpdateStatus(b.id, e.target.value)}
                      style={{ fontSize: '12px', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Collected">Collected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'areas' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service Area / Zone</th>
                <th>Est. Distance</th>
                <th>Collection Fee (৳)</th>
                <th>Free Collection Above</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td>~{a.distanceKm} km</td>
                  <td>৳{a.charge}</td>
                  <td>৳{a.minFreeAmount}</td>
                  <td><span className="badge badge-paid">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'storefront' && (
        <div className="card" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>Public Patient Booking Page</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
            Allow patients to book home sample collection directly from your branded web portal.
          </p>
          <div className="form-group">
            <label className="form-label">Storefront Public URL</label>
            <input
              type="text"
              readOnly
              className="form-control"
              value="https://jhalakathid.sihatsuite.com/home-collection"
              style={{ background: '#f8fafc', fontWeight: 600, color: '#073f8f' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Storefront Headline</label>
            <input
              type="text"
              className="form-control"
              defaultValue="Book Lab Tests at Home in Jhalakathi — Fast & Reliable Reports"
            />
          </div>
          <button className="btn btn-primary" onClick={() => showToast('Storefront configuration saved!')}>
            Save Configuration
          </button>
        </div>
      )}

      {activeTab === 'collector' && (
        <div className="card" style={{ maxWidth: '500px', background: '#051c40', color: '#ffffff' }}>
          <div style={{ fontSize: '11px', color: '#10b9b3', fontWeight: 'bold', textTransform: 'uppercase' }}>
            PHLEBOTOMIST MOBILE VIEW
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px', marginBottom: '16px' }}>
            Today's Route: 2 Stops
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map((b, i) => (
              <div key={b.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Stop #{i + 1}: {b.patientName}</strong>
                  <span style={{ color: '#5de8e2' }}>{b.preferredTime}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{b.address}</div>
                <div style={{ fontSize: '12px', color: '#fbb040', marginTop: '2px' }}>Call: {b.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
