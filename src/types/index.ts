// Core TypeScript types for CarePulse Diagnostic Operations Platform

export type ActiveView =
  | 'login'
  | 'dashboard'
  | 'patients'
  | 'recall'
  | 'prescriptions'
  | 'new-prescription'
  | 'chambers'
  | 'appointments'
  | 'appointments-queue'
  | 'appointments-schedule'
  | 'appointments-report'
  | 'investigations'
  | 'investigations-groups'
  | 'investigations-capacity'
  | 'doctors'
  | 'samples'
  | 'home-collection'
  | 'sendout-vendors'
  | 'inventory'
  | 'inventory-requisitions'
  | 'drugs'
  | 'report-templates'
  | 'lab-reports'
  | 'pharmacy-overview'
  | 'pharmacy-pos'
  | 'pharmacy-sales'
  | 'pharmacy-products'
  | 'pharmacy-purchases'
  | 'pharmacy-suppliers'
  | 'pharmacy-reports'
  | 'invoices'
  | 'new-invoice'
  | 'payments'
  | 'commissions'
  | 'commissions-rules'
  | 'commissions-entries'
  | 'commissions-report'
  | 'accounting'
  | 'accounting-expenses'
  | 'accounting-pnl'
  | 'users'
  | 'roles'
  | 'subscription'
  | 'practice'
  | 'action-inbox'
  | 'tutorials'
  | 'support'
  | 'settings'
  | 'reception'
  | 'staff'
  | 'staff-attendance'
  | 'staff-payroll'
  | 'staff-hrm'
  | 'website-cms'
  | 'online-bookings'
  | 'branding-studio'
  | 'sms-notifications'
  | (string & {});

export type LiveUserRole =
  | 'Doctor'
  | 'Global Account Manager'
  | 'Global Auditor'
  | 'Global Corporate Coordinator'
  | 'Global Doctor'
  | 'Global Field Agent'
  | 'Global Lab Technologist'
  | 'Global Pharmacy Counter'
  | 'Global Pharmacy Manager'
  | 'Global Reception'
  | 'Global Storekeeper'
  | 'Global Tenant Admin';

export type UserRole =
  | LiveUserRole
  | 'Global Tenant Admin'
  | 'Center Manager'
  | 'Receptionist / Billing Clerk'
  | 'Medical Technologist / Pathologist'
  | 'Doctor / Consultant'
  | 'Pharmacist / Counter Sales'
  | 'Phlebotomist / Collector'
  | 'Accountant';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  roles?: string[];
  isActive?: boolean;
  active?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  joinedDate?: string;
  signatureUrl?: string;
  avatarUrl?: string;
}

export interface Patient {
  id: string;
  patientId?: string;
  code?: string;
  name: string;
  phone: string;
  whatsApp?: string;
  age: number;
  ageUnit?: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address: string;
  totalVisits?: number;
  visitCount?: number;
  totalSpent?: number;
  totalBilled?: number;
  outstandingDue: number;
  lastVisit?: string;
  createdAt: string;
}

export interface PrescriptionRecord {
  id: string;
  rxNo: string;
  date: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  age: number;
  gender: string;
  doctorId: string;
  doctorName: string;
  chamber: string;
  chiefComplaint?: string;
  diagnosis?: string;
  followUp?: string;
  drugsCount: number;
  drugs?: any[];
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
    spo2?: string;
  };
  advice?: string[];
  createdAt: string;
}

export interface DiagnosticTest {
  id: string;
  code: string;
  name: string;
  bengaliName?: string;
  category: string;
  department?: string;
  sampleType: string;
  containerType?: string;
  unit?: string;
  price: number;
  costPrice?: number;
  deliveryDays?: number;
  turnaroundHours?: number;
  isDiscountable?: boolean;
  normalRange?: string;
  isSendOut?: boolean;
  vendorType?: string;
  vendorId?: string;
  vendorName?: string;
  trackStock?: boolean;
  stockUnits?: number;
  alertThreshold?: number;
  parameters?: TestParameter[];
}

export interface TestGroup {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  tests?: string[];
  testIds?: string[];
}

export interface SendOutVendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  activeTestsCount: number;
  balanceDue: number;
}

export interface TestParameter {
  name: string;
  unit: string;
  normalRangeMale: string;
  normalRangeFemale: string;
  normalRangeChild?: string;
  defaultValue?: string;
}

