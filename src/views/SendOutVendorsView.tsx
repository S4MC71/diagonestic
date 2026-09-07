import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Plus, Phone, Mail, DollarSign, X } from 'lucide-react';

export const SendOutVendorsView: React.FC = () => {
  const { sendOutVendors, showToast } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Send-Out Reference Labs</h1>
          <p className="page-subtitle">Partner Reference Laboratories & Outsourced Specialized Test Directory</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Reference Lab
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {sendOutVendors.map(v => (
          <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>{v.name}</h3>
                <span className="badge badge-inhouse">Active Partner</span>
              </div>

              <div style={{ fontSize: '13px', color: '#334155', marginBottom: '12px' }}>
                Contact: <strong>{v.contactPerson}</strong>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Phone: <strong>{v.phone}</strong></div>
                <div>Email: {v.email}</div>
                <div>Location: {v.address}</div>
                <div>Active Tests Outsourced: <strong>{v.activeTestsCount} tests</strong></div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                Balance Due: ৳{v.balanceDue}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => showToast(`Opened B2B rate list for ${v.name}`)}
              >
                View B2B Rates
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Reference Lab Partner</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Reference Lab Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Popular Diagnostic Dhaka" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input type="text" className="form-control" placeholder="Lab Manager / Coordinator" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input type="text" className="form-control" placeholder="017xxxxxxxx" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="lab@domain.com" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); showToast('Reference lab partner added'); }}>
                Save Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
