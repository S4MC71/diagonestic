import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  Users,
  FileText,
  Building,
  Calendar,
  FlaskConical,
  UserCheck,
  TestTube,
  Truck,
  Building2,
  Package,
  Pill,
  BookOpen,
  ClipboardCheck,
  Store,
  CreditCard,
  TrendingUp,
  Boxes,
  ShoppingCart,
  TruckIcon,
  BarChart3,
  Receipt,
  Wallet,
  Percent,
  Calculator,
  ShieldCheck,
  KeyRound,
  Award,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string;
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
      { id: 'patients', label: 'Patients', icon: Users },
      { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
      { id: 'chambers', label: 'Chambers', icon: Building },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'investigations', label: 'Investigations', icon: FlaskConical },
      { id: 'doctors', label: 'Doctors', icon: UserCheck },
      { id: 'samples', label: 'Samples', icon: TestTube },
      { id: 'home-collection', label: 'Home Collection', icon: Truck },
      { id: 'sendout-vendors', label: 'Send-Out Vendors', icon: Building2 },
      { id: 'inventory', label: 'Inventory', icon: Package },
      { id: 'drugs', label: 'Drugs', icon: Pill },
      { id: 'report-templates', label: 'Report Templates', icon: BookOpen }
    ]
  },
  {
    category: 'LAB',
    items: [
      { id: 'lab-reports', label: 'Reports', icon: ClipboardCheck }
    ]
  },
  {
    category: 'PHARMACY',
    items: [
      { id: 'pharmacy-overview', label: 'Overview', icon: Store },
      { id: 'pharmacy-pos', label: 'Counter', icon: CreditCard },
      { id: 'pharmacy-sales', label: 'Sales', icon: TrendingUp },
      { id: 'pharmacy-products', label: 'Products', icon: Boxes },
      { id: 'pharmacy-purchases', label: 'Purchases', icon: ShoppingCart },
      { id: 'pharmacy-suppliers', label: 'Suppliers', icon: TruckIcon },
      { id: 'pharmacy-reports', label: 'Reports', icon: BarChart3 }
    ]
  },
  {
    category: 'FINANCE',
    items: [
      { id: 'invoices', label: 'Invoices', icon: Receipt },
      { id: 'payments', label: 'Payments', icon: Wallet },
      { id: 'commissions', label: 'Commissions', icon: Percent },
      { id: 'accounting', label: 'Accounting', icon: Calculator }
    ]
  },
  {
    category: 'SETTINGS',
    items: [
      { id: 'users', label: 'Users', icon: ShieldCheck },
      { id: 'roles', label: 'Roles', icon: KeyRound },
      { id: 'subscription', label: 'Subscription', icon: Award },
      { id: 'support', label: 'Support', icon: HelpCircle },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, isSidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div
          className="brand-logo-wrap"
          onClick={() => setCurrentView('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <img src="/logo.svg" alt="SihatSuite" style={{ height: '32px', width: 'auto' }} />
        </div>
      </div>

      {/* Nav List with custom scroll */}
      <div className="sidebar-scroll">
        {NAVIGATION_GROUPS.map(group => (
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
                (item.id === 'invoices' && currentView === 'new-invoice');

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
