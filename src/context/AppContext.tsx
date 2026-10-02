import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveView,
  User,
  Patient,
  PatientVitalRecord,
  PrescriptionRecord,
  DiagnosticTest,
  Invoice,
  Sample,
  Doctor,
  Chamber,
  Appointment,
  WeeklySitting,
  PharmacyProduct,
  PharmacySale,
  Supplier,
  TenantSettings,
  AccountingTransaction,
  CommissionEntry,
  CommissionRule,
  Requisition,
  LabReport,
  InventoryItem,
  RecallRule,
  SupportTicket,
  SubscriptionPayment,
  ActiveSubscription,
  StaffMember,
  LeaveType,
  LeaveRequest,
  AttendanceRecord,
  PayrollRecord,
  SalaryAdvance,
  TenantWebsite,
  PublicBookingRequest,
  ReportShareLink,
  SmsLog,
  SmsConfig
} from '../types';
import { getViewFromPath, getPathFromView } from '../utils/navigation';
import {
  initialUsers,
  initialPatients,
  initialTests,
  initialInvoices,
  initialDoctors,
  initialChambers,
  initialAppointments,
  initialPharmacyProducts,
  initialSuppliers,
  initialSendOutVendors,
  initialSettings,
  initialInventory,
  initialTransactions,
  initialSupportTickets,
  initialActiveSubscription,
  initialSubscriptionPayments,
  INITIAL_STAFF_MEMBERS,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_SALARY_ADVANCES,
  INITIAL_TENANT_WEBSITE,
  INITIAL_PUBLIC_BOOKING_REQUESTS,
  INITIAL_REPORT_SHARE_LINKS,
  INITIAL_SMS_LOGS,
  INITIAL_SMS_CONFIG
} from '../data/mockData';

interface AppContextType {
  // State
  currentUser: User | null;
  currentView: ActiveView;
  isSidebarCollapsed: boolean;
  activePrintInvoice: Invoice | null;
  activePrintFormat: 'thermal' | 'a4' | 'a5';
  activePrintColor: 'Color' | 'B&W';
  showPrintModal: boolean;
  toastMessage: string | null;

  // Data
  users: User[];
  patients: Patient[];
  diagnosticTests: DiagnosticTest[];
  tests: DiagnosticTest[];
  invoices: Invoice[];
  samples: Sample[];
  labReports: LabReport[];
  doctors: Doctor[];
  chambers: any[];
  appointments: Appointment[];
  weeklySittings: WeeklySitting[];
  requisitions: Requisition[];
  commissionRules: CommissionRule[];
  commissionEntries: CommissionEntry[];
  inventoryItems: InventoryItem[];
  pharmacyProducts: PharmacyProduct[];
  pharmacySales: PharmacySale[];
  suppliers: Supplier[];
  sendOutVendors: any[];
  payments: any[];
  transactions: AccountingTransaction[];
  tenantSettings: TenantSettings;

  // Actions
  setCurrentUser: (user: User | null) => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  setCurrentView: (view: ActiveView, replace?: boolean) => void;
  toggleSidebar: () => void;
  showToast: (msg: string) => void;
  addChamber: (chamber: any) => void;
  updateChamber: (id: string, updates: Partial<Chamber>) => void;
  deleteChamber: (id: string) => void;
  addDoctor: (doctor: any) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  clearMockDoctorsAndChambers: () => void;
  recordPayment: (payment: any) => void;

  // Business Operations
  createInvoice: (inv: any) => void;
  collectDuePayment: (invoiceId: string, amount: number, method: string) => void;
  openPrintModal: (invoice: Invoice, format?: 'thermal' | 'a4' | 'a5') => void;
  closePrintModal: () => void;
  setActivePrintFormat: (format: 'thermal' | 'a4' | 'a5') => void;
  setActivePrintColor: (color: 'Color' | 'B&W') => void;

  addPatient: (patient: Omit<Patient, 'id' | 'patientId' | 'code' | 'totalVisits' | 'totalSpent' | 'outstandingDue' | 'lastVisit' | 'createdAt'> & { code?: string }) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  updateTestPrice: (id: string, price: number) => void;
  updateTestStockCapacity: (id: string, trackStock: boolean, alertThreshold?: number) => void;
  collectSample: (sampleId: string, collectorName: string) => void;
  receiveSampleInLab: (sampleId: string) => void;
  updateLabReportResults: (invoiceId: string, results: any[], remarks?: string) => void;
  verifyLabReport: (invoiceId: string, pathologistName: string) => void;

  // Appointments
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addAppointment: (app: Omit<Appointment, 'id' | 'serialNo'>) => Appointment;
  deleteAppointment: (id: string) => void;
  clearCompletedAppointments: () => void;
  resetTodayQueue: () => void;
  addWeeklySitting: (sitting: Omit<WeeklySitting, 'id'>) => void;

  // Inventory & Requisitions
  createRequisition: (req: Omit<Requisition, 'id' | 'reqNo' | 'date'>) => void;
  updateRequisitionStatus: (id: string, status: Requisition['status']) => void;

  // Finance & Commissions
  addExpense: (expense: Omit<AccountingTransaction, 'id'>) => void;
  addCommissionRule: (rule: Omit<CommissionRule, 'id'>) => void;
  disburseCommission: (doctorId: string, amount: number) => void;

  // Pharmacy
  createPharmacySale: (sale: PharmacySale) => void;

  // Prescriptions & Clinical Records
  prescriptions: PrescriptionRecord[];
  savePrescription: (rx: Omit<PrescriptionRecord, 'id'> & { id?: string }) => PrescriptionRecord;
  deletePrescription: (id: string) => void;

  // Recall
  recallRules: RecallRule[];
  addRecallRule: (rule: Omit<RecallRule, 'id' | 'createdAt'>) => void;
  deleteRecallRule: (id: string) => void;
  addCommonRecallRules: () => void;

  // Support
  supportTickets: SupportTicket[];
  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNo' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateTicketStatus: (id: string, status: SupportTicket['status'], updateNote?: string) => void;

  // Subscription
  activeSubscription: ActiveSubscription;
  updateActiveSubscription: (sub: Partial<ActiveSubscription>) => void;
  subscriptionPayments: SubscriptionPayment[];
  recordSubscriptionPayment: (payment: Omit<SubscriptionPayment, 'id' | 'receiptNo' | 'date'>) => void;

  // User Management
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Settings
  updateTenantSettings: (settings: Partial<TenantSettings>) => void;

