import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  FlaskConical,
  Package,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ActionItem {
  id: string;
  category: 'Lab' | 'Finance' | 'Pharmacy';
  urgency: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  recordRef: string;
  triggerReason: string;
  assignedTo: string;
  createdAt: string;
  status: 'Open' | 'Resolved';
  actionRoute: string;
}

export const ActionInboxView: React.FC = () => {
  const { showToast, setCurrentView, users } = useApp();
  const [activeTab, setActiveTab] = useState<'Open' | 'Resolved'>('Open');
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'act-1',
      category: 'Lab',
      urgency: 'High',
      title: 'Lab Report Verification Exceeded 24h SLA',
      description: 'Complete Blood Count (CBC) with ESR for Begum Rokeya was collected 28 hours ago and is still pending final pathologist sign-off.',
      recordRef: 'INV-2026-0002',
      triggerReason: 'Overdue lab turnaround time (< 24h target)',
      assignedTo: 'Dr. Nusrat Jahan (Pathologist)',
      createdAt: 'Today, 08:30 AM',
      status: 'Open',
      actionRoute: 'lab-reports'
    },
    {
      id: 'act-2',
      category: 'Finance',
      urgency: 'High',
      title: 'Aged Patient Invoice Due Balance (> 30 Days)',
      description: 'Patient Haji Nurul Haque has an outstanding balance of ৳450 on invoice INV-2026-0002 for over 32 days.',
      recordRef: 'INV-2026-0002',
      triggerReason: 'Unpaid diagnostic receivable >= 30 days old',
      assignedTo: 'lifecare_admin',
      createdAt: 'Yesterday',
      status: 'Open',
      actionRoute: 'payments'
    },
    {
      id: 'act-3',
      category: 'Pharmacy',
      urgency: 'Medium',
      title: 'Pharmacy Batch Reaching 45-Day Expiry Window',
      description: 'Almex 400mg Suspension (Batch #BT-4410, 15 bottles remaining) will expire within 38 days. Action required for supplier return or clearance.',
      recordRef: 'BT-4410',
      triggerReason: 'Active pharmacy stock batch within expiry threshold',
      assignedTo: 'Tanvir Hossain (Storekeeper)',
      createdAt: '15 Sept',
      status: 'Open',
      actionRoute: 'pharmacy-products'
    }
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Action inbox refreshed from active database records.');
    }, 400);
  };

  const handleResolveAction = (id: string) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
    showToast('Action marked as resolved!');
  };

  const handleAssignColleague = (id: string, name: string) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, assignedTo: name } : a))
    );
    showToast(`Assigned action to ${name}`);
  };

  const openActions = actions.filter(a => a.status === 'Open');
  const resolvedActions = actions.filter(a => a.status === 'Resolved');
  const displayItems = activeTab === 'Open' ? openActions : resolvedActions;

  return (
    <div className="view-container" style={{ maxWidth: '1160px', margin: '0 auto' }}>
      {/* ====================================================================
          PAGE HEADER (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', marginBottom: '6px' }}>
            KEEP WORK MOVING
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Owner’s action inbox
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Prioritised follow-ups from your current records. Assign a colleague, record the next step, and close the loop.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} /> Refresh inbox
        </button>
      </div>

      {/* ====================================================================
          COLLAPSIBLE "What appears here?" DRAWER (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          background: '#ffffff',
          marginBottom: '20px',
          overflow: 'hidden'
        }}
      >
        <button
          type="button"
          onClick={() => setIsExplainOpen(!isExplainOpen)}
          style={{
            width: '100%',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> What appears here?
          </span>
          {isExplainOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </button>

        {isExplainOpen && (
          <div style={{ padding: '0 18px 16px 18px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
            <div style={{ marginTop: '10px' }}>
              <strong>Automatic Triggers:</strong>
              <ul style={{ margin: '6px 0 10px 0', paddingLeft: '18px' }}>
                <li><strong>Overdue lab reports:</strong> Diagnostic tests where specimen was collected &gt;24 hours ago and results are unapproved.</li>
                <li><strong>Aged Receivables:</strong> Diagnostic invoices and pharmacy bills with unpaid due balance &gt;=30 days old.</li>
                <li><strong>Expiring Stock Batches:</strong> Active medication batches entering the 45-day manufacturer return window.</li>
              </ul>
              <strong>Policy:</strong> Resolving an action removes it from the queue without altering financial ledgers or test approval statuses directly.
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          TABS: Open vs Resolved (MATCHING SIHATSUITE)
          ==================================================================== */}
      <div className="subtabs-bar" style={{ marginBottom: '20px' }}>
        <button
          className={`subtab-btn ${activeTab === 'Open' ? 'active' : ''}`}
          onClick={() => setActiveTab('Open')}
        >
          Open ({openActions.length})
        </button>
        <button
          className={`subtab-btn ${activeTab === 'Resolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('Resolved')}
        >
          Resolved ({resolvedActions.length})
        </button>
      </div>

      {/* ====================================================================
          ACTION CARDS LIST
          ==================================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {openActions.length} open actions · Highest urgency first
        </div>

        {displayItems.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '48px',
              textAlign: 'center',
              color: '#94a3b8',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <CheckCircle2 size={40} style={{ margin: '0 auto 12px', color: '#10b981' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Nothing needs your attention here
            </h3>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Actions appear automatically when an accessible record meets the rules above.
            </p>
          </div>
        ) : (
          displayItems.map(item => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                borderLeft: item.urgency === 'High' ? '4px solid #dc2626' : '4px solid #f59e0b'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      className="badge"
                      style={{
                        background:
                          item.category === 'Lab' ? '#ecfdf5' :
                          item.category === 'Finance' ? '#eff6ff' : '#fef3c7',
                        color:
                          item.category === 'Lab' ? '#059669' :
                          item.category === 'Finance' ? '#2563eb' : '#b45309',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: item.urgency === 'High' ? '#fee2e2' : '#fef3c7',
                        color: item.urgency === 'High' ? '#b91c1c' : '#b45309',
                        fontSize: '11px'
                      }}
                    >
                      {item.urgency} Urgency
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Ref: <strong>{item.recordRef}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Triggered by: <em>{item.triggerReason}</em> · {item.createdAt}
                  </div>
                </div>

                {/* Actions & Colleague Assignment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      Assigned Colleague:
                    </label>
                    <select
                      className="form-control form-control-sm"
                      value={item.assignedTo}
                      onChange={e => handleAssignColleague(item.id, e.target.value)}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="Unassigned">-- Unassigned --</option>
                      <option value="Dr. Nusrat Jahan (Pathologist)">Dr. Nusrat Jahan</option>
                      <option value="Md. Al-Amin (Receptionist)">Md. Al-Amin</option>
                      <option value="Tanvir Hossain (Storekeeper)">Tanvir Hossain</option>
                      <option value="lifecare_admin">Global Admin</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ flex: 1, fontSize: '11px' }}
                      onClick={() => setCurrentView(item.actionRoute as any)}
                    >
                      Open Record <ExternalLink size={12} />
                    </button>

                    {item.status === 'Open' ? (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ flex: 1, fontSize: '11px' }}
                        onClick={() => handleResolveAction(item.id)}
                      >
                        <CheckCircle2 size={12} /> Resolve
                      </button>
                    ) : (
                      <span className="badge badge-paid" style={{ alignSelf: 'center', fontSize: '11px' }}>
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
