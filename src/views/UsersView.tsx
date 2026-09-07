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
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  FileSignature,
  X,
  Lock
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

  // Create Form State
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

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);

  // Password Reset Modal State
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Signature Uploading
  const handleSignatureUpload = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          updateUser(userId, { signatureUrl: event.target.result as string });
          showToast('Digital signature uploaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRoleSelection = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleEditRoleSelection = (role: string) => {
    setEditRoles(prev =>
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

    // Username format check (no spaces)
    if (/\s/.test(username)) {
      showToast('Username cannot contain spaces');
      return;
    }

    // Check duplicate username
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

      // Clear Form
      setFullName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setSelectedRoles([]);
      setPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
    }, 400);
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.name);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRoles(user.roles || [user.role]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editRoles.length === 0) {
      showToast('User must have at least one role');
      return;
    }

    updateUser(editingUser.id, {
      name: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      roles: editRoles,
      role: editRoles[0]
    });

    setEditingUser(null);
  };

  const handleConfirmPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }

    showToast(`Password successfully reset for @${resettingUser.username}`);
    setResettingUser(null);
    setNewPassword('');
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
    return matchesSearch && matchesRole;
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
      {/* Header Matching Live Site */}
      <div className="page-header" style={{ marginBottom: '22px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            User Management
          </h1>
          <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Create users for your team, assign roles, and manage access. Inactive users cannot log in.
          </p>
        </div>
      </div>

      {/* ====================================================================
          CARD 1: CREATE NEW USER FORM (MATCHING LIVE SCREENSHOT)
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Create New User
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            All users created here belong to your tenant.
          </p>
        </div>

        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Full Name & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Username *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. john_doe (no spaces)"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                required
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="user@example.com (optional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="01XXXXXXXXX (optional)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Row 3: 12 Roles Checkable Pills Matching Live Site */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
              Roles *
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {LIVE_ROLES.map(role => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRoleSelection(role)}
                    style={{
                      border: isSelected ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      color: isSelected ? '#0f172a' : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        border: isSelected ? '1.5px solid #0f172a' : '1.5px solid #94a3b8',
                        background: isSelected ? '#0f172a' : '#ffffff',
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

          {/* Row 4: Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
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
                style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Submit Button Matching Live */}
          <div style={{ marginTop: '8px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 600,
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <UserPlus size={16} /> {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      {/* ====================================================================
          CARD 2: TEAM MEMBERS LIST (MATCHING LIVE SCREENSHOT)
          ==================================================================== */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Team Members ({users.length})
            </h2>
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '12px', borderRadius: '7px' }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', height: '36px', fontSize: '12px', borderRadius: '7px' }}
            >
              <option value="ALL">All Roles</option>
              {LIVE_ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredUsers.map(u => {
            const isMe = u.username === currentUser?.username;
            const rolesList = u.roles && u.roles.length > 0 ? u.roles : [u.role];
            const isActive = u.status !== 'INACTIVE' && u.isActive !== false;

            return (
              <div
                key={u.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Top Info Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    {/* Circle Avatar Initials */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: isMe ? '#dbeafe' : '#f1f5f9',
                        color: isMe ? '#1d4ed8' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(u.name || u.username)}
                    </div>

                    <div>
                      {/* Name & Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                          {u.name}
                        </strong>

                        <span
                          style={{
                            fontSize: '11px',
                            color: '#64748b',
                            background: '#f1f5f9',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 500
                          }}
                        >
                          @{u.username}
                        </span>

                        {rolesList.map((r, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '11px',
                              color: '#334155',
                              background: '#e2e8f0',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: 600
                            }}
                          >
                            {r}
                          </span>
                        ))}

                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: isActive ? '#ecfdf5' : '#f1f5f9',
                            color: isActive ? '#059669' : '#94a3b8'
                          }}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>

                        {isMe && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: '#cffafe',
                              color: '#0891b2'
                            }}
                          >
                            you
                          </span>
                        )}
                      </div>

                      {/* Contact & Joined Meta */}
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {u.email} · {u.phone} · joined {u.joinedDate || '9/1/2026'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartEdit(u)}
                      style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setResettingUser(u);
                        setNewPassword('');
                      }}
                      style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Key size={12} /> Reset Password
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggleActive(u)}
                      disabled={isMe}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11px',
                        cursor: isMe ? 'not-allowed' : 'pointer',
                        color: isActive ? '#e11d48' : '#059669'
                      }}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    {!isMe && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(u)}
                        style={{ padding: '5px 8px', fontSize: '11px', color: '#e11d48' }}
                        title="Remove User"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* SIGNATURE SUBSECTION MATCHING LIVE SITE */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>
                    SIGNATURE
                  </div>

                  {u.signatureUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={u.signatureUrl}
                        alt={`${u.name} signature`}
                        style={{ maxHeight: '40px', maxWidth: '140px', objectFit: 'contain', background: '#fff', border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px' }}
                      />
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        <Upload size={12} /> Replace signature
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleSignatureUpload(u.id, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        No signature uploaded yet.
                      </span>

                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        <Upload size={13} /> Upload signature
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleSignatureUpload(u.id, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          EDIT USER MODAL
          ==================================================================== */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '580px', width: '92%' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Team Member: @{editingUser.username}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Assigned Roles *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {LIVE_ROLES.map(role => {
                      const isSelected = editRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleEditRoleSelection(role)}
                          style={{
                            border: isSelected ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                            background: isSelected ? '#f8fafc' : '#ffffff',
                            color: isSelected ? '#0f172a' : '#475569',
                            fontWeight: isSelected ? 700 : 500,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '2px',
                              border: isSelected ? '1px solid #0f172a' : '1px solid #94a3b8',
                              background: isSelected ? '#0f172a' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isSelected && <Check size={8} style={{ color: '#ffffff' }} />}
                          </div>
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0f172a' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          PASSWORD RESET MODAL
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
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Enter a new password for <strong>{resettingUser.name}</strong>. The user can immediately log in with this new password.
                </p>

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
              </div>

              <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResettingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0f172a' }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
