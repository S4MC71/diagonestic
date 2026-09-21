import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Pill,
  Search,
  Plus,
  Filter,
  X,
  ArrowUpDown,
  CheckCircle2,
  Package,
  Sparkles,
  Edit2,
  Trash2
} from 'lucide-react';

interface MedicineItem {
  id: string;
  brand: string;
  form: string;
  strength: string;
  generic: string;
  company: string;
  packSize: string;
  price: number;
  inStockQty: number;
}

export const DrugsView: React.FC = () => {
  const { showToast, setCurrentView } = useApp();

  // Master Drugs Catalog Data
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { id: '1', brand: 'Napa', form: 'Tablet', strength: '500mg', generic: 'Paracetamol', company: 'Beximco Pharmaceuticals Ltd.', packSize: '510 pcs / box', price: 1.20, inStockQty: 450 },
    { id: '2', brand: 'Napa Extra', form: 'Tablet', strength: '500mg+65mg', generic: 'Paracetamol + Caffeine', company: 'Beximco Pharmaceuticals Ltd.', packSize: '200 pcs / box', price: 3.50, inStockQty: 320 },
    { id: '3', brand: 'Seclo', form: 'Capsule', strength: '20mg', generic: 'Omeprazole', company: 'Square Pharmaceuticals PLC', packSize: '100 pcs / box', price: 7.00, inStockQty: 180 },
    { id: '4', brand: 'Ciprocin', form: 'Tablet', strength: '500mg', generic: 'Ciprofloxacin', company: 'Square Pharmaceuticals PLC', packSize: '50 pcs / box', price: 16.00, inStockQty: 95 },
    { id: '5', brand: 'Monas', form: 'Tablet', strength: '10mg', generic: 'Montelukast Sodium', company: 'Acme Laboratories Ltd.', packSize: '30 pcs / box', price: 17.50, inStockQty: 140 },
    { id: '6', brand: 'Torax', form: 'Tablet', strength: '10mg', generic: 'Ketorolac Tromethamine', company: 'Square Pharmaceuticals PLC', packSize: '50 pcs / box', price: 12.00, inStockQty: 60 },
    { id: '7', brand: 'Fexo', form: 'Tablet', strength: '120mg', generic: 'Fexofenadine Hydrochloride', company: 'Square Pharmaceuticals PLC', packSize: '50 pcs / box', price: 10.00, inStockQty: 110 },
    { id: '8', brand: 'Almex', form: 'Suspension', strength: '400mg/5ml', generic: 'Albendazole', company: 'Square Pharmaceuticals PLC', packSize: '10 ml / bot', price: 25.00, inStockQty: 0 },
    { id: '9', brand: 'Panum', form: 'Tablet', strength: '40mg', generic: 'Pantoprazole', company: 'Incepta Pharmaceuticals Ltd.', packSize: '100 pcs / box', price: 9.00, inStockQty: 220 },
    { id: '10', brand: 'Azithrocin', form: 'Tablet', strength: '500mg', generic: 'Azithromycin', company: 'Beximco Pharmaceuticals Ltd.', packSize: '18 pcs / box', price: 35.00, inStockQty: 45 },
    { id: '11', brand: 'Ace', form: 'Tablet', strength: '500mg', generic: 'Paracetamol', company: 'Square Pharmaceuticals PLC', packSize: '500 pcs / box', price: 1.20, inStockQty: 0 },
    { id: '12', brand: 'Maxpro', form: 'Capsule', strength: '20mg', generic: 'Esomeprazole', company: 'Renata Limited', packSize: '100 pcs / box', price: 8.00, inStockQty: 300 }
  ]);

  // Search & Filters (Exact SihatSuite layout)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneric, setSelectedGeneric] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedForm, setSelectedForm] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState<'brand' | 'generic' | 'company' | 'price' | 'inStockQty'>('brand');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);

  // Form Fields
  const [fBrand, setFBrand] = useState('');
  const [fStrength, setFStrength] = useState('');
  const [fPackSize, setFPackSize] = useState('100 pcs / box');
  const [fGeneric, setFGeneric] = useState('Paracetamol');
  const [fCompany, setFCompany] = useState('Square Pharmaceuticals PLC');
  const [fForm, setFForm] = useState('Tablet');
  const [fPrice, setFPrice] = useState('10');

  // Generic and Company unique lists for dropdowns
  const uniqueGenerics = Array.from(new Set(medicines.map(m => m.generic))).sort();
  const uniqueCompanies = Array.from(new Set(medicines.map(m => m.company))).sort();
  const uniqueForms = Array.from(new Set(medicines.map(m => m.form))).sort();

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFBrand('');
    setFStrength('');
    setFPackSize('100 pcs / box');
    setFGeneric('Paracetamol');
    setFCompany('Square Pharmaceuticals PLC');
    setFForm('Tablet');
    setFPrice('10');
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: MedicineItem) => {
    setEditingMedicine(m);
    setFBrand(m.brand);
    setFStrength(m.strength);
    setFPackSize(m.packSize);
    setFGeneric(m.generic);
    setFCompany(m.company);
    setFForm(m.form);
    setFPrice(m.price.toString());
    setShowAddModal(true);
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    if (window.confirm(`Delete medicine "${name}" from master catalog?`)) {
      setMedicines(prev => prev.filter(m => m.id !== id));
      showToast(`Medicine ${name} deleted`);
    }
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fBrand.trim()) return;

    if (editingMedicine) {
      setMedicines(prev =>
        prev.map(m =>
          m.id === editingMedicine.id
            ? {
                ...m,
                brand: fBrand.trim(),
                strength: fStrength.trim(),
                packSize: fPackSize.trim(),
                generic: fGeneric.trim(),
                company: fCompany.trim(),
                form: fForm,
                price: parseFloat(fPrice) || 0
              }
            : m
        )
      );
      showToast(`Medicine ${fBrand} updated`);
    } else {
      const newMed: MedicineItem = {
        id: `med-${Date.now()}`,
        brand: fBrand.trim(),
        strength: fStrength.trim(),
        packSize: fPackSize.trim(),
        generic: fGeneric.trim(),
        company: fCompany.trim(),
        form: fForm,
        price: parseFloat(fPrice) || 0,
        inStockQty: 0
      };
      setMedicines(prev => [newMed, ...prev]);
      showToast(`Added ${fBrand} to drug catalog`);
    }
    setShowAddModal(false);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = medicines
    .filter(m => {
      const matchesSearch =
        m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGeneric = selectedGeneric === 'ALL' || m.generic === selectedGeneric;
      const matchesCompany = selectedCompany === 'ALL' || m.company === selectedCompany;
      const matchesForm = selectedForm === 'ALL' || m.form === selectedForm;
      return matchesSearch && matchesGeneric && matchesCompany && matchesForm;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Drug Catalog
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Every medicine here can be stocked in pharmacy, starting at zero quantity.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add medicine
        </button>
      </div>

      {/* ====================================================================
          SEARCH & 3 FILTERS TOOLBAR (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
          {/* Search Input */}
          <div className="table-search-input" style={{ width: '100%' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by brand, generic, or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* All Generics Dropdown */}
          <div>
            <select
              className="form-control"
              value={selectedGeneric}
              onChange={e => setSelectedGeneric(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="ALL">All Generics</option>
              {uniqueGenerics.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* All Companies Dropdown */}
          <div>
            <select
              className="form-control"
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="ALL">All Companies</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* All Forms Dropdown */}
          <div>
            <select
              className="form-control"
              value={selectedForm}
              onChange={e => setSelectedForm(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="ALL">All Forms</option>
              {uniqueForms.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedGeneric !== 'ALL' || selectedCompany !== 'ALL' || selectedForm !== 'ALL') && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedGeneric('ALL');
                setSelectedCompany('ALL');
                setSelectedForm('ALL');
              }}
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          DRUG TABLE (MATCHING SIHATSUITE COLUMNS & SORTING)
          ==================================================================== */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('brand')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Brand Name <ArrowUpDown size={13} color="#94a3b8" />
                </div>
              </th>
              <th>Form</th>
              <th>Strength</th>
              <th onClick={() => toggleSort('generic')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Generic Name <ArrowUpDown size={13} color="#94a3b8" />
                </div>
              </th>
              <th onClick={() => toggleSort('company')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Company <ArrowUpDown size={13} color="#94a3b8" />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Unit MRP (৳)</th>
              <th onClick={() => toggleSort('inStockQty')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  In Stock <ArrowUpDown size={13} color="#94a3b8" />
                </div>
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td>
                  <strong style={{ color: '#059669', fontSize: '14px' }}>{m.brand}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Pack: {m.packSize}</div>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background:
                        m.form === 'Tablet' ? '#ecfdf5' :
                        m.form === 'Capsule' ? '#eff6ff' :
                        m.form === 'Suspension' ? '#fef3c7' : '#f1f5f9',
                      color:
                        m.form === 'Tablet' ? '#059669' :
                        m.form === 'Capsule' ? '#1d4ed8' :
                        m.form === 'Suspension' ? '#b45309' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {m.form}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {m.strength}
                  </span>
                </td>
                <td style={{ color: '#0f172a', fontWeight: 500 }}>
                  {m.generic}
                </td>
                <td style={{ color: '#64748b', fontSize: '13px' }}>
                  {m.company}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                  ৳{m.price.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {m.inStockQty > 0 ? (
                    <span className="badge badge-paid" style={{ fontSize: '11px' }}>
                      {m.inStockQty} units
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px' }}>
                      0 (Out of Stock)
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      title="Edit Medicine"
                      onClick={() => handleOpenEdit(m)}
                    >
                      <Edit2 size={14} color="#0284c7" />
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete Medicine"
                      onClick={() => handleDeleteMedicine(m.id, m.brand)}
                    >
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====================================================================
          + ADD / EDIT MEDICINE MODAL (EXACT SIHATSUITE FIELDS)
          ==================================================================== */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMedicine ? 'Edit Medicine' : 'Add Medicine to Catalog'}
              </h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Napa Extra"
                    className="form-control"
                    value={fBrand}
                    onChange={e => setFBrand(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Strength</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg+65mg"
                      className="form-control"
                      value={fStrength}
                      onChange={e => setFStrength(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pack Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 100 pcs / box"
                      className="form-control"
                      value={fPackSize}
                      onChange={e => setFPackSize(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Generic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol + Caffeine"
                    className="form-control"
                    value={fGeneric}
                    onChange={e => setFGeneric(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company / Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beximco Pharmaceuticals Ltd."
                    className="form-control"
                    value={fCompany}
                    onChange={e => setFCompany(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Dosage Form</label>
                    <select
                      className="form-control"
                      value={fForm}
                      onChange={e => setFForm(e.target.value)}
                    >
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Syrup</option>
                      <option>Suspension</option>
                      <option>Injection</option>
                      <option>Eye Drops</option>
                      <option>Ointment</option>
                      <option>Inhaler</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit MRP Price (৳)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="form-control"
                      value={fPrice}
                      onChange={e => setFPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMedicine ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
