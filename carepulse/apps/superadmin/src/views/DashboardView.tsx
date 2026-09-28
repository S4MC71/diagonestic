import React, { useEffect, useState } from 'react';
import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

interface Stats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
}

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Derive stats from tenant list
    api.get<{ data: { pagination: { total: number }; tenants: { status: string }[] } }>(
      '/api/superadmin/tenants?limit=100'
    ).then(res => {
      const tenants = res.data.tenants;
      setStats({
        totalTenants: res.data.pagination.total,
        activeTenants: tenants.filter(t => t.status === 'ACTIVE').length,
        trialTenants: tenants.filter(t => t.status === 'TRIAL').length,
        suspendedTenants: tenants.filter(t => t.status === 'SUSPENDED').length,
      });
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Tenants', value: stats?.totalTenants ?? '—', icon: <Building2 size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Active', value: stats?.activeTenants ?? '—', icon: <TrendingUp size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Trial', value: stats?.trialTenants ?? '—', icon: <Users size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Suspended', value: stats?.suspendedTenants ?? '—', icon: <CreditCard size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview</p>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Welcome to the CarePulse SuperAdmin panel. Use the sidebar to manage tenants, plans, billing, and support.
        </p>
      </div>
    </div>
  );
};
