import { ActiveView } from '../types';

/**
 * Canonical URL path for each ActiveView.
 * Follows clean RESTful paths (e.g. /doctor, /patient, /pharmacy/pos).
 */
export const VIEW_TO_PATH: Record<ActiveView, string> = {
  dashboard: '/dashboard',
  doctors: '/doctor',
  patients: '/patient',
  recall: '/recall',
  prescriptions: '/prescription',
  'new-prescription': '/prescription/new',
  chambers: '/chamber',
  appointments: '/appointment',
  'appointments-queue': '/appointment/queue',
  'appointments-schedule': '/appointment/schedule',
  'appointments-report': '/appointment/report',
  investigations: '/investigation',
  'investigations-groups': '/investigation/groups',
  'investigations-capacity': '/investigation/capacity',
  samples: '/sample',
  'home-collection': '/home-collection',
  'sendout-vendors': '/sendout-vendors',
  inventory: '/inventory',
  'inventory-requisitions': '/inventory/requisitions',
  drugs: '/drug',
  'report-templates': '/report-templates',
  'lab-reports': '/lab-reports',
  // Pharmacy
  'pharmacy-overview': '/pharmacy',
  'pharmacy-pos': '/pharmacy/pos',
  'pharmacy-sales': '/pharmacy/sales',
  'pharmacy-products': '/pharmacy/products',
  'pharmacy-purchases': '/pharmacy/purchases',
  'pharmacy-suppliers': '/pharmacy/suppliers',
  'pharmacy-reports': '/pharmacy/reports',
  // Finance
  invoices: '/invoice',
  'new-invoice': '/invoice/new',
  payments: '/payment',
  commissions: '/commission',
  'commissions-rules': '/commission/rules',
  'commissions-entries': '/commission/entries',
  'commissions-report': '/commission/report',
  accounting: '/accounting',
  'accounting-expenses': '/accounting/expenses',
  'accounting-pnl': '/accounting/pnl',
  // Admin
  users: '/user',
  roles: '/role',
  subscription: '/subscription',
  practice: '/practice',
  'action-inbox': '/action-inbox',
  tutorials: '/tutorial',
  support: '/support',
  settings: '/settings',
  login: '/login',
  // Front Desk / Queue
  reception: '/reception',
  'online-bookings': '/online-bookings',
  // Staff & HR
  staff: '/staff',
  'staff-attendance': '/staff/attendance',
  'staff-payroll': '/staff/payroll',
  'staff-hrm': '/staff/hrm',
  // Growth
  'website-cms': '/website-cms',
  'branding-studio': '/branding-studio',
  'sms-notifications': '/sms-notifications',
};

/**
 * Route mapping table allowing both singular and plural forms,
 * trailing slashes, and common aliases.
 */
