import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pill, Search, Plus, Filter, X } from 'lucide-react';

export const DrugsView: React.FC = () => {
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  // Sample drugs
  const [drugs, setDrugs] = useState([
    { id: '1', brand: 'Napa', form: 'Tablet', strength: '500mg', generic: 'Paracetamol', company: 'Beximco Pharmaceuticals Ltd.', inStock: true, price: 1.2 },
    { id: '2', brand: 'Napa Extra', form: 'Tablet', strength: '500mg+65mg', generic: 'Paracetamol + Caffeine', company: 'Beximco Pharmaceuticals Ltd.', inStock: true, price: 3.5 },
    { id: '3', brand: 'Seclo', form: 'Capsule', strength: '20mg', generic: 'Omeprazole', company: 'Square Pharmaceuticals PLC', inStock: true, price: 7.0 },
    { id: '4', brand: 'Ciprocin', form: 'Tablet', strength: '500mg', generic: 'Ciprofloxacin', company: 'Square Pharmaceuticals PLC', inStock: true, price: 16.0 },
    { id: '5', brand: 'Monas', form: 'Tablet', strength: '10mg', generic: 'Montelukast Sodium', company: 'Acme Laboratories Ltd.', inStock: true, price: 17.5 },
    { id: '6', brand: 'Torax', form: 'Tablet', strength: '10mg', generic: 'Ketorolac Tromethamine', company: 'Square Pharmaceuticals PLC', inStock: true, price: 12.0 },
    { id: '7', brand: 'Fexo', form: 'Tablet', strength: '120mg', generic: 'Fexofenadine Hydrochloride', company: 'Square Pharmaceuticals PLC', inStock: true, price: 10.0 },
    { id: '8', brand: 'Almex', form: 'Suspension', strength: '400mg/5ml', generic: 'Albendazole', company: 'Square Pharmaceuticals PLC', inStock: false, price: 25.0 }
  ]);

  const filtered = drugs.filter(d => {
    const matchesSearch =
      d.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCo = selectedCompany === 'ALL' || d.company.includes(selectedCompany);
    return matchesSearch && matchesCo;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Drugs Master Catalog</h1>
          <p className="page-subtitle">28,412 Bangladesh Directorate General of Drug Administration (DGDA) Registered Medicines</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search-input" style={{ width: '360px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by Brand, Generic, or Company…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Manufacturer:</span>
            {['ALL', 'Square', 'Beximco', 'Acme'].map(co => (
              <button
                key={co}
                className={`btn btn-sm ${selectedCompany === co ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCompany(co)}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {co}
              </button>
            ))}
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Brand Name</th>
              <th>Form & Strength</th>
              <th>Generic Name</th>
              <th>Manufacturer Company</th>
              <th style={{ textAlign: 'right' }}>Unit MRP (৳)</th>
              <th style={{ textAlign: 'center' }}>Pharmacy Stock</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td><strong style={{ color: '#059669', fontSize: '14px' }}>{d.brand}</strong></td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: 600, fontSize: '12px' }}>
                    {d.form} {d.strength}
                  </span>
                </td>
                <td style={{ color: '#475569' }}>{d.generic}</td>
                <td style={{ color: '#64748b' }}>{d.company}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{d.price.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>
                  {d.inStock ? (
                    <span className="badge badge-paid">In Stock</span>
                  ) : (
                    <span className="badge badge-due">Out of Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Medicine to Catalog</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Brand Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Napa One" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Dosage Form *</label>
                  <select className="form-control">
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                    <option>Suspension</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Strength *</label>
                  <input type="text" className="form-control" placeholder="1000mg" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Generic Name *</label>
                <input type="text" className="form-control" placeholder="Paracetamol" />
              </div>
              <div className="form-group">
                <label className="form-label">Manufacturer Company *</label>
                <input type="text" className="form-control" placeholder="Beximco Pharmaceuticals Ltd." />
              </div>
              <div className="form-group">
                <label className="form-label">MRP Price (৳)</label>
                <input type="number" className="form-control" placeholder="3.50" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); showToast('Medicine added to catalog'); }}>
                Save Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
