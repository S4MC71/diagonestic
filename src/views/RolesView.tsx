import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Plus,
  Search,
  Sliders,
  Eye,
  Trash2,
  Check,
  X,
  Copy,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface RolePermissionGroup {
  module: string;
  permissions: {
    id: string;
    label: string;
    description: string;
  }[];
}

const PERMISSION_MODULES: RolePermissionGroup[] = [
  {
    module: 'Patients',
    permissions: [
      { id: 'patients.read', label: 'Read Patients', description: 'View patient lists, demographic details and patient codes.' },
      { id: 'patients.create', label: 'Create Patients', description: 'Register new patients and generate codes.' },
      { id: 'patients.update', label: 'Update Patients', description: 'Edit patient personal details, phone, and address.' },
      { id: 'patients.delete', label: 'Delete Patients', description: 'Remove patient records permanently.' }
    ]
  },
  {
    module: 'Invoices & Billing',
    permissions: [
      { id: 'invoices.read', label: 'Read Invoices', description: 'View invoices, bills and receipt records.' },
      { id: 'invoices.create', label: 'Create Invoices', description: 'Bill investigations and doctor consultations.' },
      { id: 'invoices.update', label: 'Update Invoices', description: 'Modify line items, discounts or notes on bills.' },
      { id: 'invoices.confirm', label: 'Confirm & Collect', description: 'Record cash/card/mobile financial payments.' },
      { id: 'invoices.refund', label: 'Process Returns/Refunds', description: 'Issue refunds and cancelled test adjustments.' },
      { id: 'invoices.delete', label: 'Cancel/Delete Invoices', description: 'Void or remove unpaid invoices.' }
    ]
  },
  {
    module: 'Prescriptions',
    permissions: [
      { id: 'prescriptions.read', label: 'Read Prescriptions', description: 'View clinical prescriptions and past doctor histories.' },
      { id: 'prescriptions.create', label: 'Write Prescriptions', description: 'Compose e-prescriptions, clinical findings and advice.' },
      { id: 'prescriptions.print', label: 'Print Prescriptions', description: 'Print on plain paper or pre-printed pad.' },
      { id: 'prescriptions.delete', label: 'Delete Prescriptions', description: 'Remove saved prescriptions.' }
    ]
  },
  {
    module: 'Chambers & Appointments',
    permissions: [
      { id: 'chambers.read', label: 'Read Chambers', description: 'View visiting doctors and chamber schedules.' },
      { id: 'chambers.manage', label: 'Manage Chambers', description: 'Create and configure consultant chambers.' },
      { id: 'appointments.book', label: 'Book Appointments', description: 'Schedule serials and patient consultation visits.' },
      { id: 'appointments.queue', label: 'Manage Waiting Room', description: 'Track live queue order and token callouts.' }
    ]
  },
  {
    module: 'Investigations & Catalog',
    permissions: [
      { id: 'investigations.read', label: 'Read Catalog', description: 'Browse test catalog, normal ranges, and groups.' },
      { id: 'investigations.create', label: 'Create Tests & Panels', description: 'Add new investigations and test parameter panels.' },
      { id: 'investigations.pricing', label: 'Update Pricing', description: 'Adjust test retail price and discount rules.' },
      { id: 'investigations.reflex', label: 'Configure Reflex Rules', description: 'Set automatic reflex and conditional test triggers.' }
    ]
  },
  {
    module: 'Lab Reports',
    permissions: [
      { id: 'reports.read', label: 'Read Lab Reports', description: 'View pathology reports and patient results history.' },
      { id: 'reports.entry', label: 'Enter Test Results', description: 'Input numeric/text lab values and notes.' },
      { id: 'reports.verify', label: 'Verify Reports', description: 'Doctor verification and clinical validation.' },
      { id: 'reports.approve', label: 'Approve & Release', description: 'Final sign-off and release for patient delivery.' },
      { id: 'reports.print', label: 'Print Official Reports', description: 'Generate formatted PDF/printouts with signatures.' },
      { id: 'reports.delete', label: 'Delete Reports', description: 'Discard or remove report entries.' }
    ]
  },
  {
    module: 'Samples & Phlebotomy',
    permissions: [
      { id: 'samples.read', label: 'Read Samples', description: 'View specimen collection queues.' },
      { id: 'samples.collect', label: 'Collect Specimen', description: 'Mark tubes as drawn and assign barcode labels.' },
      { id: 'samples.barcode', label: 'Print Barcode Labels', description: 'Thermal barcode sticker printing.' },
      { id: 'samples.reject', label: 'Reject Specimen', description: 'Flag hemolyzed, clotted or rejected samples.' }
    ]
  },
  {
    module: 'Pharmacy Counter (POS)',
    permissions: [
      { id: 'pharmacy.counter', label: 'Access POS Counter', description: 'Operate retail sales counter and barcode register.' },
      { id: 'pharmacy.sell', label: 'Sell Medicines', description: 'Checkout carts, cash collection and thermal receipt.' },
      { id: 'pharmacy.return', label: 'Process Returns', description: 'Take back undamaged strips and issue refunds.' },
      { id: 'pharmacy.discounts', label: 'Special Discounts', description: 'Override default price or apply item-level discounts.' }
    ]
  },
  {
    module: 'Pharmacy Inventory',
    permissions: [
      { id: 'pharmacy.products', label: 'Manage Products', description: 'Add and edit medicine brands, strengths and generics.' },
      { id: 'pharmacy.purchases', label: 'Receive Purchases', description: 'Log supplier purchase bills and batch expiry.' },
      { id: 'pharmacy.suppliers', label: 'Manage Suppliers', description: 'Track pharmaceutical distributors and dues.' },
      { id: 'pharmacy.reports', label: 'Pharmacy Reports', description: 'View fast-moving lines and expiry alerts.' }
    ]
  },
  {
    module: 'General Inventory',
    permissions: [
      { id: 'inventory.read', label: 'Read Inventory', description: 'View lab reagents, tubes, and stationary stock.' },
      { id: 'inventory.receive', label: 'Receive Stock Items', description: 'Record batch replenishment.' },
      { id: 'inventory.requisitions', label: 'Requisitions', description: 'Submit store requisitions and department requests.' },
      { id: 'inventory.adjust', label: 'Adjust Quantities', description: 'Stock take count adjustments and wastage log.' }
    ]
  },
  {
    module: 'Referral Commissions',
    permissions: [
      { id: 'commissions.read', label: 'View Commission Ledger', description: 'View accrued referral commissions and logs.' },
      { id: 'commissions.rules', label: 'Configure Commission Rules', description: 'Set percentage and fixed cut rates per agent/doctor.' },
      { id: 'commissions.disburse', label: 'Disburse Payouts', description: 'Record cash/mobile commission payments to agents.' }
    ]
  },
  {
    module: 'Accounting & Finance',
    permissions: [
      { id: 'accounting.cashbook', label: 'View Cash Book', description: 'Inspect daily shift collections and register summary.' },
      { id: 'accounting.expenses', label: 'Record Operating Expenses', description: 'Log utility, rent, tea, transport and lab expenses.' },
      { id: 'accounting.income', label: 'Record Other Income', description: 'Miscellaneous revenue and external fees.' },
      { id: 'accounting.staff', label: 'Staff Payroll Ledger', description: 'Monthly salary disbursements and advances.' },
      { id: 'accounting.pnl', label: 'Profit & Loss Reports', description: 'Financial statements and business analytics.' }
    ]
  },
  {
    module: 'Team & User Management',
    permissions: [
      { id: 'users.read', label: 'View Users & Roles', description: 'See staff directory and access role lists.' },
      { id: 'users.create', label: 'Create Users', description: 'Provision new employee credentials.' },
      { id: 'users.roles', label: 'Assign & Edit Roles', description: 'Grant or revoke permissions and user titles.' },
      { id: 'users.passwords', label: 'Reset Passwords', description: 'Reset access passwords for other team members.' },
      { id: 'users.deactivate', label: 'Deactivate Accounts', description: 'Block login access for resigned staff.' }
    ]
  },
  {
    module: 'System Settings',
    permissions: [
      { id: 'settings.profile', label: 'Center Profile', description: 'Edit hospital name, logo, licenses, and address.' },
      { id: 'settings.reports', label: 'Letterhead & Margins', description: 'Configure A4/A5 print pad margins and prefixes.' },
      { id: 'settings.footers', label: 'Signatures & Footers', description: 'Manage pathologist signatures and QR code verification.' },
      { id: 'settings.whatsapp', label: 'WhatsApp Gateway', description: 'Manage automated patient WhatsApp alerts.' },
      { id: 'settings.subscription', label: 'Manage Subscription', description: 'Renew tier and view payment invoices.' }
    ]
  }
];

