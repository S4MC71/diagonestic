import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
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

export const App: React.FC = () => {
  const { currentView, setCurrentView, isSidebarCollapsed, toggleSidebar, currentUser, closePrintModal, showPrintModal } = useApp();

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

  // If on login view, render clean full-screen login layout
  if (currentView === 'login' || !currentUser) {
    return <LoginView />;
  }

  // Dynamic View Resolver
  const renderCurrentView = () => {
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
      default:
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

      {/* Global Print Modal Overlay (Thermal 80mm & A4 formats) */}
      <PrintModal />
    </div>
  );
};
export default App;
