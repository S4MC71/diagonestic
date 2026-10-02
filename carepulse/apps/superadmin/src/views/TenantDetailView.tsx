import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Building2, Users, CreditCard, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Shield, Trash2, X, AlertOctagon,
  Key, Edit3, Plus, Search, Copy, Eye, EyeOff, UserPlus, SlidersHorizontal,
  Mail
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────
interface TenantUser {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface TenantDetail {
  id: string;
  name: string;
  bengaliName?: string;
  slug: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  phone?: string;
  email?: string;
  address?: string;
  planId?: string;
  planExpiresAt?: string;
  maxUsers?: number | null;
  userLimit?: number;
  createdAt: string;
  plan?: { id: string; name: string; priceMonthly: number; maxUsers?: number };
  createdById?: string | null;
  createdBy?: { id: string; name: string; username: string; role: string } | null;
  modules: { moduleKey: string; isEnabled: boolean }[];
  users: TenantUser[];
  subscriptionPayments: {
    id: string; amount: number; method: string; status: string;
    billingCycle: string; paidAt: string;
    plan?: { name: string };
  }[];
  _count?: { users: number; patients: number; invoices: number };
}

interface DynamicModuleItem {
  key: string;
  label: string;
  icon: string;
  category: string;
  isActive: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:    { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', label: 'Active' },
  TRIAL:     { bg: 'rgba(234,179,8,0.15)',  color: '#eab308', label: 'Trial' },
  SUSPENDED: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: 'Suspended' },
  EXPIRED:   { bg: 'rgba(107,114,128,0.15)',color: '#6b7280', label: 'Expired' },
};

const ROLE_OPTIONS = [
  { value: 'TENANT_ADMIN', label: 'Admin (Full Center Control)', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { value: 'CENTER_MANAGER', label: 'Center Manager', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { value: 'RECEPTIONIST', label: 'Receptionist / Billing', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { value: 'DOCTOR', label: 'Doctor / Consultant', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { value: 'PHARMACIST', label: 'Pharmacist', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { value: 'ACCOUNTANT', label: 'Accountant', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { value: 'PHLEBOTOMIST', label: 'Phlebotomist (Sample Collector)', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  { value: 'STORE_MANAGER', label: 'Store / Inventory Manager', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
];

const ROLE_LABELS: Record<string, string> = {
  TENANT_ADMIN: 'Admin', CENTER_MANAGER: 'Manager', RECEPTIONIST: 'Receptionist',
  LAB_TECHNICIAN: 'Lab Tech', DOCTOR: 'Doctor', PHARMACIST: 'Pharmacist',
  ACCOUNTANT: 'Accountant', PHLEBOTOMIST: 'Phlebotomist', STORE_MANAGER: 'Store',
};

interface SectionMeta {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
}

const SECTION_METAS: Record<string, SectionMeta> = {
  CLINICAL: {
    id: 'CLINICAL',
    title: 'Clinical & Patient Consultations',
    icon: '🩺',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    description: 'Patient records, consultation chambers, queue tokens, prescriptions, and home collection',
  },
  LAB: {
    id: 'LAB',
    title: 'Laboratory & Diagnostic Investigations',
    icon: '🔬',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    description: 'Investigation catalog, sample collection barcoding, outsourced send-outs, and lab reports',
  },
  PHARMACY: {
    id: 'PHARMACY',
    title: 'Pharmacy & Drug Dispensary',
    icon: '💊',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    description: 'POS sales counter, medicine stock inventory, purchases, and supplier orders',
  },
  FINANCE: {
    id: 'FINANCE',
    title: 'Billing, Finance & Ledgers',
    icon: '💰',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    description: 'Patient billing invoices, payments collection, doctor referral commissions, and journals',
  },
  ADMIN: {
    id: 'ADMIN',
    title: 'Staff, HRM & Administration',
    icon: '⚙️',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    description: 'Staff directory, biometric attendance, monthly payroll, and center equipment inventory',
  },
  GENERAL: {
    id: 'GENERAL',
    title: 'Growth, Marketing & Custom Add-ons',
    icon: '🌐',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    description: 'Website CMS, online patient appointments, SMS notifications, and custom addons',
  },
};

const SECTION_ORDER = ['CLINICAL', 'LAB', 'PHARMACY', 'FINANCE', 'ADMIN', 'GENERAL'];

export const getModuleCategory = (m: { category?: string }): string => {
  const cat = (m.category || 'GENERAL').toUpperCase();
  return SECTION_METAS[cat] ? cat : 'GENERAL';
};

// ─── Props ────────────────────────────────────────────────────
interface Props {
  tenantId: string;
  onBack: () => void;
}

export const TenantDetailView: React.FC<Props> = ({ tenantId, onBack }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [availableModules, setAvailableModules] = useState<DynamicModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'modules' | 'users' | 'payments'>('modules');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Module Tab State ──────────────────────────────────────
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('ALL');
  const [bulkTogglingSection, setBulkTogglingSection] = useState<string | null>(null);

  // ── User Management State ─────────────────────────────────
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Limit Modal
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitChoice, setLimitChoice] = useState<'plan' | 'custom'>('plan');
  const [customLimitInput, setCustomLimitInput] = useState('');
  const [isSavingLimit, setIsSavingLimit] = useState(false);

  // Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'RECEPTIONIST',
    password: '',
    copyCredentials: true,
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'RECEPTIONIST',
    isActive: true,
  });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Reset Password Modal
  const [resettingUser, setResettingUser] = useState<TenantUser | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete User Modal
  const [deletingUser, setDeletingUser] = useState<TenantUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // 3-Step Danger Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3>(1);
  const [deleteReason, setDeleteReason] = useState('');
  const [slugConfirmationInput, setSlugConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const num = Math.floor(1000 + Math.random() * 9000);
    return `Care@${num}${rand.slice(0, 2)}`;
  };

  const copyCredentials = (username: string, pass: string) => {
    const text = `🏥 CarePulse Diagnostic Portal\nCenter: ${tenant?.name ?? 'Diagnostic Center'}\n👤 Username: @${username}\n🔑 Password: ${pass}\n🌐 Login URL: https://clinic.chamberbd.com/app/login`;
    navigator.clipboard.writeText(text);
    showToast('Credentials copied to clipboard!');
  };

  const fetchTenant = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [resTenant, resModules] = await Promise.all([
        api.get<{ data: { tenant: TenantDetail } }>(`/api/superadmin/tenants/${tenantId}`),
        api.get<{ data: { modules: DynamicModuleItem[] } }>('/api/superadmin/modules')
      ]);
      setTenant(resTenant.data.tenant);
      setAvailableModules(resModules.data.modules || []);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load tenant details');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const effectiveUserLimit = useMemo(() => {
    if (!tenant) return 5;
    return tenant.maxUsers ?? tenant.plan?.maxUsers ?? 5;
  }, [tenant]);

  const filteredUsers = useMemo(() => {
    if (!tenant?.users) return [];
    return tenant.users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [tenant?.users, userSearch, userRoleFilter]);

  const handleModuleToggle = async (moduleKey: string, currentEnabled: boolean) => {
    setTogglingModule(moduleKey);
    try {
      await api.patch(`/api/superadmin/tenants/${tenantId}/modules`, {
        moduleKey,
        isEnabled: !currentEnabled,
      });

      setTenant((prev) => {
        if (!prev) return prev;
        const exists = prev.modules.some((m) => m.moduleKey === moduleKey);
        const updated = exists
          ? prev.modules.map((m) => m.moduleKey === moduleKey ? { ...m, isEnabled: !currentEnabled } : m)
          : [...prev.modules, { moduleKey, isEnabled: !currentEnabled }];
        return { ...prev, modules: updated };
      });

      showToast(`Module "${moduleKey}" ${!currentEnabled ? 'enabled' : 'disabled'}`);
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Toggle failed');
    } finally {
      setTogglingModule(null);
    }
  };

  const handleBulkSectionToggle = async (sectionId: string, enable: boolean) => {
    const sectionMods = availableModules.filter((m) => getModuleCategory(m) === sectionId);
    if (sectionMods.length === 0) return;

    setBulkTogglingSection(sectionId);
    try {
      const keys = sectionMods.map((m) => m.key);
      await api.patch(`/api/superadmin/tenants/${tenantId}/modules/bulk`, {
        moduleKeys: keys,
        isEnabled: enable,
      });

      setTenant((prev) => {
        if (!prev) return prev;
        const currentModMap = new Map(prev.modules.map((m) => [m.moduleKey, m.isEnabled]));
        keys.forEach((k) => currentModMap.set(k, enable));
        return {
          ...prev,
          modules: Array.from(currentModMap.entries()).map(([moduleKey, isEnabled]) => ({
            moduleKey,
            isEnabled,
          })),
        };
      });

      showToast(`${sectionMods.length} modules in ${SECTION_METAS[sectionId]?.title ?? sectionId} ${enable ? 'enabled' : 'disabled'}`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Bulk toggle failed');
    } finally {
      setBulkTogglingSection(null);
    }
  };

  const handleGlobalAllToggle = async (enable: boolean) => {
    if (availableModules.length === 0) return;
    setBulkTogglingSection('GLOBAL_ALL');
    try {
      const keys = availableModules.map((m) => m.key);
      await api.patch(`/api/superadmin/tenants/${tenantId}/modules/bulk`, {
        moduleKeys: keys,
        isEnabled: enable,
      });

      setTenant((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: keys.map((moduleKey) => ({ moduleKey, isEnabled: enable })),
        };
      });

      showToast(`All ${keys.length} catalog modules ${enable ? 'enabled' : 'disabled'}`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Global toggle failed');
    } finally {
      setBulkTogglingSection(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/api/superadmin/tenants/${tenantId}/status`, { status: newStatus });
      setTenant((prev) => prev ? { ...prev, status: newStatus as TenantDetail['status'] } : prev);
      showToast(`Status updated to ${newStatus}`);
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ─── User Limit Handlers ─────────────────────────────────────
  const openLimitModal = () => {
    if (!tenant) return;
    if (tenant.maxUsers !== null && tenant.maxUsers !== undefined) {
      setLimitChoice('custom');
      setCustomLimitInput(String(tenant.maxUsers));
    } else {
      setLimitChoice('plan');
      setCustomLimitInput(String(tenant.plan?.maxUsers ?? 5));
    }
    setIsLimitModalOpen(true);
  };

  const handleSaveUserLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setIsSavingLimit(true);
    try {
      const maxUsers = limitChoice === 'custom' ? parseInt(customLimitInput, 10) : null;
      if (limitChoice === 'custom' && (!maxUsers || maxUsers < 1)) {
        showToast('Please enter a valid positive number for max users.');
        setIsSavingLimit(false);
        return;
      }

      const res = await api.patch<{ success: boolean; message: string; data: { tenant: { maxUsers: number | null }; userLimit: number } }>(
        `/api/superadmin/tenants/${tenantId}/user-limit`,
        { maxUsers }
      );

      setTenant((prev) => prev ? {
        ...prev,
        maxUsers: res.data.tenant.maxUsers,
        userLimit: res.data.userLimit,
      } : prev);

      setIsLimitModalOpen(false);
      showToast(res.message || 'User limit updated successfully');
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to update user limit');
    } finally {
      setIsSavingLimit(false);
    }
  };

  // ─── Add User Handlers ───────────────────────────────────────
  const openAddUserModal = () => {
    setNewUserForm({
      name: '',
      username: '',
      email: '',
      role: 'RECEPTIONIST',
      password: generatePassword(),
      copyCredentials: true,
    });
    setShowNewPassword(false);
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    if (!newUserForm.name.trim() || !newUserForm.username.trim() || !newUserForm.password.trim()) {
      showToast('Please fill in Name, Username, and Password.');
      return;
    }

    setIsAddingUser(true);
    try {
      const res = await api.post<{ success: boolean; message: string; data: { user: TenantUser } }>(
        `/api/superadmin/tenants/${tenantId}/users`,
        {
          name: newUserForm.name.trim(),
          username: newUserForm.username.trim().replace(/^@/, ''),
          role: newUserForm.role,
          email: newUserForm.email.trim() || undefined,
          password: newUserForm.password.trim(),
        }
      );

      if (newUserForm.copyCredentials) {
        copyCredentials(newUserForm.username.trim().replace(/^@/, ''), newUserForm.password.trim());
      }

      setTenant((prev) => prev ? {
        ...prev,
        users: [...prev.users, res.data.user],
      } : prev);

      setIsAddUserModalOpen(false);
      showToast(`User @${res.data.user.username} created successfully!`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to create user');
    } finally {
      setIsAddingUser(false);
    }
  };

  // ─── Edit User Handlers ──────────────────────────────────────
  const openEditUserModal = (u: TenantUser) => {
    setEditingUser(u);
    setEditUserForm({
      name: u.name,
      username: u.username,
      email: u.email ?? '',
      role: u.role,
      isActive: u.isActive,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !tenant) return;
    setIsUpdatingUser(true);
    try {
      const res = await api.patch<{ success: boolean; message: string; data: { user: TenantUser } }>(
        `/api/superadmin/tenants/${tenantId}/users/${editingUser.id}`,
        {
          name: editUserForm.name.trim(),
          username: editUserForm.username.trim().replace(/^@/, ''),
          email: editUserForm.email.trim() || null,
          role: editUserForm.role,
          isActive: editUserForm.isActive,
        }
      );

      setTenant((prev) => prev ? {
        ...prev,
        users: prev.users.map((u) => u.id === editingUser.id ? res.data.user : u),
      } : prev);

      setEditingUser(null);
      showToast(`User @${res.data.user.username} updated successfully!`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to update user');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // ─── Reset Password Handlers ─────────────────────────────────
  const openResetPasswordModal = (u: TenantUser) => {
    setResettingUser(u);
    setResetPasswordInput(generatePassword());
    setShowResetPassword(true);
  };

  const handleResetPassword = async (e: React.FormEvent, copyAlso = false) => {
    e.preventDefault();
    if (!resettingUser || !tenant) return;
    if (!resetPasswordInput.trim() || resetPasswordInput.trim().length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }

    setIsResettingPassword(true);
    try {
      await api.post(`/api/superadmin/tenants/${tenantId}/users/${resettingUser.id}/reset-password`, {
        newPassword: resetPasswordInput.trim(),
      });

      if (copyAlso) {
        copyCredentials(resettingUser.username, resetPasswordInput.trim());
      }

      showToast(`Password for @${resettingUser.username} has been changed!`);
      setResettingUser(null);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ─── Toggle User Status ──────────────────────────────────────
  const handleToggleUserStatus = async (u: TenantUser) => {
    setTogglingUserId(u.id);
    try {
      const res = await api.patch<{ data: { user: TenantUser } }>(
        `/api/superadmin/tenants/${tenantId}/users/${u.id}`,
        { isActive: !u.isActive }
      );
      setTenant((prev) => prev ? {
        ...prev,
        users: prev.users.map((item) => item.id === u.id ? res.data.user : item),
      } : prev);
      showToast(`User @${u.username} ${!u.isActive ? 'activated' : 'suspended'}`);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Status update failed');
    } finally {
      setTogglingUserId(null);
    }
  };

  // ─── Delete User Handlers ────────────────────────────────────
  const handleDeleteUser = async () => {
    if (!deletingUser || !tenant) return;
    setIsDeletingUser(true);
    try {
      await api.delete(`/api/superadmin/tenants/${tenantId}/users/${deletingUser.id}?force=true`);
      setTenant((prev) => prev ? {
        ...prev,
        users: prev.users.filter((u) => u.id !== deletingUser.id),
      } : prev);
      showToast(`User @${deletingUser.username} deleted.`);
      setDeletingUser(null);
    } catch (err: unknown) {
      showToast((err as Error).message ?? 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // ─── Danger Delete Organization ──────────────────────────────
  const openDeleteModal = () => {
    setDeleteStep(1);
    setDeleteReason('');
    setSlugConfirmationInput('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    if (slugConfirmationInput.trim().toLowerCase() !== tenant.slug.toLowerCase()) {
      setDeleteError(`Slug does not match "${tenant.slug}". Please type carefully.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/api/superadmin/tenants/${tenant.id}`, {
        confirmationSlug: slugConfirmationInput.trim(),
        reason: deleteReason.trim(),
      });
      setIsDeleteModalOpen(false);
      showToast(`Diagnostic Center "${tenant.name}" has been permanently purged.`);
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete organization');
      setIsDeleting(false);
    }
  };

  const isModuleEnabled = (key: string) =>
    tenant?.modules.find((m) => m.moduleKey === key)?.isEnabled ?? false;

  const formatAmount = (n: number) => `৳${(n / 100).toLocaleString('en-BD')}`;
  const formatDate   = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never';

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#94a3b8' }}>
        <RefreshCw size={20} className="spin" />
        Loading diagnostic center details...
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="empty-state" style={{ marginTop: 60 }}>
        <AlertTriangle size={40} color="#ef4444" />
        <p className="empty-state-title" style={{ color: '#ef4444' }}>{error || 'Tenant not found'}</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: 12 }}>
          <ArrowLeft size={16} /> Back to Centers
        </button>
      </div>
    );
  }

  const st = STATUS_COLORS[tenant.status] ?? STATUS_COLORS.ACTIVE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9',
            padding: '12px 20px', borderRadius: 8, fontSize: 13,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <CheckCircle size={16} color="#22c55e" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{tenant.name}</h1>
            {tenant.bengaliName && (
              <span style={{ color: '#94a3b8', fontSize: 14 }}>({tenant.bengaliName})</span>
            )}
            <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
              {st.label}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            slug: <code style={{ color: '#94a3b8' }}>{tenant.slug}</code>
            {tenant.plan && <> &nbsp;·&nbsp; Plan: <span style={{ color: '#3b82f6' }}>{tenant.plan.name}</span></>}
            {tenant.planExpiresAt && <> &nbsp;·&nbsp; Expires: {formatDate(tenant.planExpiresAt)}</>}
            {tenant.createdBy ? (
              <> &nbsp;·&nbsp; Created by: <span style={{ color: tenant.createdBy.role === 'SUPER_ADMIN' ? '#a78bfa' : '#60a5fa', fontWeight: 600 }}>
                {tenant.createdBy.role === 'SUPER_ADMIN' ? '🛡️ Super Admin' : `👤 ${tenant.createdBy.name} (@${tenant.createdBy.username})`}
              </span></>
            ) : (
              <> &nbsp;·&nbsp; Created by: <span style={{ color: '#a78bfa', fontWeight: 600 }}>🛡️ Super Admin</span></>
            )}
          </p>
        </div>

        {/* Status Change & Action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {tenant.status !== 'ACTIVE' && (
            <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
              onClick={() => handleStatusChange('ACTIVE')} disabled={updatingStatus}>
              <CheckCircle size={14} /> Activate
            </button>
          )}
          {tenant.status !== 'SUSPENDED' && (
            <button className="btn btn-secondary" style={{ fontSize: 13, padding: '7px 14px', color: '#f59e0b' }}
              onClick={() => handleStatusChange('SUSPENDED')} disabled={updatingStatus}>
              <XCircle size={14} /> Suspend
            </button>
          )}
          {isSuperAdmin && (
            <button
              className="btn btn-danger"
              style={{ fontSize: 13, padding: '7px 14px', gap: 6 }}
              onClick={openDeleteModal}
            >
              <Trash2 size={14} /> Delete Center
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {/* Total Users Card with Limit Controls */}
        <div className="stat-card" style={{ padding: '14px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: 12, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} /> Total Users
            </div>
            <button
              onClick={openLimitModal}
              style={{
                background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
              }}
              title="Change User Limit for this Diagnostic Center"
            >
              <SlidersHorizontal size={11} /> Set Limit
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{tenant.users.length}</span>
            <span style={{ fontSize: 14, color: '#64748b' }}>/ {effectiveUserLimit} allowed</span>
          </div>
          <div style={{ fontSize: 11, color: tenant.maxUsers ? '#38bdf8' : '#94a3b8', marginTop: 4 }}>
            {tenant.maxUsers ? `⚡ Custom Limit: ${tenant.maxUsers} users` : `📦 Plan Default: ${tenant.plan?.maxUsers ?? 5} users`}
          </div>
        </div>

        {/* Active Modules */}
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, marginBottom: 6 }}>
            <Shield size={18} /> Active Modules
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>
            {tenant.modules.filter((m) => m.isEnabled).length}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            of {availableModules.length} total catalog modules
          </div>
        </div>

        {/* Payments */}
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, marginBottom: 6 }}>
            <CreditCard size={18} /> Payments
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>
            {tenant.subscriptionPayments.length}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Subscription invoices collected
          </div>
        </div>

        {/* Member Since */}
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, marginBottom: 6 }}>
            <Clock size={18} /> Member Since
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 2 }}>
            {formatDate(tenant.createdAt)}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Diagnostic center registered
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #1e293b', display: 'flex', gap: 0 }}>
        {(['modules', 'users', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab ? '#3b82f6' : '#64748b',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}
          >
            {tab === 'modules' ? `Modules (${availableModules.length})` : tab === 'users' ? `Users (${tenant.users.length}/${effectiveUserLimit})` : `Payments (${tenant.subscriptionPayments.length})`}
          </button>
        ))}
      </div>

      {/* ── Tab: Modules (Section-wise Grouped) ────────────── */}
      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Module Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search modules by name or key..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 13 }}
                />
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setModuleCategoryFilter('ALL')}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: moduleCategoryFilter === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                    color: moduleCategoryFilter === 'ALL' ? '#fff' : '#94a3b8',
                    transition: 'all 0.15s',
                  }}
                >
                  All ({availableModules.length})
                </button>
                {SECTION_ORDER.map((secId) => {
                  const meta = SECTION_METAS[secId];
                  const count = availableModules.filter((m) => getModuleCategory(m) === secId).length;
                  if (count === 0) return null;
                  const isSel = moduleCategoryFilter === secId;
                  return (
                    <button
                      key={secId}
                      onClick={() => setModuleCategoryFilter(secId)}
                      style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: isSel ? meta.color : 'rgba(255,255,255,0.06)',
                        color: isSel ? '#fff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
                      }}
                    >
                      <span>{meta.icon}</span> {meta.title.split('&')[0].trim()} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleGlobalAllToggle(true)}
                disabled={bulkTogglingSection === 'GLOBAL_ALL'}
                style={{ fontSize: 12, color: '#10b981' }}
              >
                Enable All ({availableModules.length})
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleGlobalAllToggle(false)}
                disabled={bulkTogglingSection === 'GLOBAL_ALL'}
                style={{ fontSize: 12, color: '#ef4444' }}
              >
                Disable All
              </button>
            </div>
          </div>

          {/* Section Groups */}
          {SECTION_ORDER.map((secId) => {
            if (moduleCategoryFilter !== 'ALL' && moduleCategoryFilter !== secId) return null;
            const meta = SECTION_METAS[secId];
            const secModules = availableModules.filter((m) => {
              if (getModuleCategory(m) !== secId) return false;
              if (!moduleSearch.trim()) return true;
              const q = moduleSearch.toLowerCase();
              return m.label.toLowerCase().includes(q) || m.key.toLowerCase().includes(q);
            });

            if (secModules.length === 0) return null;

            const activeCount = secModules.filter((m) => isModuleEnabled(m.key)).length;
            const allActive = activeCount === secModules.length;
            const allInactive = activeCount === 0;

            return (
              <div
                key={secId}
                className="card"
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                {/* Section Header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 10, paddingBottom: 14, marginBottom: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: meta.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 20,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                          {meta.title}
                        </h3>
                        <span
                          style={{
                            background: activeCount > 0 ? meta.bg : 'rgba(100,116,139,0.15)',
                            color: activeCount > 0 ? meta.color : '#64748b',
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                          }}
                        >
                          {activeCount} of {secModules.length} Active
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Bulk toggle for section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleBulkSectionToggle(secId, true)}
                      disabled={bulkTogglingSection === secId || allActive}
                      style={{ fontSize: 11, padding: '4px 10px', color: '#10b981', background: 'rgba(16,185,129,0.08)' }}
                    >
                      Enable Section
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleBulkSectionToggle(secId, false)}
                      disabled={bulkTogglingSection === secId || allInactive}
                      style={{ fontSize: 11, padding: '4px 10px', color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                    >
                      Disable Section
                    </button>
                  </div>
                </div>

                {/* Section Modules Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {secModules.map((mod) => {
                    const enabled = isModuleEnabled(mod.key);
                    const toggling = togglingModule === mod.key;
                    return (
                      <div
                        key={mod.key}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                          border: `1px solid ${enabled ? `${meta.color}40` : 'var(--border)'}`,
                          background: enabled ? `${meta.color}0a` : 'var(--bg-elevated)',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => !toggling && handleModuleToggle(mod.key, enabled)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 24, flexShrink: 0 }}>{mod.icon || '📦'}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: enabled ? '#f1f5f9' : '#64748b' }}>
                              {mod.label}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                              <span
                                style={{
                                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                                  background: 'rgba(255,255,255,0.05)', padding: '1px 5px',
                                  borderRadius: 4, color: '#94a3b8',
                                }}
                              >
                                {mod.key}
                              </span>
                              <span
                                style={{
                                  fontSize: 11, fontWeight: 600,
                                  color: enabled ? meta.color : '#475569',
                                }}
                              >
                                {enabled ? 'Active for Center' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ opacity: toggling ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                          {enabled
                            ? <ToggleRight size={28} color={meta.color} />
                            : <ToggleLeft size={28} color="#475569" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Users ──────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* User Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search user, @username, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: 32, fontSize: 13 }}
                />
              </div>

              <select
                className="form-input"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ width: 'auto', fontSize: 13 }}
              >
                <option value="ALL">All Roles ({tenant.users.length})</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* User Limit Indicator */}
              <div
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 6,
                  background: tenant.users.length >= effectiveUserLimit ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)',
                  color: tenant.users.length >= effectiveUserLimit ? '#ef4444' : '#60a5fa',
                  border: `1px solid ${tenant.users.length >= effectiveUserLimit ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>Users: {tenant.users.length} / {effectiveUserLimit}</span>
                <button
                  onClick={openLimitModal}
                  style={{
                    background: 'none', border: 'none', color: 'inherit',
                    textDecoration: 'underline', cursor: 'pointer', fontSize: 11, padding: 0,
                  }}
                >
                  Adjust Limit
                </button>
              </div>

              <button className="btn btn-primary" onClick={openAddUserModal} style={{ fontSize: 13, gap: 6 }}>
                <UserPlus size={15} /> Add User
              </button>
            </div>
          </div>

          {/* Users Table Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredUsers.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <Building2 size={32} color="#334155" />
                <p className="empty-state-sub">
                  {tenant.users.length === 0 ? 'No users found for this diagnostic center' : 'No users match your search query'}
                </p>
                {tenant.users.length === 0 && (
                  <button className="btn btn-primary btn-sm" onClick={openAddUserModal} style={{ marginTop: 12, gap: 6 }}>
                    <Plus size={14} /> Create First User
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Login</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SuperAdmin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const roleConfig = ROLE_OPTIONS.find((r) => r.value === u.role);
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #111827', transition: 'background 0.15s' }}>
                          {/* User details (Name & Email) */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34, height: 34, borderRadius: '50%',
                                  background: roleConfig?.bg ?? 'rgba(59,130,246,0.15)',
                                  color: roleConfig?.color ?? '#3b82f6',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{u.name}</div>
                                {u.email && (
                                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <Mail size={11} /> {u.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                              @{u.username}
                            </span>
                          </td>

                          {/* Role Badge */}
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                background: roleConfig?.bg ?? 'rgba(59,130,246,0.1)',
                                color: roleConfig?.color ?? '#60a5fa',
                                fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                              }}
                            >
                              {ROLE_LABELS[u.role] ?? u.role}
                            </span>
                          </td>

                          {/* Status with Quick Toggle */}
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              disabled={togglingUserId === u.id}
                              style={{
                                background: u.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${u.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: u.isActive ? '#22c55e' : '#ef4444',
                                fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                opacity: togglingUserId === u.id ? 0.6 : 1,
                              }}
                              title="Click to toggle user status"
                            >
                              {u.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {u.isActive ? 'Active' : 'Suspended'}
                            </button>
                          </td>

                          {/* Last Login */}
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                            {formatDate(u.lastLoginAt)}
                          </td>

                          {/* Superadmin Actions */}
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              {/* Reset Password Button */}
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => openResetPasswordModal(u)}
                                style={{
                                  padding: '5px 8px', fontSize: 12, color: '#f59e0b',
                                  background: 'rgba(245,158,11,0.08)', borderRadius: 6,
                                }}
                                title="Reset or change this user's password"
                              >
                                <Key size={14} /> Password
                              </button>

                              {/* Edit Info Button */}
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => openEditUserModal(u)}
                                style={{
                                  padding: '5px 8px', fontSize: 12, color: '#3b82f6',
                                  background: 'rgba(59,130,246,0.08)', borderRadius: 6,
                                }}
                                title="Edit user details"
                              >
                                <Edit3 size={14} /> Edit
                              </button>

                              {/* Delete Button */}
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDeletingUser(u)}
                                style={{
                                  padding: '5px 8px', fontSize: 12, color: '#ef4444',
                                  background: 'rgba(239,68,68,0.08)', borderRadius: 6,
                                }}
                                title="Delete user from this center"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Payments ───────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tenant.subscriptionPayments.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <CreditCard size={32} color="#334155" />
              <p className="empty-state-sub">No payment history</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Plan', 'Amount', 'Method', 'Cycle', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenant.subscriptionPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#e2e8f0' }}>{p.plan?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#22c55e' }}>{formatAmount(p.amount)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{p.method ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{p.billingCycle}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{formatDate(p.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Danger Zone Card (SUPER_ADMIN only) ─────────────── */}
      {isSuperAdmin && (
        <div
          className="card"
          style={{
            marginTop: 20,
            padding: 24,
            background: 'rgba(239,68,68,0.03)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontWeight: 700, fontSize: 15 }}>
              <AlertOctagon size={18} /> Danger Zone: Delete Organization
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, maxWidth: 600 }}>
              Permanently purges <strong>{tenant.name}</strong>, revoking access for all {tenant.users.length} users and cascading deletion across all clinical data, lab reports, invoices, and settings.
            </p>
          </div>

          <button className="btn btn-danger" onClick={openDeleteModal} style={{ gap: 6, padding: '9px 18px' }}>
            <Trash2 size={16} /> Permanently Delete Center
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════ */}

      {/* ── 1. Adjust User Limit Modal ──────────────────────── */}
      {isLimitModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isSavingLimit && setIsLimitModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <span className="modal-title">Configure User Limit</span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>For {tenant.name}</div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsLimitModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUserLimit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  Set how many staff user accounts this diagnostic center can create. Once this limit is reached, their administrators cannot add more users without an upgrade.
                </p>

                {/* Plan Default Option */}
                <label
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 8,
                    border: `1px solid ${limitChoice === 'plan' ? '#3b82f6' : 'var(--border)'}`,
                    background: limitChoice === 'plan' ? 'rgba(59,130,246,0.06)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="limitChoice"
                    checked={limitChoice === 'plan'}
                    onChange={() => setLimitChoice('plan')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                      Inherit from Plan ({tenant.plan?.name ?? 'Standard'} Plan)
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Allows <strong>{tenant.plan?.maxUsers ?? 5} users</strong> by default.
                    </div>
                  </div>
                </label>

                {/* Custom Override Option */}
                <label
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 8,
                    border: `1px solid ${limitChoice === 'custom' ? '#3b82f6' : 'var(--border)'}`,
                    background: limitChoice === 'custom' ? 'rgba(59,130,246,0.06)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="limitChoice"
                    checked={limitChoice === 'custom'}
                    onChange={() => setLimitChoice('custom')}
                    style={{ marginTop: 3 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                      Custom User Limit Override
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Override the plan limit specifically for this center (e.g., custom enterprise package).
                    </div>
                    {limitChoice === 'custom' && (
                      <div style={{ marginTop: 10 }}>
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          className="form-input"
                          placeholder="e.g. 10, 15, 25"
                          value={customLimitInput}
                          onChange={(e) => setCustomLimitInput(e.target.value)}
                          autoFocus
                          required
                          style={{ maxWidth: 160 }}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLimitModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingLimit}>
                  {isSavingLimit ? 'Saving Limit...' : 'Save User Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. Add User Modal ───────────────────────────────── */}
      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isAddingUser && setIsAddUserModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <span className="modal-title">Create User for {tenant.name}</span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Provision account from SuperAdmin</div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setIsAddUserModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tenant.users.length >= effectiveUserLimit && (
                  <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 12 }}>
                    ⚠️ <strong>Center Limit Reached:</strong> Current users ({tenant.users.length}) equals or exceeds limit ({effectiveUserLimit}). As SuperAdmin, your creation will still succeed.
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Mohammad Rafiqul Islam"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 13 }}>@</span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="rafiqul_doc"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        style={{ paddingLeft: 26 }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">System Role *</label>
                    <select
                      className="form-input"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="doctor@chamberbd.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>Initial Password *</label>
                    <button
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, password: generatePassword() })}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, cursor: 'pointer', padding: 0 }}
                    >
                      🎲 Generate Random
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      style={{ paddingRight: 36, fontFamily: showNewPassword ? 'JetBrains Mono, monospace' : undefined }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8', cursor: 'pointer', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={newUserForm.copyCredentials}
                    onChange={(e) => setNewUserForm({ ...newUserForm, copyCredentials: e.target.checked })}
                  />
                  <span>Automatically copy credentials to clipboard after creation</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isAddingUser}>
                  {isAddingUser ? 'Creating User...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. Edit User Modal ──────────────────────────────── */}
      {editingUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isUpdatingUser && setEditingUser(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <span className="modal-title">Edit User @{editingUser.username}</span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Modify details & role</div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setEditingUser(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 13 }}>@</span>
                      <input
                        type="text"
                        className="form-input"
                        value={editUserForm.username}
                        onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        style={{ paddingLeft: 26 }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-input"
                      value={editUserForm.role}
                      onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    className="form-input"
                    value={editUserForm.isActive ? 'active' : 'suspended'}
                    onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.value === 'active' })}
                  >
                    <option value="active">Active (User can login)</option>
                    <option value="suspended">Suspended (Blocked from login)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUpdatingUser}>
                  {isUpdatingUser ? 'Saving Changes...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. Reset Password Modal ─────────────────────────── */}
      {resettingUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isResettingPassword && setResettingUser(null)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <Key size={18} />
                </div>
                <div>
                  <span className="modal-title">Reset Password</span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>For {resettingUser.name} (@{resettingUser.username})</div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setResettingUser(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => handleResetPassword(e, false)}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  Set a new password for this user directly from SuperAdmin. You can copy the updated credentials to share with the center owner.
                </p>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>New Password *</label>
                    <button
                      type="button"
                      onClick={() => setResetPasswordInput(generatePassword())}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, cursor: 'pointer', padding: 0 }}
                    >
                      🎲 Generate Random
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      className="form-input"
                      value={resetPasswordInput}
                      onChange={(e) => setResetPasswordInput(e.target.value)}
                      style={{ paddingRight: 36, fontFamily: showResetPassword ? 'JetBrains Mono, monospace' : undefined }}
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResettingUser(null)}>
                  Cancel
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => handleResetPassword(e, true)}
                    disabled={isResettingPassword}
                    style={{ gap: 6 }}
                  >
                    <Copy size={14} /> Save & Copy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isResettingPassword}>
                    {isResettingPassword ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Delete User Confirmation Modal ───────────────── */}
      {deletingUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isDeletingUser && setDeletingUser(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="modal-title" style={{ color: '#ef4444' }}>Delete User Account</span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>@{deletingUser.username}</div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setDeletingUser(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>
                Are you sure you want to delete user <strong>{deletingUser.name}</strong> (<code>@{deletingUser.username}</code>) from <strong>{tenant.name}</strong>?
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                This user will lose access to the portal immediately. Historical invoices and reports linked to this user will remain safe in audit records.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingUser(null)} disabled={isDeletingUser}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteUser} disabled={isDeletingUser}>
                {isDeletingUser ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. 3-Step Danger Delete Center Modal ────────────── */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isDeleting && setIsDeleteModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 540, border: '1px solid rgba(239,68,68,0.4)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span className="modal-title" style={{ color: 'var(--danger)', fontSize: 16 }}>
                    Permanent Deletion: Step {deleteStep} of 3
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Safety Confirmation Protocol
                  </div>
                </div>
              </div>
              <button
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecuteDelete}>
              <div className="modal-body" style={{ padding: '20px 24px' }}>
                {deleteError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      fontSize: 13,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={16} /> {deleteError}
                  </div>
                )}

                {/* Step 1: Warning & Impact Analysis */}
                {deleteStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Are you absolutely sure you want to delete {tenant.name}?
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                      This action <strong>CANNOT</strong> be undone. This operation will irrevocably destroy:
                    </p>

                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All <strong>{tenant.users.length} staff and administrator accounts</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All diagnostic test catalogs, sample records, and laboratory reports
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> Complete patient database and past medical visit records
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
                        <XCircle size={15} /> All billing invoices, collected payments, and accounting transactions
                      </div>
                    </div>

                    <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
                      ⚠️ Once purged, this diagnostic center's data cannot be retrieved by CarePulse staff under any circumstances.
                    </div>
                  </div>
                )}

                {/* Step 2: Reason for Deletion */}
                {deleteStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Document Audit Reason
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                      Please provide an explanation for purging this diagnostic center (min 5 characters):
                    </p>
                    <textarea
                      className="form-input"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="e.g. Center closed operations, testing sandbox account, requested by owner..."
                      rows={3}
                      style={{ width: '100%', resize: 'none' }}
                      autoFocus
                    />
                  </div>
                )}

                {/* Step 3: Verification by Slug */}
                {deleteStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>
                      Final Safeguard Verification
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                      To confirm permanent purge, please type the center's exact slug{' '}
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#f87171',
                          background: 'rgba(239,68,68,0.15)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        {tenant.slug}
                      </span>{' '}
                      below:
                    </p>
                    <input
                      type="text"
                      className="form-input"
                      value={slugConfirmationInput}
                      onChange={(e) => setSlugConfirmationInput(e.target.value)}
                      placeholder={tenant.slug}
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        borderColor: slugConfirmationInput === tenant.slug ? '#ef4444' : undefined,
                      }}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {deleteStep > 1 ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setDeleteError(''); setDeleteStep((s) => (s - 1) as any); }}
                    disabled={isDeleting}
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                )}

                <div>
                  {deleteStep === 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setDeleteStep(2)}
                    >
                      I Understand the Impact →
                    </button>
                  )}

                  {deleteStep === 2 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        if (deleteReason.trim().length < 5) {
                          setDeleteError('Please provide a meaningful reason (at least 5 characters).');
                          return;
                        }
                        setDeleteError('');
                        setDeleteStep(3);
                      }}
                    >
                      Proceed to Slug Verification →
                    </button>
                  )}

                  {deleteStep === 3 && (
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={slugConfirmationInput.trim().toLowerCase() !== tenant.slug.toLowerCase() || isDeleting}
                    >
                      {isDeleting ? 'Purging All Records...' : 'PERMANENTLY DELETE ORGANIZATION'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