export interface InvoiceItem {
  id?: string;
  testId: string;
  testCode?: string;
  testName: string;
  category: string;
  sampleType?: string;
  containerType?: string;
  price: number;
  finalPrice?: number;
  discount?: number;
  discountType?: string;
  discountValue?: number;
  sampleStatus?: string;
  deliveryDate?: string;
  isSendOut?: boolean;
  vendorType?: string;
  vendorName?: string;
}

export type PaymentMethod = 'Cash' | 'Mobile Banking (bKash)' | 'Mobile Banking (Nagad)' | 'Card' | 'Due' | 'Mobile Banking';

export interface Invoice {
  id: string;
  invoiceNo: string;
  type?: string;
  date: string;
  time: string;
  patientId: string;
  patientCode?: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientAddress?: string;
  referredById?: string;
  referredByName?: string;
  referralDoctorId?: string;
  referralDoctorName?: string;
  doctorName?: string;
  items: InvoiceItem[];
  subtotal?: number;
  grossTotal?: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  vatRate?: number;
  vatAmount?: number;
  netTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE' | 'UNPAID' | 'CANCELLED';
  createdBy: string;
  referralCommissionAmount?: number;
  referralCommissionPaid?: boolean;
  reportStatus?: 'PENDING_SAMPLE' | 'SAMPLE_COLLECTED' | 'IN_LAB' | 'RESULT_ENTERED' | 'VERIFIED' | 'DELIVERED';
}

export interface Sample {
  id: string;
  sampleId: string;
  invoiceId: string;
  invoiceNo: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  testNames: string[];
  sampleType: string;
  containerType: string;
  status: 'Pending Collection' | 'Collected' | 'Received in Lab';
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  barcode: string;
}

export interface LabResultEntry {
  parameterName: string;
  resultValue: string;
  unit: string;
  normalRange: string;
  isAbnormal: boolean;
}

export interface LabReport {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  testName: string;
  category: string;
  sampleCollectionTime?: string;
  reportingTime?: string;
  results: LabResultEntry[];
  interpretationRemarks?: string;
  technologistName: string;
  technologistDegree: string;
  pathologistName: string;
  pathologistDegree: string;
  status: 'PENDING_ENTRY' | 'COMPLETED' | 'VERIFIED';
}

export interface Doctor {
  id: string;
  name: string;
  degree?: string;
  degrees?: string;
  designation: string;
  specialty: string;
  institute?: string;
  hospital?: string;
  phone: string;
  email?: string;
  bmdcRegNo?: string;
  bmdcReg?: string;
  hasLogin?: boolean;
  loginUsername?: string;
  isConsultant?: boolean;
  isReferralAgent?: boolean;
  chamberRoom?: string;
  chamberNo?: string;
  visitingDays?: string;
  visitingTime?: string;
  consultationFee?: number;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  totalReferrals: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  active?: boolean;
}

export interface Chamber {
  id: string;
  roomNo: string;
  name: string;
  floor?: string;
  department?: string;
  doctorId?: string;
  doctorName?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  visitingHours?: string;
  visitingDays?: string | string[];
  startTime?: string;
  endTime?: string;
  maxPatients?: number;
  consultationFee?: number;
  followUpFee?: number;
  phone?: string;
  status?: 'Available' | 'Occupied' | 'Maintenance' | string;
}

export interface PrescriptionDrug {
  id: string;
  type?: string;
  form?: string;
  brandName: string;
  genericName?: string;
  strength?: string;
  dosage?: string;
  dose?: string;
  duration: string;
  instruction?: string;
  instructions?: string;
}

export interface Appointment {
  id: string;
  serialNo: number;
  type?: string;
  doctorId: string;
  doctorName: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  chamberId?: string;
  chamberName?: string;
  date: string;
  timeSlot: string;
  chamberRoom?: string;
  chamberNo?: string;
  fee: number;
  paymentStatus: 'Paid' | 'Unpaid';
  status: 'Booked' | 'Waiting' | 'With Doctor' | 'Completed' | 'Cancelled';
  createdAt?: string;
}

export interface WeeklySitting {
  id: string;
  doctorId: string;
  doctorName: string;
  dayOfWeek: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  maxSerials: number;
  fee: number;
}

