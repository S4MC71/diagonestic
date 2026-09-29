import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Building,
  FlaskConical,
  UserCheck,
  TestTube,
  Globe,
  Truck,
  Briefcase,
  FolderPlus,
  Activity,
  CreditCard,
  Home,
  DollarSign,
  Calculator,
  ShieldCheck,
  PlaySquare,
  HelpCircle,
  Settings,
  GraduationCap,
  Inbox,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  moduleKey?: string;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavCategory[] = [
  {
    category: 'CLINICAL',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'reception', label: 'Live Queue', icon: Clock, moduleKey: 'clinical' },
      { id: 'patients', label: 'Patients', icon: Users, moduleKey: 'patients' },
      { id: 'online-bookings', label: 'Online Bookings', icon: Globe, moduleKey: 'clinical' },
      { id: 'recall', label: 'Recall', icon: Calendar, moduleKey: 'recall' },
      { id: 'prescriptions', label: 'Prescriptions', icon: FileText, moduleKey: 'clinical' },
      { id: 'chambers', label: 'Chambers', icon: Building, moduleKey: 'clinical' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, moduleKey: 'clinical' },
      { id: 'investigations', label: 'Investigations', icon: FlaskConical, moduleKey: 'lab' },
      { id: 'doctors', label: 'Doctors', icon: UserCheck, moduleKey: 'clinical' },
      { id: 'samples', label: 'Samples', icon: TestTube, moduleKey: 'lab' },
      { id: 'home-collection', label: 'Home Collection', icon: Globe, moduleKey: 'home_collection' },
      { id: 'sendout-vendors', label: 'Send-Out Vendors', icon: Truck, moduleKey: 'send_out' },
      { id: 'inventory', label: 'Inventory', icon: Briefcase, moduleKey: 'inventory' },
      { id: 'drugs', label: 'Drugs', icon: FolderPlus, moduleKey: 'pharmacy' },
      { id: 'report-templates', label: 'Report Templates', icon: FileText, moduleKey: 'lab' }
    ]
  },
  {
    category: 'LAB',
    items: [
      { id: 'lab-reports', label: 'Reports', icon: Activity, moduleKey: 'lab' }
    ]
  },
  {
    category: 'PHARMACY',
    items: [
      { id: 'pharmacy-overview', label: 'Overview', icon: FolderPlus, moduleKey: 'pharmacy' },
      { id: 'pharmacy-pos', label: 'Counter', icon: CreditCard, moduleKey: 'pharmacy' },
      { id: 'pharmacy-sales', label: 'Sales', icon: Activity, moduleKey: 'pharmacy' },
      { id: 'pharmacy-products', label: 'Products', icon: Briefcase, moduleKey: 'pharmacy' },
      { id: 'pharmacy-purchases', label: 'Purchases', icon: FileText, moduleKey: 'pharmacy' },
      { id: 'pharmacy-suppliers', label: 'Suppliers', icon: Home, moduleKey: 'pharmacy' },
      { id: 'pharmacy-reports', label: 'Pharmacy Reports', icon: Activity, moduleKey: 'pharmacy' }
    ]
  },
  {
    category: 'STAFF & HR',
    items: [
      { id: 'staff', label: 'Staff Members', icon: Users, moduleKey: 'hrm' },
      { id: 'staff-attendance', label: 'Attendance', icon: UserCheck, moduleKey: 'hrm' },
      { id: 'staff-payroll', label: 'Payroll', icon: Calculator, moduleKey: 'hrm' },
      { id: 'staff-hrm', label: 'HRM & Leave', icon: Calendar, moduleKey: 'hrm' }
    ]
  },
  {
    category: 'FINANCE',
    items: [
      { id: 'invoices', label: 'Invoices', icon: FileText, moduleKey: 'finance' },
      { id: 'payments', label: 'Payments', icon: CreditCard, moduleKey: 'finance' },
      { id: 'commissions', label: 'Commissions', icon: DollarSign, moduleKey: 'commissions' },
      { id: 'accounting', label: 'Accounting', icon: Calculator, moduleKey: 'accounting' }
    ]
  },
  {
    category: 'GROWTH',
    items: [
      { id: 'website-cms', label: 'Website CMS', icon: Globe, moduleKey: 'website' },
      { id: 'branding-studio', label: 'Branding Studio', icon: Sparkles, moduleKey: 'website' },
      { id: 'sms-notifications', label: 'SMS Alerts', icon: MessageSquare, moduleKey: 'sms' }
    ]
  },
  {
    category: 'ADMIN',
    items: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'practice', label: 'Staff Practice', icon: GraduationCap },
      { id: 'action-inbox', label: 'Action Inbox', icon: Inbox },
      { id: 'tutorials', label: 'Tutorials', icon: PlaySquare },
      { id: 'support', label: 'Support', icon: HelpCircle },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, isSidebarCollapsed, toggleSidebar } = useApp();
  const { hasModule } = useAuth();

  const filteredGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasModule(item.moduleKey)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div
          className="brand-logo-wrap"
          onClick={() => setCurrentView('dashboard')}
          title="CarePulse Diagnostic Platform"
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          {isSidebarCollapsed ? (
            <img
              src="/logo-icon.svg"
              alt="CarePulse"
              style={{ height: '34px', width: '34px', objectFit: 'contain', flexShrink: 0 }}
            />
          ) : (
            <img
              src="/logo.svg"
              alt="CarePulse"
              style={{ height: '32px', width: 'auto', flexShrink: 0 }}
            />
          )}
        </div>
      </div>

      {/* Nav List with custom scroll */}
      <div className="sidebar-scroll">
        {filteredGroups.map(group => (
          <div key={group.category} className="sidebar-category">
            {!isSidebarCollapsed && (
              <span className="category-title">{group.category}</span>
            )}

            {group.items.map(item => {
              const Icon = item.icon;
              // Check active state
              const isActive =
                currentView === item.id ||
                (item.id === 'prescriptions' && currentView === 'new-prescription') ||
                (item.id === 'invoices' && currentView === 'new-invoice') ||
                (item.id === 'appointments' && currentView.startsWith('appointments')) ||
                (item.id === 'investigations' && currentView.startsWith('investigations')) ||
                (item.id === 'commissions' && currentView.startsWith('commissions')) ||
                (item.id === 'accounting' && currentView.startsWith('accounting'));

              return (
                <div
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentView(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="nav-icon" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                  {!isSidebarCollapsed && isActive && <div className="nav-dot" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Collapse Button */}
      <div className="sidebar-footer">
        <button
          className="collapse-btn"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!isSidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