// Helper: Calculate total permissions count (70)
const ALL_PERMISSION_IDS = PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.id));
const TOTAL_PERMISSIONS_COUNT = ALL_PERMISSION_IDS.length;

export interface AppRoleItem {
  id: string;
  name: string;
  type: 'GLOBAL · READ-ONLY' | 'CUSTOM';
  usersCount: number;
  permissions: string[];
  description: string;
}

const INITIAL_ROLES: AppRoleItem[] = [
  {
    id: 'role-1',
    name: 'Doctor',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 1,
    permissions: [
      'patients.read', 'prescriptions.read', 'prescriptions.create', 'prescriptions.print',
      'chambers.read', 'appointments.book', 'appointments.queue', 'reports.read',
      'investigations.read', 'pharmacy.counter', 'pharmacy.products'
    ],
    description: 'Visiting consultant or resident doctor. Focuses on clinical history, consultation appointments, and e-prescribing.'
  },
  {
    id: 'role-2',
    name: 'Global Account Manager',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'invoices.read', 'accounting.cashbook', 'accounting.expenses', 'accounting.income',
      'accounting.staff', 'accounting.pnl', 'commissions.read', 'commissions.disburse',
      'users.read', 'settings.profile'
    ],
    description: 'Financial auditor and center accountant. Manages day books, expense vouchers, and doctor commission ledgers.'
  },
  {
    id: 'role-3',
    name: 'Global Auditor',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'patients.read', 'invoices.read', 'reports.read', 'accounting.cashbook',
      'accounting.expenses', 'accounting.pnl', 'commissions.read', 'inventory.read'
    ],
    description: 'Read-only financial and clinical auditor. Can inspect ledgers and reports without modifying data.'
  },
  {
    id: 'role-4',
    name: 'Global Corporate Coordinator',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'patients.read', 'patients.create', 'invoices.read', 'invoices.create',
      'commissions.read', 'commissions.rules', 'investigations.read'
    ],
    description: 'Corporate client and executive health checkup coordinator. Handles company tie-ups and package billing.'
  },
  {
    id: 'role-5',
    name: 'Global Doctor',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'patients.read', 'prescriptions.read', 'prescriptions.create', 'prescriptions.print',
      'chambers.read', 'appointments.queue', 'reports.read', 'reports.verify'
    ],
    description: 'Primary clinical consultant with authorization to review lab reports alongside prescription writing.'
  },
  {
    id: 'role-6',
    name: 'Global Field Agent',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: ['patients.read', 'patients.create', 'samples.read', 'samples.collect'],
    description: 'External home collection and mobile phlebotomy representative.'
  },
  {
    id: 'role-7',
    name: 'Global Lab Technologist',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'patients.read', 'samples.read', 'samples.collect', 'samples.barcode',
      'samples.reject', 'reports.read', 'reports.entry', 'reports.verify',
      'reports.print', 'investigations.read', 'inventory.read', 'inventory.requisitions'
    ],
    description: 'Laboratory technician and technologist. Enters biochemical and hematological results and operates analyzers.'
  },
  {
    id: 'role-8',
    name: 'Global Pharmacy Counter',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'pharmacy.counter', 'pharmacy.sell', 'pharmacy.return', 'pharmacy.discounts',
      'pharmacy.products'
    ],
    description: 'Pharmacy point-of-sale terminal cashier and medicine dispenser.'
  },
  {
    id: 'role-9',
    name: 'Global Pharmacy Manager',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'pharmacy.counter', 'pharmacy.sell', 'pharmacy.return', 'pharmacy.discounts',
      'pharmacy.products', 'pharmacy.purchases', 'pharmacy.suppliers', 'pharmacy.reports'
    ],
    description: 'Head of dispensary. Oversees stock purchases, vendor accounts, and counter staff.'
  },
  {
    id: 'role-10',
    name: 'Global Reception',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'patients.read', 'patients.create', 'patients.update', 'invoices.read',
      'invoices.create', 'invoices.confirm', 'appointments.book', 'appointments.queue',
      'reports.read', 'reports.print', 'investigations.read'
    ],
    description: 'Front desk receptionist. Handles patient intake, bill generation, thermal receipt print, and serial queue.'
  },
  {
    id: 'role-11',
    name: 'Global Storekeeper',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 0,
    permissions: [
      'inventory.read', 'inventory.receive', 'inventory.requisitions', 'inventory.adjust'
    ],
    description: 'Warehouse and central reagent storekeeper. Manages supplies, lot numbers, and reorder levels.'
  },
  {
    id: 'role-12',
    name: 'Global Tenant Admin',
    type: 'GLOBAL · READ-ONLY',
    usersCount: 1,
    permissions: [...ALL_PERMISSION_IDS], // Full 70 of 70
    description: 'Master administrative superuser. Unrestricted access across all operational, financial and clinical departments.'
  },
  {
    id: 'role-13',
    name: 'Senior Pathologist & Lab Head',
    type: 'CUSTOM',
    usersCount: 1,
    permissions: [
      'patients.read', 'patients.create', 'samples.read', 'samples.collect',
      'samples.barcode', 'samples.reject', 'reports.read', 'reports.entry',
      'reports.verify', 'reports.approve', 'reports.print', 'reports.delete',
      'investigations.read', 'investigations.create', 'investigations.pricing',
      'investigations.reflex', 'inventory.read', 'inventory.requisitions',
      'settings.footers', 'settings.reports'
    ],
    description: 'Custom facility role: Chief Pathologist with sign-off authority and reflex test configuration rights.'
  }
];

