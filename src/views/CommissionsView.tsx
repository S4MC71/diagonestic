import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommissionRule } from '../types';
import { Percent, Search, Download, Plus, DollarSign, Check, X, Filter } from 'lucide-react';

export const CommissionsView: React.FC = () => {
  const {
    doctors,
    commissionRules,
    commissionEntries,
    addCommissionRule,
    disburseCommission,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'agents' | 'rules' | 'entries' | 'report'>('agents');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseDocId, setDisburseDocId] = useState(doctors[0]?.id || '');
  const [disburseAmount, setDisburseAmount] = useState<number>(5000);

  // Add Rule Form State
  const [ruleAgentId, setRuleAgentId] = useState(doctors[0]?.id || '');
  const [ruleScope, setRuleScope] = useState<'General' | 'Specific Test' | 'Category'>('General');
  const [ruleType, setRuleType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [ruleValue, setRuleValue] = useState<number>(25);
  const [tierJson, setTierJson] = useState('{"tiers":[{"from":0,"to":1000,"value":5}]}');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === ruleAgentId);
    addCommissionRule({
      agentId: ruleAgentId,
      agentName: doc?.name || 'Agent',
      scope: ruleScope,
      calculationType: ruleType,
      value: ruleValue,
      tierJson,
      status: 'Active'
    });
    setShowAddRuleModal(false);
  };

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (disburseAmount <= 0) return;
    disburseCommission(disburseDocId, disburseAmount);
    setShowDisburseModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Commission Management</h1>
          <p className="page-subtitle">Manage agents, rules, and entries. Open the Report tab for business volume by agent.</p>
        </div>

        <div className="page-actions">
          {activeTab === 'rules' && (
            <button className="btn btn-primary" onClick={() => setShowAddRuleModal(true)}>
              <Plus size={16} /> Add Rule
            </button>
          )}
          {activeTab === 'agents' && (
            <button className="btn btn-primary" onClick={() => setShowDisburseModal(true)}>
              <DollarSign size={16} /> Disburse Commission
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => showToast('Commission report exported as CSV')}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="subtabs-bar">
        <button
          className={`subtab-btn ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          Agents ({doctors.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules ({commissionRules.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          Entries ({commissionEntries.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Report
        </button>
      </div>

      {/* 1. AGENTS TAB */}
      {activeTab === 'agents' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Agent / Doctor Name</th>
                <th>Specialty & Clinic</th>
                <th>Rule Applied</th>
                <th style={{ textAlign: 'right' }}>Total Billed Volume</th>
                <th style={{ textAlign: 'right' }}>Commission Earned</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th style={{ textAlign: 'right' }}>Payable Due</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => {
                const due = Math.max(0, d.totalCommissionEarned - d.totalCommissionPaid);
                return (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.specialty}</td>
                    <td>
                      <span className="badge badge-inhouse">
                        {d.commissionType === 'percentage' ? `${d.commissionValue}% of Net` : `৳${d.commissionValue}/test`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>৳{(d.totalReferrals * 850).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>৳{d.totalCommissionEarned.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a' }}>৳{d.totalCommissionPaid.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: due > 0 ? '#dc2626' : '#64748b' }}>
                      ৳{due.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. RULES TAB */}
      {activeTab === 'rules' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Rule Scope</th>
                <th>Calculation Type</th>
                <th>Commission Rate</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {commissionRules.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.agentName}</strong></td>
                  <td>{r.scope}</td>
                  <td>{r.calculationType}</td>
                  <td>
                    <strong style={{ color: '#059669' }}>
                      {r.calculationType === 'Percentage' ? `${r.value}%` : `৳${r.value}`}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-paid">{r.status}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => showToast('Editing rule')}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Invoice</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Billed</th>
                <th>Rate</th>
                <th style={{ textAlign: 'right' }}>Commission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {commissionEntries.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.doctorName}</strong></td>
                  <td><span style={{ color: '#059669', fontWeight: 600 }}>{e.invoiceNo}</span></td>
                  <td>{e.date}</td>
                  <td style={{ textAlign: 'right' }}>৳{e.billedAmount.toFixed(2)}</td>
                  <td>{e.commissionRate}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                    ৳{e.commissionAmount.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${e.status === 'Disbursed' ? 'badge-paid' : 'badge-partial'}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. REPORT TAB */}
      {activeTab === 'report' && (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            September 2026 Monthly Commission Settlement
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>TOTAL ACCRUED COMMISSIONS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>৳96,900</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>TOTAL PAID COMMISSIONS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>৳79,600</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>PENDING PAYABLE BALANCE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>৳17,300</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="modal-backdrop" onClick={() => setShowAddRuleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Commission Rule</h3>
              <button className="icon-btn" onClick={() => setShowAddRuleModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateRule}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Agent / Doctor *</label>
                  <select
                    className="form-control"
                    value={ruleAgentId}
                    onChange={e => setRuleAgentId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Rule Scope</label>
                    <select
                      className="form-control"
                      value={ruleScope}
                      onChange={e => setRuleScope(e.target.value as any)}
                    >
                      <option>General</option>
                      <option>Specific Test</option>
                      <option>Category</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Calculation Type</label>
                    <select
                      className="form-control"
                      value={ruleType}
                      onChange={e => setRuleType(e.target.value as any)}
                    >
                      <option>Percentage</option>
                      <option>Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Commission Value ({ruleType === 'Percentage' ? '%' : '৳'}) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ruleValue}
                    onChange={e => setRuleValue(Number(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tier JSON Configuration (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tierJson}
                    onChange={e => setTierJson(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddRuleModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {showDisburseModal && (
        <div className="modal-backdrop" onClick={() => setShowDisburseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Disburse Doctor Commission</h3>
              <button className="icon-btn" onClick={() => setShowDisburseModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleDisburse}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Doctor *</label>
                  <select
                    className="form-control"
                    value={disburseDocId}
                    onChange={e => setDisburseDocId(e.target.value)}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Due: ৳{Math.max(0, d.totalCommissionEarned - d.totalCommissionPaid)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payout Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={disburseAmount}
                    onChange={e => setDisburseAmount(Number(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDisburseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
