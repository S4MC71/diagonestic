import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiagnosticTest } from '../types';
import { Search, Plus, Download, Edit2, Check, X, ShieldAlert, Boxes } from 'lucide-react';

export const InvestigationsView: React.FC = () => {
  const { diagnosticTests, updateTestPrice, updateTestStockCapacity, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'groups' | 'capacity'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Group packages state
  const [groups, setGroups] = useState([
    {
      id: 'grp-1',
      name: 'Full Body Health Screening Profile',
      category: 'General',
      defaultPrice: 3500,
      description: 'Comprehensive health checkup including CBC, Lipid, Liver Function, and Creatinine',
      testsCount: 6
    },
    {
      id: 'grp-2',
      name: 'Diabetic Health Panel',
      category: 'Biochemistry',
      defaultPrice: 1400,
      description: 'Fasting Blood Sugar (FBS), HbA1c, Serum Creatinine, and Urine R/M/E',
      testsCount: 4
    },
    {
      id: 'grp-3',
      name: 'Antenatal Care (ANC) Profile',
      category: 'Serology',
      defaultPrice: 2200,
      description: 'Complete Blood Count, Blood Grouping, VDRL, HBsAg, and Urine Routine',
      testsCount: 5
    }
  ]);

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('General');
  const [newGroupPrice, setNewGroupPrice] = useState<number>(2000);
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const filteredTests = diagnosticTests.filter(t => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSavePrice = (id: string) => {
    updateTestPrice(id, newPrice);
    setEditingPriceId(null);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    setGroups([
      ...groups,
      {
        id: `grp-${Date.now()}`,
        name: newGroupName,
        category: newGroupCat,
        defaultPrice: newGroupPrice,
        description: newGroupDesc,
        testsCount: 3
      }
    ]);
    setShowAddGroupModal(false);
    setNewGroupName('');
    showToast(`Created package group: ${newGroupName}`);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigations Catalog</h1>
          <p className="page-subtitle">Diagnostic Test Formats, Pricing, Packages & Reagent Stock Capacity</p>
        </div>

        <div className="page-actions">
          {activeTab === 'groups' && (
            <button className="btn btn-primary" onClick={() => setShowAddGroupModal(true)}>
              <Plus size={16} /> Add Group
            </button>
          )}
          {activeTab === 'capacity' && (
            <button className="btn btn-secondary" onClick={() => showToast('Exporting XLS test capacity report')}>
              <Download size={14} /> Export XLS
            </button>
          )}
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          Investigation Catalog (1022)
        </button>
        <button
          className={`subtab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups ({groups.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'capacity' ? 'active' : ''}`}
          onClick={() => setActiveTab('capacity')}
        >
          Test Stock & Capacity
        </button>
      </div>

      {/* 1. CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search test name or code…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Department:</span>
              <select
                className="form-control"
                style={{ width: '180px', height: '34px', fontSize: '12px' }}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="Haematology">Haematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Clinical Pathology">Clinical Pathology</option>
                <option value="Ultrasonography (USG)">Ultrasonography (USG)</option>
                <option value="Radiology">Radiology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Hormone">Hormone</option>
              </select>
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Test Code</th>
                <th>Test / Investigation Name</th>
                <th>Category</th>
                <th>Specimen & Container</th>
                <th style={{ textAlign: 'right' }}>Price (৳)</th>
                <th>Type</th>
                <th style={{ textAlign: 'center' }}>Edit Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map(test => (
                <tr key={test.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>
                      {test.code}
                    </span>
                  </td>
                  <td>
                    <strong>{test.name}</strong>
                    {test.bengaliName && (
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-bangla)' }}>
                        {test.bengaliName}
                      </div>
                    )}
                  </td>
                  <td>{test.category}</td>
                  <td>
                    {test.sampleType !== 'None' ? (
                      <span style={{ fontSize: '11px', color: '#334155' }}>
                        {test.sampleType} · {test.containerType}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>No specimen</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {editingPriceId === test.id ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '85px', height: '28px', padding: '2px 6px', textAlign: 'right', fontWeight: 700 }}
                        value={newPrice}
                        onChange={e => setNewPrice(Number(e.target.value) || 0)}
                      />
                    ) : (
                      <strong style={{ color: '#059669' }}>৳{test.price.toFixed(2)}</strong>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${test.isSendOut ? 'badge-partial' : 'badge-inhouse'}`}>
                      {test.isSendOut ? 'Send-Out' : 'In-House'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editingPriceId === test.id ? (
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="icon-btn" onClick={() => handleSavePrice(test.id)}>
                          <Check size={14} color="#16a34a" />
                        </button>
                        <button className="icon-btn" onClick={() => setEditingPriceId(null)}>
                          <X size={14} color="#dc2626" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditingPriceId(test.id);
                          setNewPrice(test.price);
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. GROUPS / PACKAGES TAB */}
      {activeTab === 'groups' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Package / Panel Group</th>
                <th>Category</th>
                <th>Description</th>
                <th>Included Tests</th>
                <th style={{ textAlign: 'right' }}>Package Price</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id}>
                  <td><strong style={{ color: '#059669' }}>{g.name}</strong></td>
                  <td><span className="badge badge-inhouse">{g.category}</span></td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>{g.description}</td>
                  <td><strong>{g.testsCount}</strong> tests bundle</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>৳{g.defaultPrice}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Opened ${g.name}`)}>
                      View Tests
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. TEST STOCK & CAPACITY TAB */}
      {activeTab === 'capacity' && (
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Track machine & reagent daily capacity for 1,022 in-house diagnostic tests.
            </span>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Track Stock</th>
                <th style={{ textAlign: 'right' }}>Current Stock</th>
                <th>Alert Threshold</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {diagnosticTests.slice(0, 10).map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <input
                        type="checkbox"
                        checked={t.trackStock || false}
                        onChange={e => updateTestStockCapacity(t.id, e.target.checked)}
                      />
                      {t.trackStock ? 'Enabled' : 'Disabled'}
                    </label>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {t.trackStock ? `${t.stockUnits || 85} tests` : <span style={{ color: '#94a3b8' }}>Not tracked</span>}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '80px', height: '28px', padding: '2px 6px', fontSize: '12px' }}
                      defaultValue={t.alertThreshold || 10}
                      onChange={e => updateTestStockCapacity(t.id, t.trackStock || false, Number(e.target.value) || 10)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      onClick={() => showToast(`Replenished stock for ${t.name}`)}
                    >
                      + Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="modal-backdrop" onClick={() => setShowAddGroupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Panel Group</h3>
              <button className="icon-btn" onClick={() => setShowAddGroupModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Group Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lipid Profile Package"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newGroupCat}
                      onChange={e => setNewGroupCat(e.target.value)}
                    >
                      <option>General</option>
                      <option>Biochemistry</option>
                      <option>Haematology</option>
                      <option>Serology</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default Price (BDT) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newGroupPrice}
                      onChange={e => setNewGroupPrice(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Panel inclusions"
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddGroupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