export interface CommissionEntry {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  date: string;
  doctorId: string;
  doctorName: string;
  billedAmount: number;
  commissionRate: string;
  commissionAmount: number;
  status: 'Accrued' | 'Disbursed';
}

export interface CommissionRule {
  id: string;
  agentId: string;
  agentName: string;
  scope: 'General' | 'Specific Test' | 'Category';
  testName?: string;
  category?: string;
  calculationType: 'Percentage' | 'Fixed Amount';
  value: number;
  tierJson?: string;
  status: 'Active' | 'Inactive';
}

export interface Requisition {
  id: string;
  reqNo: string;
  department: string;
  requestedBy: string;
  date: string;
  items: { itemId: string; itemName: string; qty: number; note?: string }[];
  status: 'draft' | 'submitted' | 'approved' | 'partially issued' | 'issued' | 'rejected';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stockQty: number;
  reorderLevel: number;
  costPrice: number;
  location: string;
  supplier: string;
  batchNo?: string;
  expiryDate?: string;
  lastRestocked?: string;
}

export interface AccountingTransaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Mobile Banking' | 'Bank Transfer';
  account: 'Main Cash Counter' | 'bKash Merchant' | 'Bank Account';
  referenceId?: string;
  referenceNo?: string;
  recordedBy?: string;
  voucherNo?: string;
  paidTo?: string;
}

export interface PharmacyProduct {
  id: string;
  code?: string;
  brandName: string;
  genericName: string;
  form: string;
  strength: string;
  company: string;
  batchNo: string;
  expiryDate: string;
  packSize: number | string;
  stockPacks: number;
  stockUnits: number;
  unitsPerPack?: number;
  reorderLevel: number;
  buyPrice?: number;
  costPrice?: number;
  mrp: number;
  prescriptionRequired?: boolean;
}

export interface PharmacySale {
  id: string;
  saleNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;
    brandName: string;
    unit: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod: 'Cash' | 'Mobile Banking' | 'Card';
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  outstandingBalance: number;
  paymentTermsDays: number;
}

export interface TenantSettings {
  name: string;
  bengaliName: string;
  slug?: string;
  established?: string;
  establishedYear?: string;
  website?: string;
  address: string;
  thana: string;
  district: string;
  division?: string;
  postCode?: string;
  phone: string;
  phone2?: string;
  hotline?: string;
  email: string;
  logoUrl?: string;
  tradeLicenseNo?: string;
  binNo?: string;
  tinNo?: string;
  drugLicenseNo?: string;
  enableHomeCollection?: boolean;
  invoicePrefix: string;
  samplePrefix: string;
  reportPrefix?: string;
  patientPrefix: string;
  currency: string;
  defaultVatPercent?: number;
  defaultPrintFormat: 'thermal' | 'a4' | 'a5';
  thermalWidth: '80mm' | '58mm';
  showQrOnReport?: boolean;
  vatRate?: number;
  smsCreditBalance: number;
  enableSmsNotifications?: boolean;
  enableWhatsAppNotifications?: boolean;
  reportDisclaimer?: string;
  pharmacyExpiryWarningDays?: number;
  rxShowPharmacyStock?: boolean;
  departmentSignatures?: {
    department: string;
    technicianName: string;
    technicianQualification: string;
    technicianShow: boolean;
    doctorName: string;
    doctorQualification: string;
    doctorShow: boolean;
  }[];
}

export interface RecallRule {
  id: string;
  testId: string;
  testName: string;
  intervalDays: number;
  createdAt: string;
}

export interface RecallPatient {
  id: string;
  patientName: string;
  phone: string;
  testName: string;
  lastDoneDate: string;
  overdueDays: number;
  lastRemindedDate?: string;
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  type: 'Bug' | 'Improvement' | 'Feedback' | 'Issue';
  title: string;
  details: string;
  attachments?: string[];
  status: 'Open' | 'Under Review' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  latestUpdate?: string;
  submittedBy: string;
  replies?: {
    id: string;
    author: string;
    isStaff: boolean;
    message: string;
    createdAt: string;
  }[];
}

export interface SubscriptionPayment {
  id: string;
  receiptNo: string;
  date: string;
  planName: string;
  billingCycle: 'Monthly' | 'Annual';
  amount: number;
  currency: string;
  method: string;
  accountInfo?: string;
  status: 'Paid' | 'Completed' | 'Pending';
  invoiceUrl?: string;
}