export const RolesView: React.FC = () => {
  const { showToast } = useApp();
  const [roles, setRoles] = useState<AppRoleItem[]>(INITIAL_ROLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GLOBAL' | 'CUSTOM'>('ALL');

  // Add Role Modal State
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [templateRole, setTemplateRole] = useState<string>('');

  // Permission Viewer / Editor Modal State
  const [activeRoleModal, setActiveRoleModal] = useState<AppRoleItem | null>(null);
  const [modalPermissions, setModalPermissions] = useState<string[]>([]);

  // Filtered Roles
  const filteredRoles = roles.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'GLOBAL' && r.type.includes('GLOBAL')) ||
      (typeFilter === 'CUSTOM' && r.type === 'CUSTOM');
    return matchesSearch && matchesType;
  });

  const handleOpenPermissions = (role: AppRoleItem) => {
    setActiveRoleModal(role);
    setModalPermissions([...role.permissions]);
  };

  const toggleModalPermission = (permId: string) => {
    if (activeRoleModal?.type === 'GLOBAL · READ-ONLY') return; // Read only
    setModalPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSaveRolePermissions = () => {
    if (!activeRoleModal) return;
    setRoles(prev =>
      prev.map(r => (r.id === activeRoleModal.id ? { ...r, permissions: modalPermissions } : r))
    );
    showToast(`Permissions updated for role "${activeRoleModal.name}"`);
    setActiveRoleModal(null);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showToast('Please enter role name');
      return;
    }

    let initialPerms: string[] = [];
    if (templateRole) {
      const foundTemplate = roles.find(r => r.id === templateRole);
      if (foundTemplate) {
        initialPerms = [...foundTemplate.permissions];
      }
    }

    const newRole: AppRoleItem = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      type: 'CUSTOM',
      usersCount: 0,
      permissions: initialPerms,
      description: `Custom role created on ${new Date().toLocaleDateString('en-US')}.`
    };

    setRoles(prev => [...prev, newRole]);
    setNewRoleName('');
    setTemplateRole('');
    setShowAddRoleModal(false);
    showToast(`Custom role "${newRole.name}" created successfully`);
  };

  const handleDeleteRole = (role: AppRoleItem) => {
    if (role.type === 'GLOBAL · READ-ONLY') {
      showToast('Global system roles cannot be deleted');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete custom role "${role.name}"?`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      showToast(`Custom role "${role.name}" deleted`);
    }
  };

  const customCount = roles.filter(r => r.type === 'CUSTOM').length;

  return (
    <div className="view-container" style={{ maxWidth: '1160px', margin: '0 auto' }}>
      {/* Header Matching SihatSuite with Action Buttons */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Roles & Permissions
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Create custom roles and fine-tune which actions each role can perform. Global roles are read-only — create your own to customise permissions.
          </p>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginTop: '6px' }}>
            {roles.length} roles · {customCount} custom
          </div>
        </div>

        {/* Action Buttons on Top Right */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowAddRoleModal(true);
              setTemplateRole(roles[0]?.id || '');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Copy size={14} /> Use a template
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowAddRoleModal(true);
              setTemplateRole('');
            }}
            style={{
              background: '#059669',
              color: '#ffffff',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(5,150,105,0.2)'
            }}
          >
            <Plus size={16} /> Add role
          </button>
        </div>
      </div>

      {/* ====================================================================
          SEARCH & FILTER BAR MATCHING LIVE SITE
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search role name... ( / )"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
          />
        </div>

        <select
          className="form-control"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
          style={{ width: 'auto', minWidth: '130px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
        >
          <option value="ALL">All types</option>
          <option value="GLOBAL">Global</option>
          <option value="CUSTOM">Custom</option>
        </select>

        <button
          type="button"
          className="btn btn-primary"
          style={{
            background: '#059669',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      {/* ====================================================================
          ROLES DATA TABLE MATCHING SIHATSUITE LAYOUT
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: 0,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  ROLE
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  TYPE
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'center' }}>
                  USERS
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', minWidth: '200px' }}>
                  PERMISSIONS
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(role => {
                const isCustom = role.type === 'CUSTOM';
                const permCount = role.permissions.length;
                const permPercent = Math.min(100, Math.round((permCount / TOTAL_PERMISSIONS_COUNT) * 100));

                return (
                  <tr
                    key={role.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s ease' }}
                    className="table-row-hover"
                  >
                    {/* Role Title & Desc */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                        {role.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', maxWidth: '380px', lineHeight: 1.4 }}>
                        {role.description}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          background: isCustom ? '#ecfdf5' : '#f1f5f9',
                          color: isCustom ? '#059669' : '#64748b',
                          border: isCustom ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                        }}
                      >
                        {role.type}
                      </span>
                    </td>

                    {/* Assigned Users Count */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: role.usersCount > 0 ? '#0f172a' : '#94a3b8',
                          background: role.usersCount > 0 ? '#f1f5f9' : 'transparent',
                          padding: '2px 8px',
                          borderRadius: '8px'
                        }}
                      >
                        {role.usersCount}
                      </span>
                    </td>

                    {/* Permissions Progress Bar */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                        <span>{permCount} of {TOTAL_PERMISSIONS_COUNT}</span>
                        <span>{permPercent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${permPercent}%`,
                            height: '100%',
                            background: isCustom ? 'linear-gradient(90deg, #10b981, #059669)' : '#059669',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                    </td>

                    {/* Row Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenPermissions(role)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={isCustom ? 'Edit granular permissions' : 'View read-only permissions'}
                        >
                          {isCustom ? <Sliders size={13} color="#059669" /> : <Eye size={13} color="#64748b" />}
                          {isCustom ? 'Edit permissions' : 'View permissions'}
                        </button>

                        {isCustom && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteRole(role)}
                            style={{
                              padding: '5px 8px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              background: '#fff',
                              border: '1px solid #fecdd3',
                              color: '#e11d48',
                              cursor: 'pointer'
                            }}
                            title="Delete custom role"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MODAL 1: ADD CUSTOM ROLE MODAL
          ==================================================================== */}
      {showAddRoleModal && (
        <div className="modal-backdrop" onClick={() => setShowAddRoleModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '460px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Add Custom Role
              </h3>
              <button className="icon-btn" onClick={() => setShowAddRoleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Role name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Night Shift Coordinator"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '42px', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Base on existing template (optional)
                  </label>
                  <select
                    className="form-control"
                    value={templateRole}
                    onChange={e => setTemplateRole(e.target.value)}
                    style={{ height: '42px', borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="">-- Start with 0 permissions (blank) --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.permissions.length} perms)
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Copies initial permission checkboxes from an existing role to save setup time.
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 600,
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Create role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: GRANULAR PERMISSIONS INSPECTOR & EDITOR (70 PERMISSIONS)
          ==================================================================== */}
      {activeRoleModal && (
        <div className="modal-backdrop" onClick={() => setActiveRoleModal(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 className="modal-title" style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {activeRoleModal.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: activeRoleModal.type === 'CUSTOM' ? '#ecfdf5' : '#f1f5f9',
                      color: activeRoleModal.type === 'CUSTOM' ? '#059669' : '#64748b'
                    }}
                  >
                    {activeRoleModal.type}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {activeRoleModal.type === 'GLOBAL · READ-ONLY'
                    ? 'Global system roles are read-only. Clone this role or create a custom role to edit permissions.'
                    : 'Check or uncheck individual capability flags below to customize security boundaries for this role.'}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setActiveRoleModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Categorized Permissions Checklist */}
            <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Assigned Capabilities: <strong style={{ color: '#059669' }}>{modalPermissions.length}</strong> of {TOTAL_PERMISSIONS_COUNT}
                </span>

                {activeRoleModal.type === 'CUSTOM' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setModalPermissions([...ALL_PERMISSION_IDS])}
                      style={{ fontSize: '11px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Select All
                    </button>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <button
                      type="button"
                      onClick={() => setModalPermissions([])}
                      style={{ fontSize: '11px', color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {PERMISSION_MODULES.map(group => (
                  <div
                    key={group.module}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#ffffff'
                    }}
                  >
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '10px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: '#0f172a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{group.module}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {group.permissions.filter(p => modalPermissions.includes(p.id)).length} / {group.permissions.length}
                      </span>
                    </div>

                    <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                      {group.permissions.map(perm => {
                        const isGranted = modalPermissions.includes(perm.id);
                        const isReadOnly = activeRoleModal.type === 'GLOBAL · READ-ONLY';

                        return (
                          <label
                            key={perm.id}
                            onClick={() => !isReadOnly && toggleModalPermission(perm.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: isReadOnly ? 'default' : 'pointer',
                              background: isGranted ? '#f0fdf4' : 'transparent',
                              border: isGranted ? '1px solid #bbf7d0' : '1px solid transparent',
                              transition: 'all 0.12s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isReadOnly}
                              onChange={() => !isReadOnly && toggleModalPermission(perm.id)}
                              style={{ accentColor: '#059669', marginTop: '3px', cursor: isReadOnly ? 'default' : 'pointer' }}
                            />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: isGranted ? '#065f46' : '#334155' }}>
                                {perm.label}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px', lineHeight: 1.3 }}>
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveRoleModal(null)}
              >
                {activeRoleModal.type === 'CUSTOM' ? 'Cancel' : 'Close'}
              </button>

              {activeRoleModal.type === 'CUSTOM' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveRolePermissions}
                  style={{
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 600,
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Save Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
