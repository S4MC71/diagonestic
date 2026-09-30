import React from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter, SuperAdminView } from './context/RouterContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TenantsView } from './views/TenantsView';
import { PlansView } from './views/PlansView';
import { ModulesView } from './views/ModulesView';
import { AdminsView } from './views/AdminsView';
import { TenantDetailView } from './views/TenantDetailView';
import { Sidebar } from './components/layout/Sidebar';
import { ShieldAlert, AlertTriangle, ArrowLeft } from 'lucide-react';

const PAGE_TITLES: Record<SuperAdminView, string> = {
  dashboard: 'Dashboard',
  tenants: 'Tenants',
  plans: 'Plans & Packages',
  modules: 'Module Registry',
  admins: 'Admin Team',
  billing: 'Billing',
  support: 'Support',
  settings: 'Settings',
  'tenant-detail': 'Tenant Detail',
  login: 'Sign In',
  'not-found': 'Page Not Found',
};

const AppInner: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { view, tenantId, navigate, securityNotice, clearSecurityNotice } = useRouter();

  if (isLoading) {
    return (
      <div className="full-loading">
        <span
          className="spinner"
          style={{ borderTopColor: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)', width: 28, height: 28 }}
        />
        Loading...
      </div>
    );
  }

  // If not authenticated, render LoginView (guarded)
  if (!user) return <LoginView />;

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />;

      case 'tenants':
        return <TenantsView onViewTenant={(id) => navigate(`/tenants/${id}`)} />;

      case 'tenant-detail':
        return tenantId ? (
          <TenantDetailView tenantId={tenantId} onBack={() => navigate('/tenants')} />
        ) : (
          <TenantsView onViewTenant={(id) => navigate(`/tenants/${id}`)} />
        );

      case 'plans':
        return isSuperAdmin ? <PlansView /> : <DashboardView />;

      case 'modules':
        return isSuperAdmin ? <ModulesView /> : <DashboardView />;

      case 'admins':
        return isSuperAdmin ? <AdminsView /> : <DashboardView />;

      case 'not-found':
        return (
          <div className="empty-state" style={{ marginTop: 80, textAlign: 'center' }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
            <p className="empty-state-title">404 — Page Not Found</p>
            <p className="empty-state-sub" style={{ marginBottom: 20 }}>
              The requested administrative URL path does not exist or has been relocated.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </div>
        );

      default:
        return (
          <div className="empty-state" style={{ marginTop: 80 }}>
            <p className="empty-state-title">{PAGE_TITLES[view] || 'Section'}</p>
            <p className="empty-state-sub">Coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <span className="topbar-title">{PAGE_TITLES[view] || 'Control Panel'}</span>
          <div className="topbar-right">
            <div className="user-chip">
              <div className="user-chip-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {user.name}
            </div>
          </div>
        </header>

        <main className="content-area">
          {/* Security Alert Banner */}
          {securityNotice && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '10px 16px',
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} />
                <span>{securityNotice}</span>
              </div>
              <button
                onClick={clearSecurityNotice}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          )}

          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <RouterProvider>
      <AppInner />
    </RouterProvider>
  </AuthProvider>
);

export default App;
