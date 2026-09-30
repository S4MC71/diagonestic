import React, { useEffect } from 'react';
import { Lock, LayoutDashboard, Users, Plus, Clock, Menu } from 'lucide-react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { PrintModal } from './components/print/PrintModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { PrescriptionsView } from './views/PrescriptionsView';
import { NewPrescriptionView } from './views/NewPrescriptionView';
import { ChambersView } from './views/ChambersView';
import { AppointmentsView } from './views/AppointmentsView';
import { InvestigationsView } from './views/InvestigationsView';
import { DoctorsView } from './views/DoctorsView';
import { SamplesView } from './views/SamplesView';
import { HomeCollectionView } from './views/HomeCollectionView';
import { SendOutVendorsView } from './views/SendOutVendorsView';
import { InventoryView } from './views/InventoryView';
import { DrugsView } from './views/DrugsView';
import { ReportTemplatesView } from './views/ReportTemplatesView';
import { LabReportsView } from './views/LabReportsView';
import { PharmacyViews } from './views/PharmacyViews';
import { InvoicesView } from './views/InvoicesView';
import { NewInvoiceView } from './views/NewInvoiceView';
import { PaymentsView } from './views/PaymentsView';
import { CommissionsView } from './views/CommissionsView';
import { AccountingView } from './views/AccountingView';
import { UsersView, RolesView, SubscriptionView, SupportView, SettingsView } from './views/AdminViews';
import { RecallView } from './views/RecallView';
import { TutorialsView } from './views/TutorialsView';
import { PracticeView } from './views/PracticeView';
import { ActionInboxView } from './views/ActionInboxView';

// New Growth, Clinical, HRM & Public Views
import { ReceptionView } from './views/ReceptionView';
import { StaffView } from './views/StaffView';
import { AttendanceView } from './views/AttendanceView';
import { PayrollView } from './views/PayrollView';
import { HRMView } from './views/HRMView';
import { WebsiteCMSView } from './views/WebsiteCMSView';
import { OnlineBookingsView } from './views/OnlineBookingsView';
import { BrandingStudioView } from './views/BrandingStudioView';
import { SmsNotificationsView } from './views/SmsNotificationsView';
import { PublicReportPage } from './views/PublicReportPage';
import { DynamicModuleView } from './views/DynamicModuleView';

const VIEW_MODULE_MAP: Record<string, string> = {
  patients: 'patients',
  recall: 'recall',
  prescriptions: 'clinical',
  'new-prescription': 'clinical',
  chambers: 'clinical',
  appointments: 'clinical',
  investigations: 'lab',
  doctors: 'clinical',
  samples: 'lab',
  'home-collection': 'home_collection',
  'sendout-vendors': 'send_out',
  inventory: 'inventory',
  drugs: 'pharmacy',
  'report-templates': 'lab',
  'lab-reports': 'lab',
  'pharmacy-overview': 'pharmacy',
  'pharmacy-pos': 'pharmacy',
  'pharmacy-sales': 'pharmacy',
  'pharmacy-products': 'pharmacy',
  'pharmacy-purchases': 'pharmacy',
  'pharmacy-suppliers': 'pharmacy',
  'pharmacy-reports': 'pharmacy',
  invoices: 'finance',
  'new-invoice': 'finance',
  payments: 'finance',
  commissions: 'commissions',
  accounting: 'accounting',
  reception: 'clinical',
  'online-bookings': 'website',
  staff: 'hrm',
  'staff-attendance': 'hrm',
  'staff-payroll': 'hrm',
  'staff-hrm': 'hrm',
  'website-cms': 'website',
  'branding-studio': 'website',
  'sms-notifications': 'sms',
};

