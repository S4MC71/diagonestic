import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Award,
  HelpCircle,
  Settings as SettingsIcon,
  UserPlus,
  Building,
  Printer,
  FileText,
  MessageCircle,
  CheckCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

/* ==========================================================================
   USERS VIEW
   ========================================================================== */
export const UsersView: React.FC = () => {
  const { users, showToast } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users & Staff Management</h1>
          <p className="page-subtitle">Center Operators, Receptionists, Pathologists & Role Allocations</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add Team Member
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name & Username</th>
              <th>Assigned Role</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>@{u.username}</div>
                </td>
                <td>
                  <span className="badge badge-inhouse">{u.role}</span>
                </td>
                <td>{u.phone} | {u.email}</td>
                <td>
                  <span className="badge badge-paid">Active</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Password reset link sent to ${u.email}`)}>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create User Account</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-control" placeholder="Staff Full Name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input type="text" className="form-control" placeholder="e.g. receptionist_01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password *</label>
                  <input type="password" className="form-control" placeholder="Strong Password" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Role *</label>
                <select className="form-control">
                  <option>Receptionist / Billing Clerk</option>
                  <option>Medical Technologist / Pathologist</option>
                  <option>Pharmacist / Counter Sales</option>
                  <option>Center Manager</option>
                  <option>Accountant</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Upload Digital Signature (PNG)</label>
                <input type="file" className="form-control" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowAddModal(false); showToast('User created successfully'); }}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   ROLES & PERMISSIONS VIEW
   ========================================================================== */
export const RolesView: React.FC = () => {
  const roles = [
    { name: 'Global Tenant Admin', users: 1, desc: 'Full administrative access across all 31 diagnostic center modules.' },
    { name: 'Center Manager', users: 1, desc: 'Operational supervision, staff management, and discounts approval.' },
    { name: 'Receptionist / Billing Clerk', users: 2, desc: 'Patient registration, investigation billing, receipt printing, serial booking.' },
    { name: 'Medical Technologist / Pathologist', users: 2, desc: 'Result entry, specimen tracking, lab report sign-off.' },
    { name: 'Doctor / Consultant', users: 4, desc: 'Electronic prescription writing, patient clinical history review.' },
    { name: 'Pharmacist / Counter Sales', users: 2, desc: 'Medicine retail sales terminal, cart checkout, stock reception.' },
    { name: 'Phlebotomist / Collector', users: 1, desc: 'Specimen draw recording, home sample collection visits.' },
    { name: 'Accountant', users: 1, desc: 'Operating expenses, cashbook ledger, doctor commission disbursement.' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles & Access Permissions</h1>
          <p className="page-subtitle">Security Access Control, Permission Granularity & Department Boundaries</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
        {roles.map((r, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#073f8f' }}>{r.name}</h3>
              <span className="badge badge-inhouse">{r.users} User{r.users > 1 ? 's' : ''}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{r.desc}</p>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#10b9b3', fontWeight: 600 }}>
              ✓ Permissions Configured
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   SUBSCRIPTION VIEW
   ========================================================================== */
export const SubscriptionView: React.FC = () => {
  return (
    <div style={{ maxWidth: '780px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription & Licensing</h1>
          <p className="page-subtitle">Active Cloud Plan, Diagnostic Operations Tier & License Renewals</p>
        </div>
      </div>

      <div className="card" style={{ borderTop: '4px solid #10b9b3', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0d7671', fontWeight: 700 }}>
              CURRENT PLAN
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
              All-in-One Healthcare Operations Suite
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Diagnostic Center + Digital Prescription + Pharmacy Retail POS Bundle
            </p>
          </div>

          <span className="badge badge-paid" style={{ padding: '6px 14px', fontSize: '12px' }}>
            ✓ Active License
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', margin: '20px 0' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>BILLING CYCLE</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Annual Cloud</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>NEXT RENEWAL DATE</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#073f8f' }}>Aug 28, 2027</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>WHATSAPP CREDITS</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>100 Messages</div>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: '#334155' }}>
          <strong>Included Features:</strong> Unlimited Diagnostic Invoicing, Thermal & A4 Print Templates, WhatsApp Bangla Delivery, Multi-Doctor Referral Commission Engine, Cloud Automatic Backup.
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   SUPPORT VIEW
   ========================================================================== */
export const SupportView: React.FC = () => {
  const { showToast } = useApp();
  const [ticketType, setTicketType] = useState('Bug');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Support ticket submitted! Support team will email you shortly.');
    setTitle('');
    setDetails('');
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support & Feedback</h1>
          <p className="page-subtitle">Report Bugs, Request Features, or Contact Bangladesh Support Desk</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select className="form-control" value={ticketType} onChange={e => setTicketType(e.target.value)}>
              <option value="Bug">Bug Report</option>
              <option value="Improvement">Improvement Suggestion</option>
              <option value="Feedback">General Feedback</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Details *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe the issue or feature in detail…"
              value={details}
              onChange={e => setDetails(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Submit Issue to Support
          </button>
        </form>
      </div>
    </div>
  );
};

export { SettingsView } from './settings/SettingsView';
