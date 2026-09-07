import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveView,
  User,
  Patient,
  DiagnosticTest,
  Invoice,
  Sample,
  Doctor,
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
  ActiveSubscription
} from '../types';
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
  initialSubscriptionPayments
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
  setCurrentView: (view: ActiveView) => void;
  toggleSidebar: () => void;
  showToast: (msg: string) => void;
  addChamber: (chamber: any) => void;
  addDoctor: (doctor: any) => void;
  recordPayment: (payment: any) => void;

  // Business Operations
  createInvoice: (inv: any) => void;
  collectDuePayment: (invoiceId: string, amount: number, method: string) => void;
  openPrintModal: (invoice: Invoice, format?: 'thermal' | 'a4' | 'a5') => void;
  closePrintModal: () => void;
  setActivePrintFormat: (format: 'thermal' | 'a4' | 'a5') => void;
  setActivePrintColor: (color: 'Color' | 'B&W') => void;

  // Clinical & Lab Operations
  addPatient: (patient: Omit<Patient, 'id' | 'patientId' | 'totalVisits' | 'totalSpent' | 'outstandingDue' | 'lastVisit' | 'createdAt'>) => Patient;
  updateTestPrice: (id: string, price: number) => void;
  updateTestStockCapacity: (id: string, trackStock: boolean, alertThreshold?: number) => void;
  collectSample: (sampleId: string, collectorName: string) => void;
  receiveSampleInLab: (sampleId: string) => void;
  updateLabReportResults: (invoiceId: string, results: any[], remarks?: string) => void;
  verifyLabReport: (invoiceId: string, pathologistName: string) => void;

  // Appointments
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addAppointment: (app: Omit<Appointment, 'id' | 'serialNo'>) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
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
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>(initialTests);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [chambers, setChambers] = useState<any[]>(initialChambers);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
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
      receivedBy: 'lifecare_admin'
    }
  ]);
  const [transactions, setTransactions] = useState<AccountingTransaction[]>(initialTransactions);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>(initialSettings);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription>(initialActiveSubscription);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>(initialSubscriptionPayments);

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

  const login = (username: string, password?: string) => {
    const user = users.find(u => u.username === username);
    if (user || username === 'lifecare_admin') {
      setCurrentUser(user || users[0]);
      setCurrentView('dashboard');
      showToast(`Successfully signed in to ${tenantSettings.name || 'LifeCare Diagnostic Center'}`);
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
      createdBy: invInput.createdBy || currentUser?.username || 'lifecare_admin',
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

  const addPatient = (p: Omit<Patient, 'id' | 'patientId' | 'totalVisits' | 'totalSpent' | 'outstandingDue' | 'lastVisit' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...p,
      id: `pat-${Date.now()}`,
      patientId: `PAT-${new Date().getFullYear()}-${String(patients.length + 1).padStart(4, '0')}`,
      totalVisits: 1,
      totalSpent: 0,
      outstandingDue: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [newPatient, ...prev]);
    showToast(`Patient ${newPatient.name} registered`);
    return newPatient;
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
    setChambers(prev => [...prev, { ...c, id: `ch-${Date.now()}` }]);
    showToast(`Chamber ${c.name || c.roomNo} added`);
  };

  const addDoctor = (d: any) => {
    setDoctors(prev => [...prev, { ...d, id: `doc-${Date.now()}` }]);
    showToast(`Doctor ${d.name} added`);
  };

  const recordPayment = (p: any) => {
    setPayments(prev => [p, ...prev]);
    showToast(`Payment of ৳${p.amount} recorded`);
  };

  const updateTenantSettings = (updates: Partial<TenantSettings>) => {
    setTenantSettings(prev => ({ ...prev, ...updates }));
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
        addDoctor,
        addChamber,
        recordPayment,
        updateTestPrice,
        updateTestStockCapacity,
        collectSample,
        receiveSampleInLab,
        updateLabReportResults,
        verifyLabReport,
        updateAppointmentStatus,
        addAppointment,
        addWeeklySitting,
        createRequisition,
        updateRequisitionStatus,
        addExpense,
        addCommissionRule,
        disburseCommission,
        createPharmacySale,
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
        recordSubscriptionPayment
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