  // Staff & HRM
  staffMembers: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'createdAt'>) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;

  // Leave Management
  leaveTypes: LeaveType[];
  addLeaveType: (type: Omit<LeaveType, 'id'>) => void;
  deleteLeaveType: (id: string) => void;
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => void;
  reviewLeaveRequest: (id: string, status: 'APPROVED' | 'REJECTED', reviewerName?: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  markBulkAttendance: (records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]) => void;

  // Payroll
  payrollRecords: PayrollRecord[];
  generatePayroll: (month: string) => void;
  markPayrollPaid: (id: string, paymentMethod?: string, paidBy?: string) => void;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;
  salaryAdvances: SalaryAdvance[];
  giveSalaryAdvance: (adv: Omit<SalaryAdvance, 'id' | 'createdAt' | 'isDeducted'>) => void;

  // Website CMS
  tenantWebsite: TenantWebsite;
  updateTenantWebsite: (updates: Partial<TenantWebsite>) => void;

  // Public Online Bookings
  bookingRequests: PublicBookingRequest[];
  addBookingRequest: (req: Omit<PublicBookingRequest, 'id' | 'createdAt' | 'status'>) => void;
  confirmBookingRequest: (id: string, confirmedBy?: string) => void;
  cancelBookingRequest: (id: string) => void;

  // Report Share Links
  reportShareLinks: ReportShareLink[];
  generateReportShareLink: (invoiceIdOrId: string, invoiceNoOrProtected?: string | boolean, patientName?: string, patientPhone?: string) => ReportShareLink;
  getReportShareLink: (token: string) => ReportShareLink | undefined;

  // SMS Notifications
  smsConfig: SmsConfig;
  updateSmsConfig: (updates: Partial<SmsConfig>) => void;
  smsLogs: SmsLog[];
  sendSmsNotification: (phone: string, message: string, type?: SmsLog['type']) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentViewState] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      return getViewFromPath(window.location.pathname);
    }
    return 'dashboard';
  });

  const setCurrentView = (view: ActiveView, replace = false) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      const targetPath = getPathFromView(view);
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ view }, '', targetPath);
        } else {
          window.history.pushState({ view }, '', targetPath);
        }
      }
    }
  };

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const view = getViewFromPath(window.location.pathname);
      setCurrentViewState(view);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure initial URL reflects canonical path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canonical = getPathFromView(currentView);
      if (window.location.pathname !== canonical) {
        window.history.replaceState({ view: currentView }, '', canonical);
      }
    }
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);
  const [activePrintFormat, setActivePrintFormat] = useState<'thermal' | 'a4' | 'a5'>('a4');
  const [activePrintColor, setActivePrintColor] = useState<'Color' | 'B&W'>('Color');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('cp_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let maxSeq = 0;
          parsed.forEach((p: Patient) => {
            const rawCode = p.code || p.patientId || '';
            const match = rawCode.match(/PAT-\d{4}-(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxSeq) maxSeq = num;
            }
          });

          return parsed.map((p: Patient) => {
            let code = p.code || p.patientId;
            if (!code || !code.startsWith('PAT-')) {
              maxSeq += 1;
              code = `PAT-2026-${String(maxSeq).padStart(4, '0')}`;
            }
            return {
              ...p,
              code,
              patientId: p.patientId || code
            };
          });
        }
      }
    } catch {}
    return initialPatients;
  });
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>(initialTests);
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('cp_invoices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialInvoices;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('cp_appointments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialAppointments;
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem('cp_doctors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialDoctors;
  });
  const [chambers, setChambers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cp_chambers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialChambers;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_doctors', JSON.stringify(doctors));
    } catch {}
  }, [doctors]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_chambers', JSON.stringify(chambers));
    } catch {}
  }, [chambers]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_patients', JSON.stringify(patients));
    } catch {}
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_invoices', JSON.stringify(invoices));
    } catch {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_appointments', JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cp_prescriptions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'rx-1',
        rxNo: 'RX-2026-0001',
        date: '2026-09-14',
        patientId: 'pat-1',
        patientName: 'Md. Rafiqul Islam',
        patientCode: 'PAT-2026-0001',
        age: 48,
        gender: 'Male',
        doctorId: 'doc-1',
        doctorName: 'Prof. Dr. M. A. Rahman',
        chamber: 'Chamber 101',
        chiefComplaint: 'Chest tightness on exertion, intermittent cough',
        diagnosis: 'Essential Hypertension, Type 2 DM',
        followUp: '21 Sept',
        drugsCount: 4,
        vitals: {
          bp: '130/85',
          pulse: '78',
          temp: '98.6',
          weight: '72',
          spo2: '98'
        },
        createdAt: '2026-09-14'
      },
      {
        id: 'rx-2',
        rxNo: 'RX-2026-0002',
        date: '2026-09-15',
        patientId: 'pat-2',
        patientName: 'Begum Rokeya Akter',
        patientCode: 'PAT-2026-0002',
        age: 34,
        gender: 'Female',
        doctorId: 'doc-2',
        doctorName: 'Dr. Farhana Islam',
        chamber: 'Chamber 102',
        chiefComplaint: 'Mild generalized weakness, joint ache',
        diagnosis: 'Nutritional Deficiency / Iron Deficiency Anaemia',
        followUp: '28 Sept',
        drugsCount: 3,
        vitals: {
          bp: '115/75',
          pulse: '72',
          temp: '98.4',
          weight: '58',
          spo2: '99'
        },
        createdAt: '2026-09-15'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_prescriptions', JSON.stringify(prescriptions));
    } catch {}
  }, [prescriptions]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventory);
  const [pharmacyProducts, setPharmacyProducts] = useState<PharmacyProduct[]>(initialPharmacyProducts);
  const [pharmacySales, setPharmacySales] = useState<PharmacySale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [sendOutVendors, setSendOutVendors] = useState<any[]>(initialSendOutVendors);
  const [payments, setPayments] = useState<any[]>([
    {
      id: 'p-1',
      receiptNo: 'MR-2026-0001',
      invoiceNo: 'INV-2026-0001',
      patientName: 'Md. Rafiqul Islam',
      date: '2026-09-02',
      time: '10:35 AM',
      amount: 900,
      method: 'Cash',
      receivedBy: 'admin'
    }
  ]);
  const [transactions, setTransactions] = useState<AccountingTransaction[]>(initialTransactions);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>(() => {
    try {
      const stored = localStorage.getItem('cp_tenant');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          return {
            ...initialSettings,
            ...parsed,
          };
        }
      }
    } catch {
      // fallback
    }
    return initialSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_tenant', JSON.stringify(tenantSettings));
    } catch {}
  }, [tenantSettings]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription>(initialActiveSubscription);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>(initialSubscriptionPayments);

  // Staff & HRM State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    try {
      const s = localStorage.getItem('cp_staff');
      return s ? JSON.parse(s) : INITIAL_STAFF_MEMBERS;
    } catch {
      return INITIAL_STAFF_MEMBERS;
    }
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    try {
      const s = localStorage.getItem('cp_leave_types');
      return s ? JSON.parse(s) : INITIAL_LEAVE_TYPES;
    } catch {
      return INITIAL_LEAVE_TYPES;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const s = localStorage.getItem('cp_leave_requests');
      return s ? JSON.parse(s) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const s = localStorage.getItem('cp_attendance');
      return s ? JSON.parse(s) : INITIAL_ATTENDANCE_RECORDS;
    } catch {
      return INITIAL_ATTENDANCE_RECORDS;
    }
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    try {
      const s = localStorage.getItem('cp_payroll');
      return s ? JSON.parse(s) : INITIAL_PAYROLL_RECORDS;
    } catch {
      return INITIAL_PAYROLL_RECORDS;
    }
  });

  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>(() => {
    try {
      const s = localStorage.getItem('cp_advances');
      return s ? JSON.parse(s) : INITIAL_SALARY_ADVANCES;
    } catch {
      return INITIAL_SALARY_ADVANCES;
    }
  });

  const [tenantWebsite, setTenantWebsite] = useState<TenantWebsite>(() => {
    try {
      const s = localStorage.getItem('cp_website');
      return s ? JSON.parse(s) : INITIAL_TENANT_WEBSITE;
    } catch {
      return INITIAL_TENANT_WEBSITE;
    }
  });

  const [bookingRequests, setBookingRequests] = useState<PublicBookingRequest[]>(() => {
    try {
      const s = localStorage.getItem('cp_bookings');
      return s ? JSON.parse(s) : INITIAL_PUBLIC_BOOKING_REQUESTS;
    } catch {
      return INITIAL_PUBLIC_BOOKING_REQUESTS;
    }
  });

  const [reportShareLinks, setReportShareLinks] = useState<ReportShareLink[]>(() => {
    try {
      const s = localStorage.getItem('cp_share_links');
      return s ? JSON.parse(s) : INITIAL_REPORT_SHARE_LINKS;
    } catch {
      return INITIAL_REPORT_SHARE_LINKS;
    }
  });

  const [smsConfig, setSmsConfig] = useState<SmsConfig>(() => {
    try {
      const s = localStorage.getItem('cp_sms_config');
      if (s) {
        const parsed = JSON.parse(s);
        return {
          ...INITIAL_SMS_CONFIG,
          ...parsed,
        };
      }
    } catch {
      return INITIAL_SMS_CONFIG;
    }
    return INITIAL_SMS_CONFIG;
  });

  const [smsLogs, setSmsLogs] = useState<SmsLog[]>(() => {
    try {
      const s = localStorage.getItem('cp_sms_logs');
      return s ? JSON.parse(s) : INITIAL_SMS_LOGS;
    } catch {
      return INITIAL_SMS_LOGS;
    }
  });

  // Persist new feature states
  useEffect(() => {
    try {
      localStorage.setItem('cp_staff', JSON.stringify(staffMembers));
    } catch {}
  }, [staffMembers]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_leave_types', JSON.stringify(leaveTypes));
    } catch {}
  }, [leaveTypes]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_leave_requests', JSON.stringify(leaveRequests));
    } catch {}
  }, [leaveRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_attendance', JSON.stringify(attendanceRecords));
    } catch {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_payroll', JSON.stringify(payrollRecords));
    } catch {}
  }, [payrollRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_advances', JSON.stringify(salaryAdvances));
    } catch {}
  }, [salaryAdvances]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_website', JSON.stringify(tenantWebsite));
    } catch {}
  }, [tenantWebsite]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_bookings', JSON.stringify(bookingRequests));
    } catch {}
  }, [bookingRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_share_links', JSON.stringify(reportShareLinks));
    } catch {}
  }, [reportShareLinks]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_sms_config', JSON.stringify(smsConfig));
    } catch {}
  }, [smsConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('cp_sms_logs', JSON.stringify(smsLogs));
    } catch {}
  }, [smsLogs]);

  // Secondary Data
  const [weeklySittings, setWeeklySittings] = useState<WeeklySitting[]>([
    {
      id: 'ws-1',
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. M. A. Rahman',
      dayOfWeek: 'Sunday',
      startTime: '05:00 PM',
      endTime: '09:00 PM',
      maxSerials: 25,
      fee: 1000
    },
    {
      id: 'ws-2',
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. M. A. Rahman',
      dayOfWeek: 'Tuesday',
      startTime: '05:00 PM',
      endTime: '09:00 PM',
      maxSerials: 25,
      fee: 1000
    }
  ]);

  const [requisitions, setRequisitions] = useState<Requisition[]>([
    {
      id: 'req-1',
      reqNo: 'REQ-2026-0001',
      department: 'Haematology Lab',
      requestedBy: 'Farzana Parvin',
      date: '2026-09-02',
      items: [
        { itemId: 'inv-1', itemName: 'CBC 3-Part Diluent Reagent (20L)', qty: 2, note: 'Stock low' },
        { itemId: 'inv-3', itemName: 'EDTA K3 Purple Top Vacutainer Tubes (100 pcs)', qty: 3 }
      ],
      status: 'approved',
      notes: 'Urgent for weekend rush'
    }
  ]);

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([
    {
      id: 'cr-1',
      agentId: 'doc-1',
      agentName: 'Prof. Dr. M. A. Rahman',
      scope: 'General',
      calculationType: 'Percentage',
      value: 30,
      status: 'Active'
    },
    {
      id: 'cr-2',
      agentId: 'doc-2',
      agentName: 'Dr. Nusrat Jahan',
      scope: 'General',
      calculationType: 'Percentage',
      value: 25,
      status: 'Active'
    }
  ]);

  const [commissionEntries, setCommissionEntries] = useState<CommissionEntry[]>([
    {
      id: 'ce-1',
      invoiceId: 'inv-1',
      invoiceNo: 'INV-2026-0001',
      date: '2026-09-02',
      doctorId: 'doc-1',
      doctorName: 'Prof. Dr. M. A. Rahman',
      billedAmount: 900,
      commissionRate: '30%',
      commissionAmount: 270,
      status: 'Accrued'
    }
  ]);

  const [samples, setSamples] = useState<Sample[]>([
    {
      id: 'smp-1',
      sampleId: 'SMP-2026-0001',
      invoiceId: 'inv-1',
      invoiceNo: 'INV-2026-0001',
      patientName: 'Md. Rafiqul Islam',
      patientPhone: '01718-123456',
      patientAge: 48,
      patientGender: 'Male',
      testNames: ['Complete Blood Count (CBC) with ESR', 'Lipid Profile'],
      sampleType: 'Blood',
      containerType: 'Purple Top (EDTA)',
      status: 'Collected',
      collectedAt: '2026-09-02 10:45 AM',
      collectedBy: 'Md. Al-Amin',
      barcode: 'SMP20260001'
    },
    {
      id: 'smp-2',
      sampleId: 'SMP-2026-0002',
      invoiceId: 'inv-2',
      invoiceNo: 'INV-2026-0002',
      patientName: 'Begum Rokeya Akter',
      patientPhone: '01911-987654',
      patientAge: 35,
      patientGender: 'Female',
      testNames: ['Urine Routine Examination (R/M/E)'],
      sampleType: 'Urine',
      containerType: 'Urine Container',
      status: 'Pending Collection',
      barcode: 'SMP20260002'
    }
  ]);

  const [labReports, setLabReports] = useState<LabReport[]>([
    {
      id: 'rep-1',
      invoiceId: 'inv-1',
      invoiceNo: 'INV-2026-0001',
      patientName: 'Md. Rafiqul Islam',
      patientPhone: '01718-123456',
      patientAge: 48,
      patientGender: 'Male',
      testName: 'Complete Blood Count (CBC) with ESR',
      category: 'Haematology',
      technologistName: 'Farzana Parvin',
      technologistDegree: 'B.Sc in Medical Technology (Lab)',
      pathologistName: 'Prof. Dr. M. A. Rahman',
      pathologistDegree: 'MBBS, M.Phil (Pathology)',
      status: 'COMPLETED',
      results: [
        { parameterName: 'Hemoglobin (Hb%)', resultValue: '13.8', unit: 'g/dL', normalRange: '13.0 - 17.0', isAbnormal: false },
        { parameterName: 'Total WBC Count', resultValue: '8,200', unit: '/cu.mm', normalRange: '4,000 - 11,000', isAbnormal: false },
        { parameterName: 'Platelet Count', resultValue: '250,000', unit: '/cu.mm', normalRange: '150,000 - 450,000', isAbnormal: false },
        { parameterName: 'ESR (Westergren)', resultValue: '14', unit: 'mm in 1st hr', normalRange: '0 - 20', isAbnormal: false }
      ]
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const login = (username: string, _password?: string) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      showToast(`Successfully signed in to ${tenantSettings.name || 'Diagnostic Center'}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    showToast('Signed out safely');
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const openPrintModal = (invoice: Invoice, format?: 'thermal' | 'a4' | 'a5') => {
    setActivePrintInvoice(invoice);
    if (format) setActivePrintFormat(format);
    setShowPrintModal(true);
  };

  const closePrintModal = () => {
    setShowPrintModal(false);
  };

  // Automated Invoicing & Cascading Event Flow
  const createInvoice = (invInput: any) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const inv: Invoice = {
      id: invInput.id || `inv-${Date.now()}`,
      invoiceNo: invInput.invoiceNo || `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`,
      date: invInput.date || today,
      time: invInput.time || nowTime,
      patientId: invInput.patientId || 'pat-walkin',
      patientCode: invInput.patientCode || 'PAT-WALKIN',
      patientName: invInput.patientName || 'Walk-in Patient',
      patientPhone: invInput.patientPhone || '',
      patientAge: invInput.patientAge || 30,
      patientGender: invInput.patientGender || 'Male',
      patientAddress: invInput.patientAddress || 'Central Square',
      referredById: invInput.referredById || invInput.referralDoctorId,
      referredByName: invInput.referredByName || invInput.referralDoctorName || 'Self / Direct',
      referralDoctorId: invInput.referralDoctorId || invInput.referredById,
      referralDoctorName: invInput.referralDoctorName || invInput.referredByName || 'Self / Direct',
      items: invInput.items || [],
      subtotal: invInput.subtotal || invInput.grossTotal || 0,
      grossTotal: invInput.grossTotal || invInput.subtotal || 0,
      discountType: invInput.discountType || 'percentage',
      discountValue: invInput.discountValue || 0,
      discountAmount: invInput.discountAmount || 0,
      vatRate: invInput.vatRate || 0,
      vatAmount: invInput.vatAmount || 0,
      netTotal: invInput.netTotal || 0,
      paidAmount: invInput.paidAmount || 0,
      dueAmount: invInput.dueAmount || 0,
      paymentMethod: invInput.paymentMethod || 'Cash',
      paymentStatus: invInput.paymentStatus || 'PAID',
      createdBy: invInput.createdBy || currentUser?.username || 'admin',
      referralCommissionAmount: invInput.referralCommissionAmount,
      reportStatus: invInput.reportStatus || 'PENDING_SAMPLE'
    };

    // 1. Append invoice to state
    setInvoices(prev => [inv, ...prev]);

    // 2. Automatically record payment into Cash Book
    if (inv.paidAmount > 0) {
      const tx: AccountingTransaction = {
        id: `tx-${Date.now()}`,
        date: inv.date,
        type: 'INCOME',
        category: 'Diagnostic Billing',
        description: `Diagnostic Billing Counter Collection — ${inv.invoiceNo} (${inv.patientName})`,
        amount: inv.paidAmount,
        paymentMethod: inv.paymentMethod === 'Cash' ? 'Cash' : 'Mobile Banking',
        account: inv.paymentMethod === 'Cash' ? 'Main Cash Counter' : 'bKash Merchant',
        referenceId: inv.invoiceNo,
        voucherNo: inv.invoiceNo
      };
      setTransactions(prev => [tx, ...prev]);
    }

    // 3. Automatically record referral doctor commission
    if (inv.referredById && inv.referredById !== 'self') {
      const doctor = doctors.find(d => d.id === inv.referredById);
      if (doctor) {
        const commAmount =
          doctor.commissionType === 'percentage'
            ? Math.round((inv.netTotal * doctor.commissionValue) / 100)
            : doctor.commissionValue * inv.items.length;

        const commEntry: CommissionEntry = {
          id: `ce-${Date.now()}`,
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          date: inv.date,
          doctorId: doctor.id,
          doctorName: doctor.name,
          billedAmount: inv.netTotal,
          commissionRate: doctor.commissionType === 'percentage' ? `${doctor.commissionValue}%` : `৳${doctor.commissionValue}/test`,
          commissionAmount: commAmount,
          status: 'Accrued'
        };
        setCommissionEntries(prev => [commEntry, ...prev]);

        // Update doctor cumulative records
        setDoctors(prev =>
          prev.map(d =>
            d.id === doctor.id
              ? {
                  ...d,
                  totalReferrals: d.totalReferrals + 1,
                  totalCommissionEarned: d.totalCommissionEarned + commAmount
                }
              : d
          )
        );
      }
    }

    // 4. Automatically queue samples in Phlebotomy Worklist
    const sampleItems = inv.items.filter(i => i.sampleType !== 'None');
    if (sampleItems.length > 0) {
      const newSample: Sample = {
        id: `smp-${Date.now()}`,
        sampleId: `SMP-${new Date().getFullYear()}-${String(samples.length + 1).padStart(4, '0')}`,
        invoiceId: inv.id,
        invoiceNo: inv.invoiceNo,
        patientName: inv.patientName,
        patientPhone: inv.patientPhone,
        patientAge: inv.patientAge,
        patientGender: inv.patientGender,
        testNames: sampleItems.map(i => i.testName),
        sampleType: sampleItems[0].sampleType,
        containerType: sampleItems[0].containerType,
        status: 'Pending Collection',
        barcode: `SMP${inv.invoiceNo.replace(/[^0-9]/g, '')}`
      };
      setSamples(prev => [newSample, ...prev]);
    }

    // 5. Automatically create pending lab report
    const newReport: LabReport = {
      id: `rep-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      patientName: inv.patientName,
      patientPhone: inv.patientPhone,
      patientAge: inv.patientAge,
      patientGender: inv.patientGender,
      testName: inv.items.map(i => i.testName).join(', '),
      category: inv.items[0]?.category || 'General',
      technologistName: 'Farzana Parvin',
      technologistDegree: 'B.Sc in Health Technology (Lab)',
      pathologistName: 'Prof. Dr. M. A. Rahman',
      pathologistDegree: 'MBBS, M.Phil (Pathology)',
      status: 'PENDING_ENTRY',
      results: inv.items.map(i => ({
        parameterName: i.testName,
        resultValue: '',
        unit: 'observed',
        normalRange: 'Normal',
        isAbnormal: false
      }))
    };
    setLabReports(prev => [newReport, ...prev]);

    // 6. Update patient visit & spending balance
    setPatients(prev =>
      prev.map(p =>
        p.id === inv.patientId
          ? {
              ...p,
              totalVisits: p.totalVisits + 1,
              totalSpent: p.totalSpent + inv.netTotal,
              outstandingDue: p.outstandingDue + inv.dueAmount,
              lastVisit: inv.date
            }
          : p
      )
    );

    // 7. Auto-open print preview modal
    openPrintModal(inv, tenantSettings.defaultPrintFormat);
    showToast(`Invoice ${inv.invoiceNo} generated successfully!`);
  };

  const collectDuePayment = (invoiceId: string, amount: number, method: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const newDue = Math.max(0, inv.netTotal - newPaid);
          const status = newDue === 0 ? 'PAID' : 'PARTIAL';

          // Post to cashbook
          const tx: AccountingTransaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'INCOME',
            category: 'Due Settlement',
            description: `Due Collection for Invoice ${inv.invoiceNo} (${inv.patientName})`,
            amount,
            paymentMethod: method as any,
            account: method === 'Cash' ? 'Main Cash Counter' : 'bKash Merchant',
            referenceId: inv.invoiceNo,
            voucherNo: `REC-${Date.now().toString().slice(-4)}`
          };
          setTransactions(t => [tx, ...t]);

          return {
            ...inv,
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus: status
          };
        }
        return inv;
      })
    );
    showToast(`Collected ৳${amount} due payment successfully`);
  };

  const addPatient = (p: Omit<Patient, 'id' | 'patientId' | 'code' | 'totalVisits' | 'totalSpent' | 'outstandingDue' | 'lastVisit' | 'createdAt'> & { code?: string }): Patient => {
    const year = new Date().getFullYear();
    let maxSeq = 0;
    patients.forEach(pat => {
      const codeStr = pat.code || pat.patientId || '';
      const match = codeStr.match(/PAT-\d{4}-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    const nextSeq = Math.max(maxSeq + 1, patients.length + 1);
    const generatedCode = p.code || `PAT-${year}-${String(nextSeq).padStart(4, '0')}`;

    const newPatient: Patient = {
      ...p,
      id: `pat-${Date.now()}`,
      code: generatedCode,
      patientId: generatedCode,
      totalVisits: 1,
      totalSpent: 0,
      outstandingDue: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [newPatient, ...prev]);
    showToast(`Patient ${newPatient.name} registered (${generatedCode})`);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Patient updated');
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    showToast('Patient deleted');
  };

  const updateTestPrice = (id: string, price: number) => {
    setDiagnosticTests(prev => prev.map(t => (t.id === id ? { ...t, price } : t)));
    showToast('Test price updated');
  };

  const updateTestStockCapacity = (id: string, trackStock: boolean, alertThreshold?: number) => {
    setDiagnosticTests(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              trackStock,
              alertThreshold: alertThreshold !== undefined ? alertThreshold : t.alertThreshold
            }
          : t
      )
    );
    showToast('Reagent stock tracking updated');
  };

  const collectSample = (sampleId: string, collectorName: string) => {
    setSamples(prev =>
      prev.map(s =>
        s.id === sampleId
          ? {
              ...s,
              status: 'Collected',
              collectedAt: new Date().toLocaleString(),
              collectedBy: collectorName
            }
          : s
      )
    );
    showToast('Sample marked as Collected');
  };

  const receiveSampleInLab = (sampleId: string) => {
    setSamples(prev =>
      prev.map(s =>
        s.id === sampleId
          ? {
              ...s,
              status: 'Received in Lab',
              receivedAt: new Date().toLocaleString()
            }
          : s
      )
    );
    showToast('Sample received in laboratory');
  };

  const updateLabReportResults = (invoiceId: string, results: any[], remarks?: string) => {
    setLabReports(prev =>
      prev.map(r =>
        r.invoiceId === invoiceId
          ? {
              ...r,
              results,
              interpretationRemarks: remarks || r.interpretationRemarks,
              status: 'COMPLETED'
            }
          : r
      )
    );
    showToast('Lab report findings saved');
  };

  const verifyLabReport = (invoiceId: string, pathologistName: string) => {
    setLabReports(prev =>
      prev.map(r =>
        r.invoiceId === invoiceId
          ? {
              ...r,
              pathologistName,
              status: 'VERIFIED'
            }
          : r
      )
    );
    showToast('Report verified and signed by Consultant Pathologist');
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    showToast(`Appointment status updated to ${status}`);
  };

  const addAppointment = (app: Omit<Appointment, 'id' | 'serialNo'>) => {
    const count = appointments.filter(a => a.doctorId === app.doctorId && a.date === app.date).length;
    const newApp: Appointment = {
      ...app,
      id: `app-${Date.now()}`,
      serialNo: count + 1
    };
    setAppointments(prev => [...prev, newApp]);
    showToast(`Serial #${newApp.serialNo} booked for ${newApp.patientName}`);
    return newApp;
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast('Token / Appointment removed successfully');
  };

  const clearCompletedAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    setAppointments(prev => prev.filter(a => !(a.status === 'Completed' && (a.date === today || !a.date))));
    showToast('Cleared completed appointments for today');
  };

  const resetTodayQueue = () => {
    const today = new Date().toISOString().split('T')[0];
    setAppointments(prev => prev.filter(a => a.date && a.date !== today));
    showToast("Today's queue has been reset");
  };

  const addWeeklySitting = (sitting: Omit<WeeklySitting, 'id'>) => {
    const ws: WeeklySitting = {
      ...sitting,
      id: `ws-${Date.now()}`
    };
    setWeeklySittings(prev => [...prev, ws]);
    showToast('Weekly doctor sitting scheduled');
  };

  const createRequisition = (req: Omit<Requisition, 'id' | 'reqNo' | 'date'>) => {
    const r: Requisition = {
      ...req,
      id: `req-${Date.now()}`,
      reqNo: `REQ-${new Date().getFullYear()}-${String(requisitions.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0]
    };
    setRequisitions(prev => [r, ...prev]);
    showToast(`Requisition ${r.reqNo} created`);
  };

  const updateRequisitionStatus = (id: string, status: Requisition['status']) => {
    setRequisitions(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    showToast(`Requisition status updated to ${status}`);
  };

  const addExpense = (expense: Omit<AccountingTransaction, 'id'>) => {
    const tx: AccountingTransaction = {
      ...expense,
      id: `tx-${Date.now()}`
    };
    setTransactions(prev => [tx, ...prev]);
    showToast(`Recorded expense of ৳${expense.amount}`);
  };

  const addCommissionRule = (rule: Omit<CommissionRule, 'id'>) => {
    const cr: CommissionRule = {
      ...rule,
      id: `cr-${Date.now()}`
    };
    setCommissionRules(prev => [...prev, cr]);
    showToast('Commission rule saved');
  };

  const disburseCommission = (doctorId: string, amount: number) => {
    setDoctors(prev =>
      prev.map(d => (d.id === doctorId ? { ...d, totalCommissionPaid: d.totalCommissionPaid + amount } : d))
    );
    // Add transaction
    const tx: AccountingTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      category: 'Doctor Commission',
      description: `Referral commission payout to doctor (${doctorId})`,
      amount,
      paymentMethod: 'Cash',
      account: 'Main Cash Counter',
      paidTo: doctorId
    };
    setTransactions(prev => [tx, ...prev]);
    showToast(`Disbursed ৳${amount} commission`);
  };

  const createPharmacySale = (sale: PharmacySale) => {
    setPharmacySales(prev => [sale, ...prev]);

    // Deduct stock
    sale.items.forEach(item => {
      setPharmacyProducts(prev =>
        prev.map(p => (p.id === item.productId ? { ...p, stockUnits: Math.max(0, p.stockUnits - item.quantity) } : p))
      );
    });

    // Record cashbook transaction
    if (sale.paid > 0) {
      const tx: AccountingTransaction = {
        id: `tx-${Date.now()}`,
        date: sale.date,
        type: 'INCOME',
        category: 'Pharmacy Sales',
        description: `Pharmacy Counter Sale — ${sale.saleNo} (${sale.customerName})`,
        amount: sale.paid,
        paymentMethod: sale.paymentMethod === 'Cash' ? 'Cash' : 'Mobile Banking',
        account: sale.paymentMethod === 'Cash' ? 'Main Cash Counter' : 'bKash Merchant',
        referenceId: sale.saleNo
      };
      setTransactions(prev => [tx, ...prev]);
    }
    showToast(`Pharmacy sale ${sale.saleNo} completed`);
  };

  const savePrescription = (rx: Omit<PrescriptionRecord, 'id'> & { id?: string }): PrescriptionRecord => {
    const newRx: PrescriptionRecord = {
      ...rx,
      id: rx.id || `rx-${Date.now()}`
    };

    setPrescriptions(prev => [newRx, ...prev]);

    // If prescription has vitals, automatically record them to patient's clinical vitals history
    if (newRx.vitals && (newRx.vitals.bp || newRx.vitals.pulse || newRx.vitals.temp || newRx.vitals.weight || newRx.vitals.spo2)) {
      const vitalEntry: PatientVitalRecord = {
        id: `vit-${Date.now()}`,
        patientId: newRx.patientId,
        date: newRx.date || new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctorName: newRx.doctorName,
        bp: newRx.vitals.bp,
        pulse: newRx.vitals.pulse,
        temp: newRx.vitals.temp,
        weight: newRx.vitals.weight,
        spo2: newRx.vitals.spo2,
        notes: newRx.diagnosis ? `Prescribed for: ${newRx.diagnosis}` : undefined
      };

      setPatients(prev =>
        prev.map(p => {
          if (p.id === newRx.patientId || (p.code && p.code === newRx.patientCode)) {
            const existingVitals = p.vitals || [];
            return {
              ...p,
              vitals: [vitalEntry, ...existingVitals],
              latestVitals: vitalEntry
            };
          }
          return p;
        })
      );
    }

    showToast(`Prescription ${newRx.rxNo} created & patient vitals updated!`);
    return newRx;
  };

  const deletePrescription = (id: string) => {
    setPrescriptions(prev => prev.filter(r => r.id !== id));
    showToast('Prescription removed');
  };

  const [recallRules, setRecallRules] = useState<RecallRule[]>([
    {
      id: 'rc-1',
      testId: 't-1',
      testName: 'HbA1c (Glycated Hemoglobin)',
      intervalDays: 90,
      createdAt: '2026-08-01'
    },
    {
      id: 'rc-2',
      testId: 't-2',
      testName: 'Lipid Profile',
      intervalDays: 180,
      createdAt: '2026-08-01'
    }
  ]);

  const addRecallRule = (rule: Omit<RecallRule, 'id' | 'createdAt'>) => {
    const newRule: RecallRule = {
      id: `rc-${Date.now()}`,
      ...rule,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRecallRules(prev => [...prev, newRule]);
    showToast(`Recall rule added for "${rule.testName}" (${rule.intervalDays} days)`);
  };

  const deleteRecallRule = (id: string) => {
    setRecallRules(prev => prev.filter(r => r.id !== id));
    showToast('Recall rule removed');
  };

  const addCommonRecallRules = () => {
    const common = [
      { testId: 't-1', testName: 'HbA1c (Glycated Hemoglobin)', intervalDays: 90 },
      { testId: 't-2', testName: 'Lipid Profile', intervalDays: 180 },
      { testId: 't-3', testName: 'Thyroid Stimulating Hormone (TSH)', intervalDays: 90 },
      { testId: 't-4', testName: 'Complete Blood Count (CBC) with ESR', intervalDays: 60 },
      { testId: 't-5', testName: 'Serum Creatinine with eGFR', intervalDays: 90 }
    ];
    setRecallRules(prev => {
      const existingNames = new Set(prev.map(r => r.testName));
      const toAdd = common
        .filter(c => !existingNames.has(c.testName))
        .map((c, idx) => ({
          id: `rc-${Date.now()}-${idx}`,
          testId: c.testId,
          testName: c.testName,
          intervalDays: c.intervalDays,
          createdAt: new Date().toISOString().split('T')[0]
        }));
      return [...prev, ...toAdd];
    });
    showToast('Common clinical recall rules added successfully!');
  };

  const addChamber = (c: any) => {
    const newChamber = { ...c, id: c.id || `ch-${Date.now()}` };
    setChambers(prev => [...prev, newChamber]);
    showToast(`Chamber ${c.name || c.roomNo} added`);
  };

  const updateChamber = (id: string, updates: Partial<Chamber>) => {
    setChambers(prev => prev.map(ch => (ch.id === id ? { ...ch, ...updates } : ch)));
    showToast('Chamber updated');
  };

  const deleteChamber = (id: string) => {
    setChambers(prev => prev.filter(ch => ch.id !== id));
    showToast('Chamber deleted');
  };

  const addDoctor = (d: any) => {
    const newDoc = { ...d, id: d.id || `doc-${Date.now()}` };
    setDoctors(prev => [...prev, newDoc]);
    showToast(`Doctor ${d.name} added`);
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors(prev => prev.map(doc => (doc.id === id ? { ...doc, ...updates } : doc)));
    showToast('Doctor profile updated');
  };

  const deleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(doc => doc.id !== id));
    showToast('Doctor removed');
  };

  const clearMockDoctorsAndChambers = () => {
    setDoctors([]);
    setChambers([]);
    try {
      localStorage.setItem('cp_doctors', JSON.stringify([]));
      localStorage.setItem('cp_chambers', JSON.stringify([]));
    } catch {}
    showToast('Cleared all doctors and chambers for clean entry');
  };

  const recordPayment = (p: any) => {
    setPayments(prev => [p, ...prev]);
    showToast(`Payment of ৳${p.amount} recorded`);
  };

  const updateTenantSettings = (updates: Partial<TenantSettings>) => {
    setTenantSettings(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('cp_tenant', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Settings saved successfully');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: userData.status || 'ACTIVE',
      isActive: true,
      active: true,
      joinedDate: userData.joinedDate || new Date().toLocaleDateString('en-US')
    };
    setUsers(prev => [newUser, ...prev]);
    showToast(`User ${newUser.name} created successfully`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    showToast('User profile updated successfully');
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('User removed');
  };

  const addSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'ticketNo' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `t-${Date.now()}`,
      ticketNo: `ISS-${num}`,
      status: 'Open',
      createdAt: dateStr,
      updatedAt: dateStr,
      latestUpdate: 'Ticket received. Assigned to CarePulse Support Queue.'
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    showToast(`Support issue #${newTicket.ticketNo} submitted successfully!`);
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status'], updateNote?: string) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          updatedAt: new Date().toLocaleString(),
          latestUpdate: updateNote || t.latestUpdate
        };
      }
      return t;
    }));
  };

  const updateActiveSubscription = (sub: Partial<ActiveSubscription>) => {
    setActiveSubscription(prev => ({ ...prev, ...sub }));
    showToast('Subscription tier updated successfully');
  };

  const recordSubscriptionPayment = (paymentData: Omit<SubscriptionPayment, 'id' | 'receiptNo' | 'date'>) => {
    const now = new Date();
    const receiptNo = `CP-INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(Math.floor(100 + Math.random() * 900))}`;
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const newPayment: SubscriptionPayment = {
      ...paymentData,
      id: `sp-${Date.now()}`,
      receiptNo,
      date: dateStr,
      status: 'Paid'
    };
    setSubscriptionPayments(prev => [newPayment, ...prev]);
    showToast(`Payment of ${newPayment.amount} BDT recorded! Subscription updated.`);
  };

  // ── STAFF & HRM ACTIONS ──
  const addStaffMember = (staffData: Omit<StaffMember, 'id' | 'createdAt'>) => {
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStaffMembers(prev => [newStaff, ...prev]);
    showToast(`Staff member "${newStaff.name}" added successfully.`);
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    showToast('Staff member updated.');
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
    showToast('Staff member deleted.');
  };

  // ── LEAVE MANAGEMENT ──
  const addLeaveType = (typeData: Omit<LeaveType, 'id'>) => {
    const newType: LeaveType = {
      ...typeData,
      id: `lt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeaveTypes(prev => [...prev, newType]);
    showToast(`Leave type "${newType.name}" added.`);
  };

  const deleteLeaveType = (id: string) => {
    setLeaveTypes(prev => prev.filter(t => t.id !== id));
    showToast('Leave type removed.');
  };

  const submitLeaveRequest = (reqData: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: LeaveRequest = {
      ...reqData,
      id: `lr-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    showToast('Leave request submitted successfully.');
  };

  const reviewLeaveRequest = (id: string, status: 'APPROVED' | 'REJECTED', reviewerName = 'Administrator') => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString()
    } : r));
    showToast(`Leave request ${status.toLowerCase()} successfully.`);
  };

  // ── ATTENDANCE ──
  const markAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.staffId === recordData.staffId && r.date === recordData.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...recordData };
        return updated;
      }
      return [{ ...recordData, id: `att-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev];
    });
    showToast('Attendance recorded.');
  };

  const markBulkAttendance = (records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]) => {
    setAttendanceRecords(prev => {
      let updated = [...prev];
      records.forEach(rec => {
        const idx = updated.findIndex(r => r.staffId === rec.staffId && r.date === rec.date);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...rec };
        } else {
          updated.push({ ...rec, id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, createdAt: new Date().toISOString() });
        }
      });
      return updated;
    });
    showToast(`Attendance updated for ${records.length} staff members.`);
  };

  // ── PAYROLL ──
  const generatePayroll = (month: string) => {
    const newRecords: PayrollRecord[] = staffMembers.filter(s => s.status === 'ACTIVE').map(staff => {
      const existing = payrollRecords.find(p => p.staffId === staff.id && p.month === month);
      if (existing) return existing;

      const staffAtt = attendanceRecords.filter(a => a.staffId === staff.id && a.date.startsWith(month));
      const presentCount = staffAtt.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const leaveCount = staffAtt.filter(a => a.status === 'LEAVE').length;
      const absentCount = staffAtt.filter(a => a.status === 'ABSENT').length;

      const advances = salaryAdvances.filter(a => a.staffId === staff.id && a.deductMonth === month && !a.isDeducted);
      const advanceDeduct = advances.reduce((sum, a) => sum + a.amount, 0);

      const workingDays = 30;
      const effectiveDays = presentCount > 0 ? presentCount + leaveCount : 30;
      const basePay = Math.round((staff.salary / workingDays) * effectiveDays);
      const bonus = 1000;
      const overtime = 0;
      const gross = basePay + bonus + overtime;
      const deductions = advanceDeduct;
      const net = Math.max(0, gross - deductions);

      return {
        id: `pay-${staff.id}-${month}`,
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        department: staff.department,
        month,
        basicSalary: staff.salary,
        presentDays: effectiveDays,
        absentDays: absentCount,
        leaveDays: leaveCount,
        overtimeAmount: overtime,
        advanceDeduct,
        bonus,
        grossSalary: gross,
        deductions,
        netSalary: net,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      };
    });

    setPayrollRecords(prev => {
      const remaining = prev.filter(p => p.month !== month);
      return [...newRecords, ...remaining];
    });
    showToast(`Payroll generated for ${month}.`);
  };

  const markPayrollPaid = (id: string, paymentMethod = 'Cash', paidBy = 'Administrator') => {
    setPayrollRecords(prev => prev.map(p => p.id === id ? {
      ...p,
      status: 'PAID',
      paymentMethod,
      paidAt: new Date().toISOString(),
      paidBy
    } : p));
    showToast('Salary payment recorded.');
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    setPayrollRecords(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Payroll record updated.');
  };

  const giveSalaryAdvance = (advData: Omit<SalaryAdvance, 'id' | 'createdAt' | 'isDeducted'>) => {
    const newAdv: SalaryAdvance = {
      ...advData,
      id: `adv-${Date.now()}`,
      isDeducted: false,
      createdAt: new Date().toISOString(),
    };
    setSalaryAdvances(prev => [newAdv, ...prev]);
    showToast(`Salary advance of ৳${newAdv.amount} recorded for ${newAdv.staffName || 'staff'}.`);
  };

  // ── WEBSITE CMS & ONLINE BOOKINGS ──
  const updateTenantWebsite = (updates: Partial<TenantWebsite>) => {
    setTenantWebsite(prev => ({ ...prev, ...updates }));
    showToast('Website settings updated successfully.');
  };

  const addBookingRequest = (reqData: Omit<PublicBookingRequest, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: PublicBookingRequest = {
      ...reqData,
      id: `pbr-${Date.now()}`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    setBookingRequests(prev => [newBooking, ...prev]);
    showToast('Booking request received!');
  };

  const confirmBookingRequest = (id: string, confirmedBy = 'Reception') => {
    setBookingRequests(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'CONFIRMED',
      confirmedBy,
      confirmedAt: new Date().toISOString()
    } : b));
    showToast('Booking request confirmed.');
  };

  const cancelBookingRequest = (id: string) => {
    setBookingRequests(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    showToast('Booking request cancelled.');
  };

  // ── REPORT SHARE LINKS ──
  const generateReportShareLink = (
    invoiceIdOrId: string,
    invoiceNoOrProtected?: string | boolean,
    patientName?: string,
    patientPhone?: string
  ): ReportShareLink => {
    let invId = invoiceIdOrId;
    let invNo = typeof invoiceNoOrProtected === 'string' ? invoiceNoOrProtected : '';
    let pName = patientName || '';
    let pPhone = patientPhone || '';
    const isProtected = typeof invoiceNoOrProtected === 'boolean' ? invoiceNoOrProtected : false;

    // Auto-detect from invoice if missing
    const matchedInv = invoices.find(i => i.id === invId || i.invoiceNo === invId) ||
      invoices.find(i => labReports.some(r => (r.id === invId || r.invoiceId === i.id) && r.invoiceId === i.id));
    if (matchedInv) {
      invId = matchedInv.id;
      invNo = matchedInv.invoiceNo;
      if (!pName) pName = matchedInv.patientName;
      if (!pPhone) pPhone = matchedInv.patientPhone;
    }

    const existing = reportShareLinks.find(l => l.invoiceId === invId || (invNo && l.invoiceNo === invNo));
    if (existing) {
      return {
        ...existing,
        token: existing.shareToken,
        reportId: invId,
        isPasswordProtected: isProtected || existing.isPasswordProtected,
      };
    }

    const token = `rep_${(pName || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${Math.random().toString(36).substr(2, 6)}`;
    const newLink: ReportShareLink = {
      id: `rsl-${Date.now()}`,
      invoiceId: invId,
      invoiceNo: invNo || `INV-${Date.now().toString().slice(-4)}`,
      reportId: invId,
      patientName: pName || 'Valued Patient',
      patientPhone: pPhone || '01700000000',
      shareToken: token,
      token,
      isPasswordProtected: isProtected,
      viewCount: 0,
      createdAt: new Date().toISOString()
    };
    setReportShareLinks(prev => [newLink, ...prev]);
    return newLink;
  };

  const getReportShareLink = (token: string): ReportShareLink | undefined => {
    return reportShareLinks.find(l => l.shareToken === token || l.token === token || l.id === token);
  };

  // ── SMS NOTIFICATIONS ──
  const updateSmsConfig = (updates: Partial<SmsConfig>) => {
    setSmsConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('cp_sms_config', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('SMS Gateway settings updated.');
  };

  const sendSmsNotification = (phone: string, message: string, type: SmsLog['type'] = 'GENERAL'): boolean => {
    if (tenantSettings.enableSmsNotifications === false || smsConfig.enabled === false) {
      showToast('SMS notifications are disabled for this center.');
      return false;
    }
    if (smsConfig.balance < 0.50) {
      showToast('SMS balance low! Please recharge.');
      return false;
    }
    const newLog: SmsLog = {
      id: `sms-${Date.now()}`,
      phone,
      message,
      type,
      status: 'DELIVERED',
      provider: smsConfig.provider === 'ssl_wireless' ? 'SSL Wireless' : smsConfig.provider,
      cost: 0.50,
      createdAt: new Date().toISOString(),
    };
    setSmsLogs(prev => [newLog, ...prev]);
    setSmsConfig(prev => ({ ...prev, balance: Math.max(0, Number((prev.balance - 0.50).toFixed(2))) }));
    showToast(`SMS sent to ${phone}`);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentView,
        isSidebarCollapsed,
        activePrintInvoice,
        activePrintFormat,
        activePrintColor,
        showPrintModal,
        toastMessage,
        users,
        patients,
        diagnosticTests,
        tests: diagnosticTests,
        invoices,
        samples,
        labReports,
        doctors,
        chambers,
        appointments,
        weeklySittings,
        requisitions,
        commissionRules,
        commissionEntries,
        inventoryItems,
        pharmacyProducts,
        pharmacySales,
        suppliers,
        sendOutVendors,
        payments,
        transactions,
        tenantSettings,
        login,
        logout,
        setCurrentView,
        toggleSidebar,
        showToast,
        createInvoice,
        collectDuePayment,
        openPrintModal,
        closePrintModal,
        setActivePrintFormat,
        setActivePrintColor,
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addChamber,
        updateChamber,
        deleteChamber,
        clearMockDoctorsAndChambers,
        recordPayment,
        updateTestPrice,
        updateTestStockCapacity,
        collectSample,
        receiveSampleInLab,
        updateLabReportResults,
        verifyLabReport,
        updateAppointmentStatus,
        addAppointment,
        deleteAppointment,
        clearCompletedAppointments,
        resetTodayQueue,
        addWeeklySitting,
        createRequisition,
        updateRequisitionStatus,
        addExpense,
        addCommissionRule,
        disburseCommission,
        createPharmacySale,
        prescriptions,
        savePrescription,
        deletePrescription,
        recallRules,
        addRecallRule,
        deleteRecallRule,
        addCommonRecallRules,
        updateTenantSettings,
        addUser,
        updateUser,
        deleteUser,
        supportTickets,
        addSupportTicket,
        updateTicketStatus,
        activeSubscription,
        updateActiveSubscription,
        subscriptionPayments,
        recordSubscriptionPayment,
        // Staff & HRM
        staffMembers,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        // Leave
        leaveTypes,
        addLeaveType,
        deleteLeaveType,
        leaveRequests,
        submitLeaveRequest,
        reviewLeaveRequest,
        // Attendance
        attendanceRecords,
        markAttendance,
        markBulkAttendance,
        // Payroll
        payrollRecords,
        generatePayroll,
        markPayrollPaid,
        updatePayrollRecord,
        salaryAdvances,
        giveSalaryAdvance,
        // Website CMS
        tenantWebsite,
        updateTenantWebsite,
        // Bookings
        bookingRequests,
        addBookingRequest,
        confirmBookingRequest,
        cancelBookingRequest,
        // Report Share
        reportShareLinks,
        generateReportShareLink,
        getReportShareLink,
        // SMS
        smsConfig,
        updateSmsConfig,
        smsLogs,
        sendSmsNotification
      }}
    >
      {children}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
