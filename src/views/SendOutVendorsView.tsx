import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  DollarSign,
  X,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ContactPerson {
  name: string;
  phone: string;
  role: string;
}

interface SendOutVendorItem {
  id: string;
  name: string;
  hotline: string;
  whatsapp: string;
  email: string;
  address: string;
  notes: string;
  contacts: ContactPerson[];
  activeTestsCount: number;
}

interface B2BTestRate {
  id: string;
  testName: string;
  category: string;
  rates: Record<string, number>; // vendorId -> price
}

export const SendOutVendorsView: React.FC = () => {
  const { showToast } = useApp();

  // Vendors List
  const [vendors, setVendors] = useState<SendOutVendorItem[]>([
    {
      id: 'v-1',
      name: 'Popular Diagnostic Centre Dhaka',
      hotline: '09613-787801',
      whatsapp: '01711-223344',
      email: 'sendout@populardiagnostic.com',
      address: 'House 16, Road 2, Dhanmondi, Dhaka',
      notes: 'Turnaround time 24h for Histopathology & PCR. Daily courier dispatch at 4 PM.',
      contacts: [
        { name: 'Dr. Shahabuddin', phone: '01711-223344', role: 'Lab Coordinator' },
        { name: 'Kamal Hossain', phone: '01819-556677', role: 'Logistics Manager' }
      ],
      activeTestsCount: 38
    },
    {
      id: 'v-2',
      name: 'Ibn Sina Reference Lab',
      hotline: '09610-010615',
      whatsapp: '01819-445566',
      email: 'reference@ibnsinatrust.com',
      address: 'Kalyanpur Main Road, Mirpur, Dhaka',
      notes: 'Specialist immunology and rare genetic screening. Direct cold-chain hub.',
      contacts: [
        { name: 'Md. Tariqul Islam', phone: '01819-445566', role: 'B2B Client Officer' }
      ],
      activeTestsCount: 24
    },
    {
      id: 'v-3',
      name: 'Labaid Reference Laboratory',
      hotline: '10606',
      whatsapp: '01766-663300',
      email: 'b2b@labaidgroup.com',
      address: 'Road 4, Dhanmondi, Dhaka',
      notes: 'Automated digital result API integration and immunohistochemistry partner.',
      contacts: [
        { name: 'Farhan Ahmed', phone: '01766-663300', role: 'Account Exec' }
      ],
      activeTestsCount: 19
    }
  ]);

  // B2B Rates Matrix Data
  const [ratesData, setRatesData] = useState<B2BTestRate[]>([
    {
      id: 'r-1',
      testName: 'Histopathology (Biopsy - Small Specimen)',
      category: 'Histopathology',
      rates: { 'v-1': 1100, 'v-2': 1250, 'v-3': 1300 }
    },
    {
      id: 'r-2',
      testName: 'Histopathology (Biopsy - Large Specimen)',
      category: 'Histopathology',
      rates: { 'v-1': 2200, 'v-2': 2100, 'v-3': 2400 }
    },
    {
      id: 'r-3',
      testName: 'HCV RNA Viral Load (Real-Time PCR)',
      category: 'Molecular Biology',
      rates: { 'v-1': 3800, 'v-2': 3900, 'v-3': 3600 }
    },
    {
      id: 'r-4',
      testName: 'HBV DNA Quantitative PCR',
      category: 'Molecular Biology',
      rates: { 'v-1': 3200, 'v-2': 3100, 'v-3': 3400 }
    },
    {
      id: 'r-5',
      testName: 'Anti-Nuclear Antibody (ANA) by IFA',
      category: 'Immunology',
      rates: { 'v-1': 950, 'v-2': 900, 'v-3': 1050 }
    },
    {
      id: 'r-6',
      testName: 'Dual Energy X-Ray Absorptiometry (BMD/DEXA Scan)',
      category: 'Radiology',
      rates: { 'v-1': 2000, 'v-2': 2200, 'v-3': 1950 }
    }
  ]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<SendOutVendorItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [hotline, setHotline] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState<ContactPerson[]>([
    { name: '', phone: '', role: '' }
  ]);

  // Search & Filter for Matrix
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixCategory, setMatrixCategory] = useState('ALL');

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setName('');
    setHotline('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setNotes('');
    setContacts([{ name: '', phone: '', role: '' }]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (v: SendOutVendorItem) => {
    setEditingVendor(v);
    setName(v.name);
    setHotline(v.hotline);
    setWhatsapp(v.whatsapp);
    setEmail(v.email);
    setAddress(v.address);
    setNotes(v.notes);
    setContacts(v.contacts.length > 0 ? v.contacts : [{ name: '', phone: '', role: '' }]);
    setShowAddModal(true);
  };

  const handleDeleteVendor = (id: string, vName: string) => {
    if (window.confirm(`Are you sure you want to remove reference lab "${vName}"?`)) {
      setVendors(prev => prev.filter(v => v.id !== id));
      showToast(`Removed reference lab: ${vName}`);
    }
  };

  const handleAddContactRow = () => {
    setContacts(prev => [...prev, { name: '', phone: '', role: '' }]);
  };

  const handleContactChange = (index: number, field: keyof ContactPerson, val: string) => {
    setContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const filteredContacts = contacts.filter(c => c.name.trim() || c.phone.trim());

    if (editingVendor) {
      setVendors(prev =>
        prev.map(v =>
          v.id === editingVendor.id
            ? {
                ...v,
                name,
                hotline,
                whatsapp,
                email,
                address,
                notes,
                contacts: filteredContacts
              }
            : v
        )
      );
      showToast(`Updated vendor: ${name}`);
    } else {
      const newV: SendOutVendorItem = {
        id: `v-${Date.now()}`,
        name,
        hotline,
        whatsapp,
        email,
        address,
        notes,
        contacts: filteredContacts,
        activeTestsCount: 0
      };
      setVendors(prev => [...prev, newV]);
      showToast(`Added new reference lab: ${name}`);
    }
    setShowAddModal(false);
  };

  // Matrix lowest price helper
  const getLowestRateVendor = (rates: Record<string, number>) => {
    let minPrice = Infinity;
    let minVendorId = '';
    Object.entries(rates).forEach(([vId, price]) => {
      if (price < minPrice) {
        minPrice = price;
        minVendorId = vId;
      }
    });
    return { minVendorId, minPrice };
  };

  const filteredRates = ratesData.filter(r => {
    const matchesSearch = r.testName.toLowerCase().includes(matrixSearch.toLowerCase());
    const matchesCat = matrixCategory === 'ALL' || r.category === matrixCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="view-container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ====================================================================
          TOP SECTION: VENDORS DIRECTORY & TABLE (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Send-Out Vendors
            </h1>
            <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Partner Reference Laboratories, Sample Courier Dispatch & B2B Outsourced Tests
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Vendor
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Hotline & WhatsApp</th>
                <th>Contact Persons</th>
                <th>Address & Logistics Notes</th>
                <th>Outsourced Tests</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                      {v.name}
                    </div>
                    {v.email && (
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Mail size={12} /> {v.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                      ☎ {v.hotline || '—'}
                    </div>
                    {v.whatsapp && (
                      <a
                        href={`https://wa.me/88${v.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <MessageCircle size={12} /> WhatsApp: {v.whatsapp}
                      </a>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {v.contacts.map((c, i) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          <strong>{c.name}</strong>{' '}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({c.role})</span> — {c.phone}
                        </div>
                      ))}
                      {v.contacts.length === 0 && <span style={{ color: '#94a3b8', fontSize: '12px' }}>None listed</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#0f172a' }}>{v.address}</div>
                    {v.notes && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                        ⏱ {v.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#ecfdf5', color: '#059669', fontWeight: 700 }}>
                      {v.activeTestsCount} tests
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button
                        className="icon-btn"
                        title="Edit Vendor"
                        onClick={() => handleOpenEdit(v)}
                      >
                        <Edit2 size={14} color="#0284c7" />
                      </button>
                      <button
                        className="icon-btn"
                        title="Delete Vendor"
                        onClick={() => handleDeleteVendor(v.id, v.name)}
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
      </div>

      {/* ====================================================================
          BOTTOM SECTION: B2B RATES PER TEST MATRIX (EXACT SIHATSUITE FEATURE)
          Highlights the lowest-priced vendor per investigation
          ==================================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              B2B Rates per Test
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
              Comparison matrix of contracted wholesale outsourcing rates charged by each partner lab. Lowest price is highlighted.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="table-search-input" style={{ width: '280px' }}>
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search test rate..."
                value={matrixSearch}
                onChange={e => setMatrixSearch(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              value={matrixCategory}
              onChange={e => setMatrixCategory(e.target.value)}
              style={{ fontSize: '12px', width: '160px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="Histopathology">Histopathology</option>
              <option value="Molecular Biology">Molecular Biology</option>
              <option value="Immunology">Immunology</option>
              <option value="Radiology">Radiology</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Investigation Name</th>
                <th>Category</th>
                {vendors.map(v => (
                  <th key={v.id} style={{ textAlign: 'right' }}>
                    {v.name.split(' ')[0]} (৳)
                  </th>
                ))}
                <th style={{ textAlign: 'center' }}>Optimal Vendor</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map(r => {
                const { minVendorId, minPrice } = getLowestRateVendor(r.rates);
                const optimalVendor = vendors.find(v => v.id === minVendorId);

                return (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{r.testName}</strong>
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                        {r.category}
                      </span>
                    </td>
                    {vendors.map(v => {
                      const price = r.rates[v.id];
                      const isLowest = v.id === minVendorId;

                      return (
                        <td
                          key={v.id}
                          style={{
                            textAlign: 'right',
                            fontWeight: isLowest ? 800 : 500,
                            color: isLowest ? '#059669' : '#475569',
                            background: isLowest ? 'rgba(5, 150, 105, 0.05)' : 'transparent'
                          }}
                        >
                          {price ? (
                            <span>
                              ৳{price}{' '}
                              {isLowest && (
                                <span title="Best Price" style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px' }}>
                                  LOWEST
                                </span>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>N/A</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-inhouse" style={{ fontSize: '11px' }}>
                        ★ {optimalVendor ? optimalVendor.name.split(' ')[0] : '—'} (৳{minPrice})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          ADD / EDIT VENDOR MODAL (EXACT SIHATSUITE FIELDS)
          ==================================================================== */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingVendor ? 'Edit Reference Lab Partner' : 'Add Vendor'}
              </h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVendor}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Popular Diagnostic Dhaka"
                    className="form-control"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Hotline</label>
                    <input
                      type="text"
                      placeholder="09613-xxxxxx"
                      className="form-control"
                      value={hotline}
                      onChange={e => setHotline(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="017xxxxxxxx"
                      className="form-control"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    placeholder="b2b@referencelab.com"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    placeholder="Full street address & delivery hub"
                    className="form-control"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Turnaround Times</label>
                  <textarea
                    rows={2}
                    placeholder="Specimen handling instructions, cutoff dispatch hours..."
                    className="form-control"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                {/* Contact Persons List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Contact Persons
                    </label>
                    <button
                      type="button"
                      onClick={handleAddContactRow}
                      style={{ background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add contact
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {contacts.map((c, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 28px', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Contact Name"
                          className="form-control form-control-sm"
                          value={c.name}
                          onChange={e => handleContactChange(idx, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Lab Mgr)"
                          className="form-control form-control-sm"
                          value={c.role}
                          onChange={e => handleContactChange(idx, 'role', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Phone"
                          className="form-control form-control-sm"
                          value={c.phone}
                          onChange={e => handleContactChange(idx, 'phone', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}
                          style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVendor ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
