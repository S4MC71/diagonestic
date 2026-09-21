import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Check,
  X,
  ShieldAlert,
  Boxes,
  Layers,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  Sliders,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface ReflexRule {
  id: string;
  triggerTest: string;
  triggerCategory: string;
  condition: string;
  threshold: string;
  reflexTest: string;
  reflexCategory: string;
  autoAdd: boolean;
  active: boolean;
}

export const InvestigationsView: React.FC = () => {
  const { diagnosticTests, updateTestPrice, updateTestStockCapacity, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'groups' | 'capacity' | 'reflex'>('catalog');

  // Search & Filters for Catalog
  const [panelSearch, setPanelSearch] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sendOutFilter, setSendOutFilter] = useState('ALL');

  // Inline pricing edits for Catalog individual tests
  const [testSettings, setTestSettings] = useState<
    Record<
      string,
      {
        price: number;
        enabled: boolean;
        isSendOut: boolean;
        noDiscount: boolean;
        agentApp: boolean;
      }
    >
  >(() => {
    const map: Record<
      string,
      {
        price: number;
        enabled: boolean;
        isSendOut: boolean;
        noDiscount: boolean;
        agentApp: boolean;
      }
    > = {};
    diagnosticTests.forEach(t => {
      map[t.id] = {
        price: t.price,
        enabled: true,
        isSendOut: t.isSendOut || false,
        noDiscount: false,
        agentApp: true
      };
    });
    return map;
  });

  // Panel Groups State
  const [groups, setGroups] = useState([
    {
      id: 'grp-1',
      name: 'Full Body Health Screening Profile',
      category: 'General Health',
      listPrice: 4200,
      yourPrice: 3500,
      enabled: true,
      description: 'Comprehensive health checkup including CBC, Lipid Profile, Liver Function, and Creatinine',
      testsCount: 6,
      included: ['Complete Blood Count (CBC)', 'Lipid Profile', 'Serum Creatinine', 'SGPT / ALT', 'Urine R/M/E', 'Fasting Blood Sugar (FBS)']
    },
    {
      id: 'grp-2',
      name: 'Diabetic Health Panel',
      category: 'Biochemistry',
      listPrice: 1800,
      yourPrice: 1400,
      enabled: true,
      description: 'Fasting Blood Sugar (FBS), HbA1c, Serum Creatinine, and Urine R/M/E',
      testsCount: 4,
      included: ['Fasting Blood Sugar (FBS)', 'HbA1c', 'Serum Creatinine', 'Urine Routine Examination']
    },
    {
      id: 'grp-3',
      name: 'Antenatal Care (ANC) Profile',
      category: 'Serology',
      listPrice: 2800,
      yourPrice: 2200,
      enabled: true,
      description: 'Complete Blood Count, Blood Grouping, VDRL, HBsAg, and Urine Routine',
      testsCount: 5,
      included: ['Complete Blood Count (CBC)', 'Blood Grouping & Rh Factor', 'VDRL / RPR', 'HBsAg Rapid Screen', 'Urine R/M/E']
    },
    {
      id: 'grp-4',
      name: 'Cardiac Risk Profile',
      category: 'Cardiology',
      listPrice: 3200,
      yourPrice: 2600,
      enabled: true,
      description: 'ECG, Lipid Profile, Troponin-I, and Serum Electrolytes',
      testsCount: 4,
      included: ['ECG (12 Lead)', 'Lipid Profile', 'Troponin-I (Quantitative)', 'Serum Electrolytes']
    }
  ]);

  // Reflex Rules State
  const [reflexRules, setReflexRules] = useState<ReflexRule[]>([
    {
      id: 'rr-1',
      triggerTest: 'Thyroid Stimulating Hormone (TSH)',
      triggerCategory: 'Hormone',
      condition: 'Greater than',
      threshold: '> 4.5 µIU/mL (Elevated)',
      reflexTest: 'Free Thyroxine (FT4) & Anti-TPO',
      reflexCategory: 'Hormone',
      autoAdd: true,
      active: true
    },
    {
      id: 'rr-2',
      triggerTest: 'Urine Routine Examination (R/M/E)',
      triggerCategory: 'Clinical Pathology',
      condition: 'Positive / Abnormal',
      threshold: 'Nitrite (+) or WBC > 10 /HPF',
      reflexTest: 'Urine Culture & Sensitivity (C&S)',
      reflexCategory: 'Microbiology',
      autoAdd: false,
      active: true
    },
    {
      id: 'rr-3',
      triggerTest: 'Total PSA (Prostate Specific Ag)',
      triggerCategory: 'Hormone',
      condition: 'Greater than',
      threshold: '> 4.0 ng/mL',
      reflexTest: 'Free PSA & Free/Total Ratio',
      reflexCategory: 'Biochemistry',
      autoAdd: true,
      active: true
    },
    {
      id: 'rr-4',
      triggerTest: 'Hepatitis B Surface Antigen (HBsAg)',
      triggerCategory: 'Serology',
      condition: 'Positive / Reactive',
      threshold: 'Reactive / Positive',
      reflexTest: 'HBV DNA Quantitative PCR & HBeAg',
      reflexCategory: 'Molecular Biology',
      autoAdd: false,
      active: true
    }
  ]);

  // Modals state
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('General Health');
  const [newGroupListPrice, setNewGroupListPrice] = useState<number>(2500);
  const [newGroupYourPrice, setNewGroupYourPrice] = useState<number>(2000);
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedTestsForGroup, setSelectedTestsForGroup] = useState<string[]>([]);

  // Add Reflex Rule Modal
  const [showReflexModal, setShowReflexModal] = useState(false);
  const [newTriggerTest, setNewTriggerTest] = useState('Thyroid Stimulating Hormone (TSH)');
  const [newCondition, setNewCondition] = useState('Greater than');
  const [newThreshold, setNewThreshold] = useState('> 5.0 µIU/mL');
  const [newReflexTest, setNewReflexTest] = useState('Free T3 (FT3)');
  const [newAutoAdd, setNewAutoAdd] = useState(true);

  // Replenish Stock Modal
  const [replenishTest, setReplenishTest] = useState<{ id: string; name: string; current: number } | null>(null);
  const [replenishQty, setReplenishQty] = useState<number>(50);

  // Filter individual tests
  const filteredTests = diagnosticTests.filter(t => {
    const matchSearch =
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(testSearch.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchSendOut =
      sendOutFilter === 'ALL' ||
      (sendOutFilter === 'SEND_OUT' && t.isSendOut) ||
      (sendOutFilter === 'IN_HOUSE' && !t.isSendOut);
    return matchSearch && matchCat && matchSendOut;
  });

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(panelSearch.toLowerCase()) ||
    g.category.toLowerCase().includes(panelSearch.toLowerCase())
  );

  const handleUpdateGroupPrice = (groupId: string, newPrice: number) => {
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, yourPrice: newPrice } : g))
    );
  };

  const handleToggleGroupEnable = (groupId: string) => {
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const handleSaveGroup = (group: (typeof groups)[0]) => {
    showToast(`Saved package price ৳${group.yourPrice} for ${group.name}`);
  };

  const handleTestFieldChange = (
    testId: string,
    field: keyof (typeof testSettings)[string],
    value: any
  ) => {
    setTestSettings(prev => ({
      ...prev,
      [testId]: {
        ...(prev[testId] || {
          price: 500,
          enabled: true,
          isSendOut: false,
          noDiscount: false,
          agentApp: true
        }),
        [field]: value
      }
    }));
  };

  const handleSaveIndividualTest = (testId: string, testName: string) => {
    const current = testSettings[testId];
    if (current) {
      updateTestPrice(testId, current.price);
    }
    showToast(`Saved settings for ${testName}`);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    const newG = {
      id: `grp-${Date.now()}`,
      name: newGroupName,
      category: newGroupCat,
      listPrice: newGroupListPrice,
      yourPrice: newGroupYourPrice,
      enabled: true,
      description: newGroupDesc || `${newGroupName} Comprehensive Bundle`,
      testsCount: selectedTestsForGroup.length || 3,
      included:
        selectedTestsForGroup.length > 0
          ? selectedTestsForGroup
          : ['CBC', 'Creatinine', 'FBS']
    };
    setGroups([...groups, newG]);
    setShowAddGroupModal(false);
    setNewGroupName('');
    setSelectedTestsForGroup([]);
    showToast(`Created panel group: ${newGroupName}`);
  };

  const handleCreateReflexRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newR: ReflexRule = {
      id: `rr-${Date.now()}`,
      triggerTest: newTriggerTest,
      triggerCategory: 'Biochemistry',
      condition: newCondition,
      threshold: newThreshold,
      reflexTest: newReflexTest,
      reflexCategory: 'Special Lab',
      autoAdd: newAutoAdd,
      active: true
    };
    setReflexRules([...reflexRules, newR]);
    setShowReflexModal(false);
    showToast(`Added reflex rule for ${newTriggerTest}`);
  };

  const handleReplenishStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replenishTest) return;
    updateTestStockCapacity(replenishTest.id, true, 10);
    showToast(`Replenished +${replenishQty} reagent tests for ${replenishTest.name}`);
    setReplenishTest(null);
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Investigations Catalog</h1>
          <p className="page-subtitle">
            Diagnostic Test Formats, Pricing, Packages & Reagent Stock Capacity
          </p>
        </div>

        <div className="page-actions">
          {activeTab === 'groups' && (
            <button className="btn btn-primary" onClick={() => setShowAddGroupModal(true)}>
              <Plus size={16} /> Add Group
            </button>
          )}
          {activeTab === 'reflex' && (
            <button className="btn btn-primary" onClick={() => setShowReflexModal(true)}>
              <Plus size={16} /> Add Reflex Rule
            </button>
          )}
          {activeTab === 'capacity' && (
            <button
              className="btn btn-secondary"
              onClick={() => showToast('Exporting test capacity XLS sheet')}
            >
              <Download size={14} /> Export XLS
            </button>
          )}
        </div>
      </div>

      {/* Subtabs Navigation matching SihatSuite */}
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
          Test Stock ({diagnosticTests.filter(t => t.trackStock).length || 14})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'reflex' ? 'active' : ''}`}
          onClick={() => setActiveTab('reflex')}
        >
          Reflex Rules ({reflexRules.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. INVESTIGATION CATALOG TAB (Split Panel Groups & Tests) */}
      {/* ========================================================= */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section A: Panel Groups */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Panel Groups
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Panel groups bundle multiple tests under one booking name and list price.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="table-search-input" style={{ width: '220px' }}>
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search group…"
                    value={panelSearch}
                    onChange={e => setPanelSearch(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddGroupModal(true)}
                >
                  <Plus size={14} /> + Add Group
                </button>
              </div>
            </div>

            <table className="custom-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>GROUP</th>
                  <th>CATEGORY</th>
                  <th style={{ textAlign: 'right' }}>LIST PRICE</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>YOUR PRICE</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>ENABLE</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>SAVE</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(grp => (
                  <tr key={grp.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#059669' }}>{grp.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {grp.testsCount} tests bundle · {grp.included.slice(0, 3).join(', ')}...
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-inhouse">{grp.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b', textDecoration: 'line-through' }}>
                      ৳{grp.listPrice.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>৳</span>
                        <input
                          type="number"
                          className="form-control"
                          style={{
                            width: '90px',
                            height: '30px',
                            textAlign: 'right',
                            fontWeight: 700,
                            padding: '2px 6px',
                            fontSize: '13px'
                          }}
                          value={grp.yourPrice}
                          onChange={e => handleUpdateGroupPrice(grp.id, Number(e.target.value) || 0)}
                        />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={grp.enabled}
                        onChange={() => handleToggleGroupEnable(grp.id)}
                        style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => handleSaveGroup(grp)}
                      >
                        SAVE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section B: Individual Tests Catalog */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Individual Tests
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Catalog of all laboratory tests offered in the diagnostic facility. Total: 1,022 tests.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="table-search-input" style={{ width: '260px' }}>
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search test name or code ( / )"
                    value={testSearch}
                    onChange={e => setTestSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-control"
                  style={{ width: '170px', height: '34px', fontSize: '12px' }}
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
                  <option value="Microbiology">Microbiology</option>
                </select>

                <select
                  className="form-control"
                  style={{ width: '130px', height: '34px', fontSize: '12px' }}
                  value={sendOutFilter}
                  onChange={e => setSendOutFilter(e.target.value)}
                >
                  <option value="ALL">All Sources</option>
                  <option value="IN_HOUSE">In-House Only</option>
                  <option value="SEND_OUT">Send-Out Only</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ margin: 0, minWidth: '1000px' }}>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>SAMPLE</th>
                    <th>TAT</th>
                    <th>UNIT</th>
                    <th style={{ textAlign: 'right', width: '110px' }}>PRICE</th>
                    <th style={{ textAlign: 'center', width: '70px' }}>ENABLE</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>SEND-OUT</th>
                    <th style={{ textAlign: 'center', width: '95px' }}>NO DISCOUNT</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>AGENT APP</th>
                    <th style={{ textAlign: 'center', width: '70px' }}>SAVE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map(test => {
                    const settings = testSettings[test.id] || {
                      price: test.price,
                      enabled: true,
                      isSendOut: test.isSendOut || false,
                      noDiscount: false,
                      agentApp: true
                    };

                    const tubeBadgeColor =
                      test.containerType?.includes('Purple') || test.containerType?.includes('EDTA')
                        ? '#7c3aed'
                        : test.containerType?.includes('Red') || test.containerType?.includes('Plain')
                        ? '#dc2626'
                        : test.containerType?.includes('Yellow') || test.containerType?.includes('Gel')
                        ? '#d97706'
                        : '#0284c7';

                    return (
                      <tr key={test.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: '#f1f5f9',
                                color: '#475569'
                              }}
                            >
                              {test.code}
                            </span>
                            <strong style={{ color: '#0f172a' }}>{test.name}</strong>
                          </div>
                          {test.bengaliName && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {test.bengaliName}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#334155' }}>{test.category}</span>
                        </td>
                        <td>
                          {test.sampleType !== 'None' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: tubeBadgeColor,
                                  display: 'inline-block'
                                }}
                              />
                              <span style={{ fontSize: '11px', color: '#475569' }}>
                                {test.sampleType}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {test.turnaroundHours ? `${test.turnaroundHours}h` : 'Same day'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                            {test.unit || '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>৳</span>
                            <input
                              type="number"
                              className="form-control"
                              style={{
                                width: '75px',
                                height: '28px',
                                textAlign: 'right',
                                fontWeight: 700,
                                padding: '2px 4px',
                                fontSize: '12px',
                                color: '#059669'
                              }}
                              value={settings.price}
                              onChange={e =>
                                handleTestFieldChange(test.id, 'price', Number(e.target.value) || 0)
                              }
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={e =>
                              handleTestFieldChange(test.id, 'enabled', e.target.checked)
                            }
                            style={{ accentColor: '#059669', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={settings.isSendOut}
                            onChange={e =>
                              handleTestFieldChange(test.id, 'isSendOut', e.target.checked)
                            }
                            style={{ accentColor: '#059669', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={settings.noDiscount}
                            onChange={e =>
                              handleTestFieldChange(test.id, 'noDiscount', e.target.checked)
                            }
                            style={{ accentColor: '#059669', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={settings.agentApp}
                            onChange={e =>
                              handleTestFieldChange(test.id, 'agentApp', e.target.checked)
                            }
                            style={{ accentColor: '#059669', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '10px' }}
                            onClick={() => handleSaveIndividualTest(test.id, test.name)}
                          >
                            SAVE
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GROUPS TAB                                             */}
      {/* ========================================================= */}
      {activeTab === 'groups' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="table-search-input">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search package or panel…"
                value={panelSearch}
                onChange={e => setPanelSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddGroupModal(true)}>
              <Plus size={15} /> + Add Group Package
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>PACKAGE / PANEL GROUP</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>INCLUDED TESTS</th>
                <th style={{ textAlign: 'right' }}>PRICE</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map(g => (
                <tr key={g.id}>
                  <td>
                    <strong style={{ color: '#059669', fontSize: '14px' }}>{g.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-inhouse">{g.category}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569', maxWidth: '300px' }}>
                    {g.description}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {g.included.map((inc, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '11px',
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {inc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '14px' }}>
                    ৳{g.yourPrice.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${g.enabled ? 'badge-paid' : 'badge-due'}`}>
                      {g.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => showToast(`Edit package ${g.name}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="icon-btn"
                        style={{ color: '#dc2626' }}
                        onClick={() => {
                          setGroups(groups.filter(x => x.id !== g.id));
                          showToast(`Removed package ${g.name}`);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TEST STOCK & CAPACITY TAB                             */}
      {/* ========================================================= */}
      {activeTab === 'capacity' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Reagent & Capacity Worklist
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Track machine analyzer throughput, kit lot runs, and alert thresholds.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => showToast('Exporting Test Stock report to CSV')}
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>TEST NAME</th>
                <th>CATEGORY</th>
                <th style={{ textAlign: 'center' }}>TRACK STOCK</th>
                <th style={{ textAlign: 'right' }}>CURRENT STOCK</th>
                <th style={{ textAlign: 'center' }}>ALERT THRESHOLD</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {diagnosticTests.slice(0, 15).map(t => {
                const isTracked = t.trackStock ?? true;
                const stock = t.stockUnits ?? 85;
                const threshold = t.alertThreshold ?? 20;
                const isLow = stock <= threshold;

                return (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {t.code}</div>
                    </td>
                    <td>{t.category}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isTracked}
                        onChange={e => updateTestStockCapacity(t.id, e.target.checked, threshold)}
                        style={{ accentColor: '#059669', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {isTracked ? (
                        <span style={{ color: isLow ? '#dc2626' : '#059669' }}>
                          {stock} tests
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Unrestricted</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '70px', height: '28px', textAlign: 'center', margin: '0 auto', fontSize: '12px' }}
                        defaultValue={threshold}
                        onChange={e => updateTestStockCapacity(t.id, isTracked, Number(e.target.value) || 10)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isTracked ? (
                        <span className={`badge ${isLow ? 'badge-due' : 'badge-paid'}`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      ) : (
                        <span className="badge badge-inhouse">Manual</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() =>
                          setReplenishTest({ id: t.id, name: t.name, current: stock })
                        }
                      >
                        + Replenish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. REFLEX RULES TAB                                      */}
      {/* ========================================================= */}
      {activeTab === 'reflex' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Automated Reflex Testing Rules
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Reflex rules automatically trigger downstream investigation orders when preliminary lab values fall outside clinical boundaries.
              </span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowReflexModal(true)}>
              <Plus size={15} /> + Add Reflex Rule
            </button>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>PRIMARY TRIGGER TEST</th>
                <th>CONDITION</th>
                <th>TRIGGER THRESHOLD</th>
                <th>DOWNSTREAM REFLEX TEST</th>
                <th style={{ textAlign: 'center' }}>AUTO-ADD</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {reflexRules.map(rr => (
                <tr key={rr.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{rr.triggerTest}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{rr.triggerCategory}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {rr.condition}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '12px' }}>
                      {rr.threshold}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRight size={14} color="#059669" />
                      <strong style={{ color: '#059669' }}>{rr.reflexTest}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', paddingLeft: '20px' }}>
                      {rr.reflexCategory}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${rr.autoAdd ? 'badge-paid' : 'badge-inhouse'}`}>
                      {rr.autoAdd ? 'Auto-Order' : 'Require Approval'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${rr.active ? 'badge-paid' : 'badge-due'}`}>
                      {rr.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="icon-btn"
                      style={{ color: '#dc2626' }}
                      onClick={() => {
                        setReflexRules(reflexRules.filter(r => r.id !== rr.id));
                        showToast(`Removed reflex rule for ${rr.triggerTest}`);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Add Panel Group Package                            */}
      {/* ========================================================= */}
      {showAddGroupModal && (
        <div className="modal-backdrop" onClick={() => setShowAddGroupModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Panel Package Group</h3>
              <button className="icon-btn" onClick={() => setShowAddGroupModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Panel Group Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Executive Health Checkup Package"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newGroupCat}
                      onChange={e => setNewGroupCat(e.target.value)}
                    >
                      <option>General Health</option>
                      <option>Biochemistry</option>
                      <option>Haematology</option>
                      <option>Serology</option>
                      <option>Cardiology</option>
                      <option>Antenatal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">List Price (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newGroupListPrice}
                      onChange={e => setNewGroupListPrice(Number(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Price (৳) *</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ fontWeight: 700, color: '#059669' }}
                      value={newGroupYourPrice}
                      onChange={e => setNewGroupYourPrice(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Inclusions</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Clinical indications and bundled tests overview..."
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Select Included Tests</label>
                  <div
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px'
                    }}
                  >
                    {diagnosticTests.slice(0, 16).map(t => {
                      const isChecked = selectedTestsForGroup.includes(t.name);
                      return (
                        <label
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            background: isChecked ? '#ecfdf5' : 'transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedTestsForGroup([...selectedTestsForGroup, t.name]);
                              } else {
                                setSelectedTestsForGroup(
                                  selectedTestsForGroup.filter(x => x !== t.name)
                                );
                              }
                            }}
                            style={{ accentColor: '#059669' }}
                          />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {t.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddGroupModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Panel Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Add Reflex Rule                                    */}
      {/* ========================================================= */}
      {showReflexModal && (
        <div className="modal-backdrop" onClick={() => setShowReflexModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Configure Reflex Rule</h3>
              <button className="icon-btn" onClick={() => setShowReflexModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateReflexRule}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Trigger Test *</label>
                  <select
                    className="form-control"
                    value={newTriggerTest}
                    onChange={e => setNewTriggerTest(e.target.value)}
                  >
                    {diagnosticTests.slice(0, 15).map(t => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select
                      className="form-control"
                      value={newCondition}
                      onChange={e => setNewCondition(e.target.value)}
                    >
                      <option>Greater than</option>
                      <option>Less than</option>
                      <option>Positive / Abnormal</option>
                      <option>Outside Reference Range</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Threshold Value</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. > 4.5 µIU/mL"
                      value={newThreshold}
                      onChange={e => setNewThreshold(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reflex Test to Trigger *</label>
                  <select
                    className="form-control"
                    value={newReflexTest}
                    onChange={e => setNewReflexTest(e.target.value)}
                  >
                    {diagnosticTests.slice(10, 25).map(t => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={newAutoAdd}
                    onChange={e => setNewAutoAdd(e.target.checked)}
                    style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                  />
                  <span>Automatically append reflex test to patient invoice & specimen worklist</span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReflexModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Reflex Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Replenish Reagent Stock                            */}
      {/* ========================================================= */}
      {replenishTest && (
        <div className="modal-backdrop" onClick={() => setReplenishTest(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Replenish Reagent Stock</h3>
              <button className="icon-btn" onClick={() => setReplenishTest(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReplenishStock}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Test: <strong>{replenishTest.name}</strong></div>
                  <div style={{ color: '#64748b', marginTop: '4px' }}>
                    Current in stock: <strong>{replenishTest.current} tests</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Add Tests / Runs *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={replenishQty}
                    onChange={e => setReplenishQty(Number(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReplenishTest(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
