import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TenantsView } from './views/TenantsView';
import { PlansView } from './views/PlansView';
import { TenantDetailView } from './views/TenantDetailView';
import { Sidebar } from './components/layout/Sidebar';

type View = 'dashboard' | 'tenants' | 'plans' | 'billing' | 'support' | 'settings' | 'tenant-detail';

const PAGE_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  tenants: 'Tenants',
  plans: 'Plans & Packages',
  billing: 'Billing',
  support: 'Support',
  settings: 'Settings',
};

const AppInner: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const navigateToTenant = (id: string) => {
    setSelectedTenantId(id);
    setCurrentView('tenant-detail');
  };

  if (isLoading) {
    return (
      <div className="full-loading">
        <span className="spinner" style={{ borderTopColor: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)', width: 28, height: 28 }} />
        Loading...
      </div>
    );
  }

  if (!user) return <LoginView />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'tenants':   return <TenantsView onViewTenant={navigateToTenant} />;
      case 'plans':     return <PlansView />;
      case 'tenant-detail':
        return selectedTenantId
          ? <TenantDetailView tenantId={selectedTenantId} onBack={() => setCurrentView('tenants')} />
          : <TenantsView onViewTenant={navigateToTenant} />;

      default:
        return (
          <div className="empty-state" style={{ marginTop: 80 }}>
            <p className="empty-state-title">{PAGE_TITLES[currentView]}</p>
            <p className="empty-state-sub">Coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <span className="topbar-title">{PAGE_TITLES[currentView]}</span>
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
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