export const PATH_TO_VIEW: Record<string, ActiveView> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/home': 'dashboard',

  // Clinical
  '/doctor': 'doctors',
  '/doctors': 'doctors',
  '/patient': 'patients',
  '/patients': 'patients',
  '/recall': 'recall',
  '/recalls': 'recall',
  '/prescription': 'prescriptions',
  '/prescriptions': 'prescriptions',
  '/prescription/new': 'new-prescription',
  '/prescriptions/new': 'new-prescription',
  '/new-prescription': 'new-prescription',
  '/chamber': 'chambers',
  '/chambers': 'chambers',
  '/appointment': 'appointments',
  '/appointments': 'appointments',
  '/appointment/queue': 'appointments-queue',
  '/appointments/queue': 'appointments-queue',
  '/appointment/waiting-room': 'appointments-queue',
  '/appointment/schedule': 'appointments-schedule',
  '/appointments/schedule': 'appointments-schedule',
  '/appointment/report': 'appointments-report',
  '/appointments/report': 'appointments-report',
  '/appointments/reports': 'appointments-report',
  '/investigation': 'investigations',
  '/investigations': 'investigations',
  '/investigation/groups': 'investigations-groups',
  '/investigations/groups': 'investigations-groups',
  '/investigation/capacity': 'investigations-capacity',
  '/investigations/capacity': 'investigations-capacity',
  '/tests': 'investigations',
  '/sample': 'samples',
  '/samples': 'samples',
  '/home-collection': 'home-collection',
  '/home-collections': 'home-collection',
  '/sendout-vendors': 'sendout-vendors',
  '/sendout': 'sendout-vendors',
  '/vendors': 'sendout-vendors',
  '/inventory': 'inventory',
  '/inventory/requisitions': 'inventory-requisitions',
  '/drug': 'drugs',
  '/drugs': 'drugs',
  '/medicines': 'drugs',
  '/report-templates': 'report-templates',
  '/templates': 'report-templates',

  // Lab
  '/lab-reports': 'lab-reports',
  '/lab': 'lab-reports',
  '/reports': 'lab-reports',

  // Pharmacy
  '/pharmacy': 'pharmacy-overview',
  '/pharmacy/overview': 'pharmacy-overview',
  '/pharmacy/pos': 'pharmacy-pos',
  '/pharmacy/counter': 'pharmacy-pos',
  '/pharmacy/sales': 'pharmacy-sales',
  '/pharmacy/products': 'pharmacy-products',
  '/pharmacy/medicines': 'pharmacy-products',
  '/pharmacy/stock': 'pharmacy-products',
  '/pharmacy/purchases': 'pharmacy-purchases',
  '/pharmacy/purchase': 'pharmacy-purchases',
  '/pharmacy/suppliers': 'pharmacy-suppliers',
  '/pharmacy/supplier': 'pharmacy-suppliers',
  '/pharmacy/reports': 'pharmacy-reports',
  '/pharmacy/report': 'pharmacy-reports',

  // Finance
  '/invoice': 'invoices',
  '/invoices': 'invoices',
  '/invoice/new': 'new-invoice',
  '/invoices/new': 'new-invoice',
  '/new-invoice': 'new-invoice',
  '/payment': 'payments',
  '/payments': 'payments',
  '/commission': 'commissions',
  '/commissions': 'commissions',
  '/commission/rules': 'commissions-rules',
  '/commission/entries': 'commissions-entries',
  '/commission/report': 'commissions-report',
  '/accounting': 'accounting',
  '/accounts': 'accounting',
  '/accounting/expenses': 'accounting-expenses',
  '/accounting/pnl': 'accounting-pnl',

  // Admin
  '/user': 'users',
  '/users': 'users',
  '/role': 'roles',
  '/roles': 'roles',
  '/subscription': 'subscription',
  '/plan': 'subscription',
  '/practice': 'practice',
  '/staff-practice': 'practice',
  '/action-inbox': 'action-inbox',
  '/inbox': 'action-inbox',
  '/tutorial': 'tutorials',
  '/tutorials': 'tutorials',
  '/support': 'support',
  '/tickets': 'support',
  '/settings': 'settings',
  '/setting': 'settings',
  '/login': 'login',

  // Front Desk
  '/reception': 'reception',
  '/queue': 'reception',
  '/waiting-room': 'reception',
  '/online-bookings': 'online-bookings',
  '/bookings': 'online-bookings',
  '/booking': 'online-bookings',

  // Staff & HR
  '/staff': 'staff',
  '/staffs': 'staff',
  '/employee': 'staff',
  '/employees': 'staff',
  '/staff/attendance': 'staff-attendance',
  '/attendance': 'staff-attendance',
  '/staff/payroll': 'staff-payroll',
  '/payroll': 'staff-payroll',
  '/salaries': 'staff-payroll',
  '/staff/hrm': 'staff-hrm',
  '/hrm': 'staff-hrm',
  '/leave': 'staff-hrm',
  '/leaves': 'staff-hrm',

  // Growth & Public
  '/website-cms': 'website-cms',
  '/website': 'website-cms',
  '/cms': 'website-cms',
  '/branding-studio': 'branding-studio',
  '/branding': 'branding-studio',
  '/marketing': 'branding-studio',
  '/sms-notifications': 'sms-notifications',
  '/sms': 'sms-notifications',
};

/**
 * Normalizes a URL pathname (stripping trailing slashes and converting to lowercase).
 */
export function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.split('?')[0].split('#')[0].toLowerCase().trim();
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

/**
 * Resolves an ActiveView from any browser pathname.
 */
export function getViewFromPath(pathname: string): ActiveView {
  const normalized = normalizePath(pathname);
  if (PATH_TO_VIEW[normalized]) {
    return PATH_TO_VIEW[normalized];
  }

  // Prefix fallbacks (e.g. /pharmacy/... -> pharmacy-overview if unknown subpath)
  if (normalized.startsWith('/pharmacy')) return 'pharmacy-overview';
  if (normalized.startsWith('/doctor')) return 'doctors';
  if (normalized.startsWith('/patient')) return 'patients';
  if (normalized.startsWith('/prescription')) return 'prescriptions';
  if (normalized.startsWith('/appointment')) return 'appointments';
  if (normalized.startsWith('/investigation')) return 'investigations';
  if (normalized.startsWith('/invoice')) return 'invoices';
  if (normalized.startsWith('/payment')) return 'payments';
  if (normalized.startsWith('/commission')) return 'commissions';
  if (normalized.startsWith('/accounting')) return 'accounting';
  if (normalized.startsWith('/user')) return 'users';
  if (normalized.startsWith('/setting')) return 'settings';
  if (normalized.startsWith('/staff/attendance') || normalized.startsWith('/attendance')) return 'staff-attendance';
  if (normalized.startsWith('/staff/payroll') || normalized.startsWith('/payroll')) return 'staff-payroll';
  if (normalized.startsWith('/staff/hrm') || normalized.startsWith('/hrm') || normalized.startsWith('/leave')) return 'staff-hrm';
  if (normalized.startsWith('/staff')) return 'staff';
  if (normalized.startsWith('/website')) return 'website-cms';
  if (normalized.startsWith('/booking')) return 'online-bookings';
  if (normalized.startsWith('/branding')) return 'branding-studio';
  if (normalized.startsWith('/sms')) return 'sms-notifications';
  if (normalized.startsWith('/reception') || normalized.startsWith('/queue')) return 'reception';

  return 'dashboard';
}

/**
 * Returns the canonical URL path for a given view.
 */
export function getPathFromView(view: ActiveView): string {
  return VIEW_TO_PATH[view] || '/dashboard';
}
