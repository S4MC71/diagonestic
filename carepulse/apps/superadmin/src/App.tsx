import React, { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter, SuperAdminView } from './context/RouterContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TenantsView } from './views/TenantsView';
import { PlansView } from './views/PlansView';
import { ModulesView } from './views/ModulesView';
import { ModuleBuilderView } from './views/ModuleBuilderView';
import { AdminsView } from './views/AdminsView';
import { TenantDetailView } from './views/TenantDetailView';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ShieldAlert, AlertTriangle, ArrowLeft } from 'lucide-react';

const PAGE_TITLES: Record<SuperAdminView, string> = {
  dashboard: 'Executive Dashboard',
  tenants: 'Diagnostic Centers',
  plans: 'Plans & Billing',
  modules: 'Module Registry',
  'module-builder': 'Form Builder Studio',
  admins: 'Admin Team',
  billing: 'Billing Ledgers',
  support: 'Support Desk',
  settings: 'System Settings',
  'tenant-detail': 'Center Details',
  login: 'Sign In',
  'not-found': 'Page Not Found',
};

const AppInner: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { view, tenantId, navigate, securityNotice, clearSecurityNotice } = useRouter();

  // Sidebar collapsible state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cp_sa_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cp_sa_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // If in module builder mode, automatically collapse sidebar for maximized workspace width
  useEffect(() => {
    if (view === 'module-builder') {
      setSidebarCollapsed(true);
    }
  }, [view]);

  if (isLoading) {
    return (
      <div className="full-loading">
        <span
          className="spinner"
          style={{ width: 28, height: 28 }}
        />
        <span>Initializing CarePulse Core...</span>
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

      case 'module-builder':
        return isSuperAdmin ? <ModuleBuilderView /> : <DashboardView />;

      case 'admins':
        return isSuperAdmin ? <AdminsView /> : <DashboardView />;

      case 'not-found':
        return (
          <div className="empty-state" style={{ marginTop: 80, textAlign: 'center' }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
            <p className="empty-state-title">404 — Section Not Found</p>
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
            <p className="empty-state-sub">Administrative workspace module coming soon</p>
          </div>
        );
    }
  };

  const isFullBleedView = view === 'module-builder';

  return (
    <div className="app-shell">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />

      <div className="main-area">
        {/* Modern Topbar with Breadcrumbs and User Chip */}
        <Topbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />

        {/* Dynamic Main Workspace */}
        <main className={isFullBleedView ? 'content-area-clean' : 'content-area'}>
          {/* Security Alert Banner */}
          {securityNotice && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '10px 16px',
                borderRadius: 8,
                margin: isFullBleedView ? '16px 20px 0' : '0 0 16px',
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
                  color: 'inherit',
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
