import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffMember } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  X,
  CreditCard
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const {
    staffMembers,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Medical Technologist');
  const [department, setDepartment] = useState('Lab');
  const [salary, setSalary] = useState<number>(18000);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [nid, setNid] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setPhone('');
    setEmail('');
    setRole('Medical Technologist');
    setDepartment('Lab');
    setSalary(18000);
    setStatus('ACTIVE');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setNid('');
    setAddress('');
    setEmergencyContact('');
    setShowModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setName(staff.name);
    setPhone(staff.phone || '');
    setEmail(staff.email || '');
    setRole(staff.role);
    setDepartment(staff.department || 'Lab');
    setSalary(staff.salary);
    setStatus(staff.status);
    setJoinDate(staff.joinDate || new Date().toISOString().split('T')[0]);
    setNid(staff.nid || '');
    setAddress(staff.address || '');
    setEmergencyContact(staff.emergencyContact || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter full name');
      return;
    }
    if (!phone.trim()) {
      showToast('Please enter phone number');
      return;
    }

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        department,
        salary: Number(salary) || 0,
        status,
        joinDate,
        nid: nid.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim()
      });
    } else {
      addStaffMember({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        department,
        salary: Number(salary) || 0,
        status,
        joinDate,
        nid: nid.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim()
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to remove staff member "${staffName}"?`)) {
      deleteStaffMember(id);
    }
  };

  // Filtered staff list
  const filteredStaff = staffMembers.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPayroll = staffMembers
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.salary, 0);

  const activeStaffCount = staffMembers.filter(s => s.status === 'ACTIVE').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Staff & Employee Directory
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            Manage clinic team, roles, salaries, biometric records, and official contacts
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
          }}
        >
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Staff Members</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{staffMembers.length}</div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>{activeStaffCount} Active On Duty</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Monthly Payroll</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            ৳{totalPayroll.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>BDT active monthly commitment</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Departments</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>5</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Lab, OPD, Pharmacy, Finance, Admin</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Average Monthly Salary</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '6px' }}>
            ৳{activeStaffCount > 0 ? Math.round(totalPayroll / activeStaffCount).toLocaleString() : 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Per staff member</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, role or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: '#64748b' }} />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                background: '#fff',
                outline: 'none'
              }}
            >
              <option value="ALL">All Departments</option>
              <option value="Lab">Lab (Laboratory)</option>
              <option value="OPD">OPD / Front Desk</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Finance">Finance & Accounts</option>
              <option value="Admin">Admin & Support</option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              outline: 'none'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Showing <strong>{filteredStaff.length}</strong> of {staffMembers.length} staff
        </div>
      </div>

      {/* Staff Table */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                <th style={{ padding: '14px 20px' }}>Staff Name</th>
                <th style={{ padding: '14px 16px' }}>Role / Designation</th>
                <th style={{ padding: '14px 16px' }}>Department</th>
                <th style={{ padding: '14px 16px' }}>Contact</th>
                <th style={{ padding: '14px 16px' }}>Monthly Salary</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No staff members found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => {
                  const initials = staff.name
                    .split(' ')
                    .map(n => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={staff.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '13px'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.name}</div>
                            {staff.joinDate && (
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Joined: {staff.joinDate}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                        {staff.role}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background:
                            staff.department === 'Lab' ? '#ecfdf5' :
                            staff.department === 'OPD' ? '#e0f2fe' :
                            staff.department === 'Pharmacy' ? '#fef3c7' :
                            staff.department === 'Finance' ? '#f3e8ff' : '#f1f5f9',
                          color:
                            staff.department === 'Lab' ? '#059669' :
                            staff.department === 'OPD' ? '#0284c7' :
                            staff.department === 'Pharmacy' ? '#d97706' :
                            staff.department === 'Finance' ? '#7c3aed' : '#475569'
                        }}>
                          {staff.department || 'General'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 500 }}>
                          <Phone size={13} style={{ color: '#059669' }} />
                          <span>{staff.phone || '—'}</span>
                        </div>
                        {staff.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                            <Mail size={12} />
                            <span>{staff.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Monthly Salary */}
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        ৳{staff.salary.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: staff.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                          color: staff.status === 'ACTIVE' ? '#059669' : '#dc2626'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: staff.status === 'ACTIVE' ? '#10b981' : '#ef4444' }} />
                          {staff.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(staff)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(staff.id, staff.name)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#fff',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px'
                            }}
                            title="Delete Staff Member"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* ADD / EDIT STAFF MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {editingStaff ? 'Edit Staff Member' : 'Register New Staff Member'}
                </h3>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  Enter complete employee details and monthly compensation
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Shafiqul Islam"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="staff@clinic.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab Technologist"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="Lab">Lab (Laboratory)</option>
                    <option value="OPD">OPD / Front Desk</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Finance">Finance & Accounts</option>
                    <option value="Admin">Admin & Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Monthly Salary (৳ BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    placeholder="18000"
                    value={salary}
                    onChange={e => setSalary(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={e => setJoinDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    National ID (NID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 199XXXXXXXXXX"
                    value={nid}
                    onChange={e => setNid(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="Village, Thana, District"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Emergency Contact & Relation
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01819-XXXXXX (Brother)"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
