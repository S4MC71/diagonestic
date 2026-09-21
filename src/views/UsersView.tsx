import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, LiveUserRole } from '../types';
import {
  UserPlus,
  Search,
  Check,
  Upload,
  Key,
  Trash2,
  Edit2,
  Shield,
  FileSignature,
  X,
  Power,
  Lock,
  Plus
} from 'lucide-react';

const LIVE_ROLES: LiveUserRole[] = [
  'Doctor',
  'Global Account Manager',
  'Global Auditor',
  'Global Corporate Coordinator',
  'Global Doctor',
  'Global Field Agent',
  'Global Lab Technologist',
  'Global Pharmacy Counter',
  'Global Pharmacy Manager',
  'Global Reception',
  'Global Storekeeper',
  'Global Tenant Admin'
];

export const UsersView: React.FC = () => {
  const { tenantSettings, users, currentUser, addUser, updateUser, deleteUser, showToast } = useApp();

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Change Roles Modal State
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [userAssignedRoles, setUserAssignedRoles] = useState<string[]>([]);

  // Password Reset Modal State
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Digital Signature Modal State
  const [signatureModalUser, setSignatureModalUser] = useState<User | null>(null);

  // Signature Uploading
  const handleSignatureUpload = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          const sigData = event.target.result as string;
          updateUser(userId, { signatureUrl: sigData });
          if (signatureModalUser && signatureModalUser.id === userId) {
            setSignatureModalUser({ ...signatureModalUser, signatureUrl: sigData });
          }
          showToast('Digital signature uploaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = (userId: string) => {
    updateUser(userId, { signatureUrl: '' });
    if (signatureModalUser && signatureModalUser.id === userId) {
      setSignatureModalUser({ ...signatureModalUser, signatureUrl: '' });
    }
    showToast('Signature removed');
  };

  const toggleRoleSelection = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleUserRole = (role: string) => {
    setUserAssignedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter full name');
      return;
    }

    if (!username.trim()) {
      showToast('Please enter username');
      return;
    }

    if (/\s/.test(username)) {
      showToast('Username cannot contain spaces');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      showToast(`Username @${username} is already in use`);
      return;
    }

    if (selectedRoles.length === 0) {
      showToast('Please select at least one role');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addUser({
        name: fullName.trim(),
        username: username.trim(),
        email: email.trim() || `${username.trim()}@${tenantSettings.slug || 'lifecared'}.com`,
        phone: phone.trim() || '01XXXXXXXXX',
        role: selectedRoles[0],
        roles: selectedRoles,
        status: 'ACTIVE',
        isActive: true,
        active: true,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        signatureUrl: ''
      });

      // Clear Form & Close Modal
      setFullName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setSelectedRoles([]);
      setPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
      setShowAddUserModal(false);
      showToast(`User @${username.trim()} created successfully`);
    }, 300);
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.name);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim()
    });

    showToast(`Updated details for @${editingUser.username}`);
    setEditingUser(null);
  };

  const handleOpenRoleModal = (user: User) => {
    setRoleModalUser(user);
    setUserAssignedRoles(user.roles && user.roles.length > 0 ? [...user.roles] : [user.role]);
  };

  const handleSaveRoles = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    if (userAssignedRoles.length === 0) {
      showToast('User must have at least one role assigned');
      return;
    }

    updateUser(roleModalUser.id, {
      roles: userAssignedRoles,
      role: userAssignedRoles[0]
    });

    showToast(`Roles updated for @${roleModalUser.username}`);
    setRoleModalUser(null);
  };

  const handleConfirmPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match');
      return;
    }

    showToast(`Password successfully reset for @${resettingUser.username}`);
    setResettingUser(null);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleToggleActive = (user: User) => {
    if (user.username === currentUser?.username) {
      showToast('You cannot deactivate your own account');
      return;
    }

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateUser(user.id, {
      status: newStatus,
      isActive: newStatus === 'ACTIVE',
      active: newStatus === 'ACTIVE'
    });
    showToast(`User @${user.username} is now ${newStatus}`);
  };

  const handleDelete = (user: User) => {
    if (user.username === currentUser?.username) {
      showToast('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently remove @${user.username}?`)) {
      deleteUser(user.id);
      showToast(`User @${user.username} removed`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchesRole =
      roleFilter === 'ALL' ||
      (u.roles && u.roles.includes(roleFilter)) ||
      u.role === roleFilter;
    const isActive = u.status !== 'INACTIVE' && u.isActive !== false;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isActive) ||
      (statusFilter === 'INACTIVE' && !isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(/[\s_]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="view-container" style={{ maxWidth: '1160px', margin: '0 auto' }}>
      {/* Header Matching SihatSuite Layout */}
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
            User Management
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Manage team accounts, assign roles, and revoke access. Inactive users cannot log in.
          </p>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginTop: '6px' }}>
            {users.length} active staff accounts
          </div>
        </div>

        {/* Top Right Action Button */}
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddUserModal(true)}
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
            <Plus size={16} /> Add user
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
            placeholder="Search name, username, phone, email... ( / )"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
          />
        </div>

        <select
          className="form-control"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '140px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
        >
          <option value="ALL">All roles</option>
          {LIVE_ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          className="form-control"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '120px', height: '38px', borderRadius: '7px', fontSize: '13px' }}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
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
          USERS DATA TABLE MATCHING SIHATSUITE LAYOUT
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
                  USER
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  ROLES
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  CONTACT
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em' }}>
                  LAST LOGIN
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'center' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b' }}>
                    No users match your current search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isMe = u.username === currentUser?.username;
                  const rolesList = u.roles && u.roles.length > 0 ? u.roles : [u.role];
                  const isActive = u.status !== 'INACTIVE' && u.isActive !== false;

                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s ease' }}
                      className="table-row-hover"
                    >
                      {/* USER Column: Avatar + Name + @username */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: isMe ? '#ecfdf5' : '#f1f5f9',
                              color: isMe ? '#059669' : '#334155',
                              border: isMe ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                              flexShrink: 0
                            }}
                          >
                            {getInitials(u.name || u.username)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                                {u.name}
                              </strong>
                              {isMe && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '8px',
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #bbf7d0'
                                  }}
                                >
                                  you
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROLES Column: Badges */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {rolesList.map((r, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#334155',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                padding: '2px 8px',
                                borderRadius: '10px'
                              }}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* CONTACT Column: Phone & Email */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500 }}>
                          {u.phone || '—'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {u.email || '—'}
                        </div>
                      </td>

                      {/* LAST LOGIN Column */}
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                        {isMe ? 'Active now' : u.joinedDate || 'Recently'}
                      </td>

                      {/* STATUS Column */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            letterSpacing: '0.04em',
                            background: isActive ? '#ecfdf5' : '#f1f5f9',
                            color: isActive ? '#059669' : '#94a3b8',
                            border: isActive ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                          }}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* ACTIONS Column: 5 row action icon buttons */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* 1. Digital Signature Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSignatureModalUser(u)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: u.signatureUrl ? '#ecfdf5' : '#ffffff',
                              border: u.signatureUrl ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                              color: u.signatureUrl ? '#059669' : '#64748b',
                              cursor: 'pointer'
                            }}
                            title={u.signatureUrl ? 'View/replace digital signature' : 'Upload digital signature'}
                          >
                            <FileSignature size={13} />
                          </button>

                          {/* 2. Edit User Details Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStartEdit(u)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                            title="Edit user details"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* 3. Change Roles Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenRoleModal(u)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                            title="Manage assigned roles"
                          >
                            <Shield size={13} />
                          </button>

                          {/* 4. Reset Password Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setResettingUser(u);
                              setNewPassword('');
                              setConfirmNewPassword('');
                            }}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                            title="Reset password"
                          >
                            <Lock size={13} />
                          </button>

                          {/* 5. Activate / Deactivate Toggle Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleActive(u)}
                            disabled={isMe}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: isMe ? '#f8fafc' : '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: isActive ? '#e11d48' : '#059669',
                              cursor: isMe ? 'not-allowed' : 'pointer'
                            }}
                            title={isMe ? 'Cannot deactivate self' : isActive ? 'Deactivate account' : 'Activate account'}
                          >
                            <Power size={13} />
                          </button>

                          {/* Delete Action (only if not self) */}
                          {!isMe && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDelete(u)}
                              style={{
                                padding: '6px 7px',
                                borderRadius: '6px',
                                background: '#ffffff',
                                border: '1px solid #fecdd3',
                                color: '#e11d48',
                                cursor: 'pointer'
                              }}
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MODAL 1: ADD NEW USER MODAL (MATCHING SIHATSUITE)
          ==================================================================== */}
      {showAddUserModal && (
        <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '600px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Add New User
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Create an employee account and grant role privileges for this tenant.
                </p>
              </div>
              <button className="icon-btn" onClick={() => setShowAddUserModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Name & Username */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Farhana Islam"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. farhana_doc (no spaces)"
                      value={username}
                      onChange={e => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      required
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="doctor@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Phone (optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="01700000000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                {/* Role Selector Pills */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                    Roles *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px 0' }}>
                    {LIVE_ROLES.map(role => {
                      const isSelected = selectedRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRoleSelection(role)}
                          style={{
                            border: isSelected ? '1.5px solid #059669' : '1px solid #cbd5e1',
                            background: isSelected ? '#ecfdf5' : '#ffffff',
                            color: isSelected ? '#065f46' : '#475569',
                            fontWeight: isSelected ? 700 : 500,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '3px',
                              border: isSelected ? '1.5px solid #059669' : '1.5px solid #94a3b8',
                              background: isSelected ? '#059669' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isSelected && <Check size={10} style={{ color: '#ffffff' }} />}
                          </div>
                          {role}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    Select one or more roles. Permissions from all selected roles are combined.
                  </div>
                </div>

                {/* Password & Confirm */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="min 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="repeat password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      style={{ height: '40px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: DIGITAL SIGNATURE MODAL
          ==================================================================== */}
      {signatureModalUser && (
        <div className="modal-backdrop" onClick={() => setSignatureModalUser(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Digital Signature: {signatureModalUser.name}
              </h3>
              <button className="icon-btn" onClick={() => setSignatureModalUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px', textAlign: 'center' }}>
              {signatureModalUser.signatureUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#f8fafc',
                      width: '100%',
                      maxWidth: '300px'
                    }}
                  >
                    <img
                      src={signatureModalUser.signatureUrl}
                      alt={`${signatureModalUser.name} signature`}
                      style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={13} /> Replace signature
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleSignatureUpload(signatureModalUser.id, e)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSignature(signatureModalUser.id)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #fecdd3',
                        background: '#fff',
                        color: '#e11d48',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '30px 20px',
                      background: '#f8fafc',
                      width: '100%'
                    }}
                  >
                    <FileSignature size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      No digital signature uploaded yet
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      PNG or JPG with transparent/white background. Used on lab reports.
                    </div>
                  </div>
                  <label
                    style={{
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      background: '#059669',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={14} /> Upload image file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleSignatureUpload(signatureModalUser.id, e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSignatureModalUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: EDIT USER DETAILS MODAL
          ==================================================================== */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Details: @{editingUser.username}
              </h3>
              <button className="icon-btn" onClick={() => setEditingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
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
                    borderRadius: '7px'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: MANAGE ASSIGNED ROLES MODAL
          ==================================================================== */}
      {roleModalUser && (
        <div className="modal-backdrop" onClick={() => setRoleModalUser(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '540px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Assign Roles: {roleModalUser.name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  @{roleModalUser.username}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setRoleModalUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRoles}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
                  Select one or more active roles:
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {LIVE_ROLES.map(role => {
                    const isSelected = userAssignedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleUserRole(role)}
                        style={{
                          border: isSelected ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: isSelected ? '#ecfdf5' : '#ffffff',
                          color: isSelected ? '#065f46' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          padding: '7px 14px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            border: isSelected ? '1.5px solid #059669' : '1.5px solid #94a3b8',
                            background: isSelected ? '#059669' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <Check size={10} style={{ color: '#ffffff' }} />}
                        </div>
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRoleModalUser(null)}>
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
                    borderRadius: '7px'
                  }}
                >
                  Save Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: RESET PASSWORD MODAL
          ==================================================================== */}
      {resettingUser && (
        <div className="modal-backdrop" onClick={() => setResettingUser(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Reset Password: @{resettingUser.username}
              </h3>
              <button className="icon-btn" onClick={() => setResettingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPasswordReset}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="min 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="repeat new password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '7px' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResettingUser(null)}>
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
                    borderRadius: '7px'
                  }}
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