export const App: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    toggleSidebar,
    closePrintModal,
    showPrintModal,
    tenantSettings,
    updateTenantSettings,
    currentUser,
    setCurrentUser,
  } = useApp();
  const { authUser, isAuthLoading, hasModule, modules } = useAuth();

  // Synchronize authenticated tenant user and center metadata into AppContext
  useEffect(() => {
    if (authUser) {
      if (authUser.tenant?.name && tenantSettings.name !== authUser.tenant.name) {
        updateTenantSettings({
          name: authUser.tenant.name,
          slug: authUser.tenant.slug || tenantSettings.slug,
        });
      }
      if (!currentUser || currentUser.username !== authUser.username) {
        setCurrentUser({
          id: authUser.id,
          name: authUser.name || 'Administrator',
          username: authUser.username,
          email: authUser.email || '',
          phone: '',
          role: authUser.role,
          roles: [authUser.role],
          status: 'ACTIVE',
          isActive: true,
          active: true,
          joinedDate: new Date().toLocaleDateString(),
          signatureUrl: '',
        });
      }
    }
  }, [authUser, tenantSettings.name, currentUser, updateTenantSettings, setCurrentUser]);

  // Global Clinical & POS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes print modal
      if (e.key === 'Escape' && showPrintModal) {
        e.preventDefault();
        closePrintModal();
        return;
      }

      // If active inside an input, only handle F-keys
      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT';

      if (!isInputFocused && e.key === '/') {
        e.preventDefault();
        setCurrentView('new-invoice');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setCurrentView('pharmacy-pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setCurrentView('new-prescription');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCurrentView('new-invoice');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setCurrentView('patients');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setCurrentView('invoices');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView, showPrintModal, closePrintModal]);

  // Public Patient Report Route (e.g. /r/:token or /public/report/:token)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/r/') || pathname.startsWith('/public/report/')) {
    const token = pathname.startsWith('/r/')
      ? pathname.replace('/r/', '')
      : pathname.replace('/public/report/', '');
    return <PublicReportPage token={token} />;
  }

  // Show loading spinner while checking auth
  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // If on login view or not authenticated, render clean full-screen login layout
  if (currentView === 'login' || !authUser) {
    return <LoginView />;
  }

  // Dynamic View Resolver
  const renderCurrentView = () => {
    const requiredModule = VIEW_MODULE_MAP[currentView];
    if (requiredModule && !hasModule(requiredModule)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', padding: 24 }}>
          <div style={{ maxWidth: 460, width: '100%', padding: '40px 32px', textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444' }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Module Not Subscribed</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
              The <strong style={{ color: '#0f172a' }}>{requiredModule.toUpperCase()}</strong> module is not included in your diagnostic center's current subscription. Please contact your administrator to activate this service.
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                background: '#059669',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'patients':
        return <PatientsView />;
      case 'recall':
        return <RecallView />;
      case 'prescriptions':
        return <PrescriptionsView />;
      case 'new-prescription':
        return <NewPrescriptionView />;
      case 'chambers':
        return <ChambersView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'investigations':
        return <InvestigationsView />;
      case 'doctors':
        return <DoctorsView />;
      case 'samples':
        return <SamplesView />;
      case 'home-collection':
        return <HomeCollectionView />;
      case 'sendout-vendors':
        return <SendOutVendorsView />;
      case 'inventory':
        return <InventoryView />;
      case 'drugs':
        return <DrugsView />;
      case 'report-templates':
        return <ReportTemplatesView />;
      case 'lab-reports':
        return <LabReportsView />;
      case 'pharmacy-overview':
      case 'pharmacy-pos':
      case 'pharmacy-sales':
      case 'pharmacy-products':
      case 'pharmacy-purchases':
      case 'pharmacy-suppliers':
      case 'pharmacy-reports':
        return <PharmacyViews />;
      case 'invoices':
        return <InvoicesView />;
      case 'new-invoice':
        return <NewInvoiceView />;
      case 'payments':
        return <PaymentsView />;
      case 'commissions':
        return <CommissionsView />;
      case 'accounting':
        return <AccountingView />;
      case 'users':
        return <UsersView />;
      case 'roles':
        return <RolesView />;
      case 'subscription':
        return <SubscriptionView />;
      case 'practice':
        return <PracticeView />;
      case 'action-inbox':
        return <ActionInboxView />;
      case 'tutorials':
        return <TutorialsView />;
      case 'support':
        return <SupportView />;
      case 'settings':
        return <SettingsView />;
      case 'reception':
        return <ReceptionView />;
      case 'staff':
        return <StaffView />;
      case 'staff-attendance':
        return <AttendanceView />;
      case 'staff-payroll':
        return <PayrollView />;
      case 'staff-hrm':
        return <HRMView />;
      case 'website-cms':
        return <WebsiteCMSView />;
      case 'online-bookings':
        return <OnlineBookingsView />;
      case 'branding-studio':
        return <BrandingStudioView />;
      case 'sms-notifications':
        return <SmsNotificationsView />;
      default:
        if (hasModule(currentView) || (modules && modules.includes(currentView))) {
          return <DynamicModuleView moduleKey={currentView} />;
        }
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Mobile Backdrop Overlay */}
      {!isSidebarCollapsed && (
        <div className="sidebar-mobile-backdrop" onClick={toggleSidebar} />
      )}

      {/* Main Content Shell */}
      <div className={`main-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Topbar />
        <main className="content-body">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Active on Mobile <= 768px) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
          type="button"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {hasModule('patients') && (
          <button
            className={`mobile-nav-btn ${currentView === 'patients' ? 'active' : ''}`}
            onClick={() => setCurrentView('patients')}
            type="button"
          >
            <Users size={20} />
            <span>Patients</span>
          </button>
        )}

        {hasModule('finance') && (
          <button
            className="mobile-nav-fab"
            onClick={() => setCurrentView('new-invoice')}
            type="button"
            title="New Invoice"
          >
            <Plus size={24} />
          </button>
        )}

        {hasModule('clinical') && (
          <button
            className={`mobile-nav-btn ${currentView === 'reception' ? 'active' : ''}`}
            onClick={() => setCurrentView('reception')}
            type="button"
          >
            <Clock size={20} />
            <span>Queue</span>
          </button>
        )}

        <button
          className={`mobile-nav-btn ${!isSidebarCollapsed ? 'active' : ''}`}
          onClick={toggleSidebar}
          type="button"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>

      {/* Global Print Modal Overlay (Thermal 80mm & A4 formats) */}
      <PrintModal />
    </div>
  );
};
export default App;