export interface ActiveSubscription {
  planName: string;
  planSubtitle: string;
  status: 'Active' | 'Expiring' | 'Expired';
  modules: string[];
  price: number;
  billingPeriodText: string;
  discountNote?: string;
  startDate: string;
  expiryDate: string;
  daysRemaining: number;
}

// ── STAFF / HRM ──────────────────────────────────────
export interface StaffMember {
  id: string;
  tenantId?: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  department?: string;
  joinDate?: string;
  salary: number;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  nid?: string;
  address?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface LeaveType {
  id: string;
  tenantId?: string;
  name: string;
  daysPerYear: number;
  isPaid: boolean;
  createdAt?: string;
}

export interface LeaveRequest {
  id: string;
  tenantId?: string;
  staffId: string;
  staffName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// ── ATTENDANCE ──────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  tenantId?: string;
  staffId: string;
  staffName?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY';
  checkIn?: string;
  checkOut?: string;
  note?: string;
  markedBy?: string;
  createdAt?: string;
}

export interface AttendanceSummary {
  staffId: string;
  staffName: string;
  month: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  totalWorkingDays: number;
}

// ── PAYROLL ──────────────────────────────────────────
export interface PayrollRecord {
  id: string;
  tenantId?: string;
  staffId: string;
  staffName?: string;
  role?: string;
  department?: string;
  month: string;         // e.g. "2026-09"
  basicSalary: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeAmount: number;
  advanceDeduct: number;
  bonus: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'DRAFT' | 'PAID';
  paymentMethod?: string;
  paidAt?: string;
  paidBy?: string;
  note?: string;
  createdAt?: string;
}

export interface SalaryAdvance {
  id: string;
  tenantId?: string;
  staffId: string;
  staffName?: string;
  amount: number;
  givenDate: string;
  deductMonth?: string;
  note?: string;
  isDeducted: boolean;
  createdAt?: string;
}

// ── WEBSITE CMS ──────────────────────────────────────
export interface TenantWebsite {
  id?: string;
  tenantId?: string;
  isPublished: boolean;
  acceptBookings: boolean;
  theme: string;
  primaryColor: string;
  accentColor: string;
  primaryLanguage: 'en' | 'bn';
  logoUrl?: string;
  heroImageUrl?: string;
  tagline?: string;
  aboutText?: string;
  metaTitle?: string;
  metaDescription?: string;
  facebookUrl?: string;
  googleBusinessUrl?: string;
  customDomain?: string;
  announcement?: string;
  announcementType?: 'info' | 'warning' | 'success';
  showTestPrices?: boolean;
  showConsultationFees?: boolean;
  requirePhoneOtp?: boolean;
}

// ── PUBLIC BOOKING ────────────────────────────────────
export interface PublicBookingRequest {
  id: string;
  tenantId?: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  bookingType: 'appointment' | 'test';
  doctorId?: string;
  doctorName?: string;
  requestedTests?: string[];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  status: 'NEW' | 'CONFIRMED' | 'CANCELLED';
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
}

// ── REPORT SHARE ──────────────────────────────────────
export interface ReportShareLink {
  id: string;
  tenantId?: string;
  invoiceId?: string;
  invoiceNo?: string;
  reportId?: string;
  patientName: string;
  patientPhone: string;
  shareToken: string;
  token?: string;
  isPasswordProtected?: boolean;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
}

// ── SMS NOTIFICATIONS ─────────────────────────────────
export interface SmsConfig {
  enabled?: boolean;
  provider: 'ssl_wireless' | 'greenweb' | 'twilio' | 'mock';
  apiKey: string;
  senderId: string;
  balance: number;
  notifyOnReportReady: boolean;
  notifyOnAppointment: boolean;
  notifyOnDuePayment: boolean;
  notifyOnBookingConfirm: boolean;
  templateReportReady: string;
  templateAppointment: string;
  templateDuePayment: string;
}

export interface SmsLog {
  id: string;
  tenantId?: string;
  phone: string;
  message: string;
  type?: 'REPORT_READY' | 'APPOINTMENT_REMINDER' | 'PAYMENT_DUE' | 'BOOKING_CONFIRM' | 'GENERAL';
  status: 'SENT' | 'FAILED' | 'DELIVERED';
  provider?: string;
  cost?: number;
  createdAt: string;
}

