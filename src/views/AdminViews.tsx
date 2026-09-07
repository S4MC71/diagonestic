import React from 'react';

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
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#059669' }}>{r.name}</h3>
              <span className="badge badge-inhouse">{r.users} User{r.users > 1 ? 's' : ''}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{r.desc}</p>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>
              ✓ Permissions Configured
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   RE-EXPORT DEDICATED ADMIN VIEWS
   ========================================================================== */
export { UsersView } from './UsersView';
export { SubscriptionView } from './SubscriptionView';
export { SupportView } from './SupportView';
export { SettingsView } from './settings/SettingsView';
