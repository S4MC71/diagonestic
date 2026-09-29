import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ── In-Memory / Extensible Storage for Staff & HR ──
// Seed initial staff data per tenant
interface StaffMemberStore {
  id: string;
  tenantId: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  designation: string;
  joinDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
  monthlySalary: number;
  nid?: string;
  address?: string;
  emergencyContact?: string;
  bankAccountNo?: string;
  bankName?: string;
}

interface AttendanceStore {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  date: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

interface LeaveRequestStore {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewDate?: string;
}

interface PayrollRecordStore {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  department?: string;
  month: string;
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
}

interface SalaryAdvanceStore {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  amount: number;
  givenDate: string;
  deductMonth?: string;
  note?: string;
  isDeducted: boolean;
}

// Memory caches
const staffCache: Map<string, StaffMemberStore[]> = new Map();
const attendanceCache: Map<string, AttendanceStore[]> = new Map();
const leaveCache: Map<string, LeaveRequestStore[]> = new Map();
const payrollCache: Map<string, PayrollRecordStore[]> = new Map();
const advanceCache: Map<string, SalaryAdvanceStore[]> = new Map();

// Helper to get or seed staff
function getTenantStaff(tenantId: string): StaffMemberStore[] {
  if (!staffCache.has(tenantId)) {
    staffCache.set(tenantId, [
      {
        id: 'st-1',
        tenantId,
        employeeId: 'EMP-001',
        name: 'Farzana Parvin',
        role: 'LAB_TECHNICIAN',
        department: 'Pathology',
        phone: '01711-223344',
        email: 'farzana@carepulse.bd',
        designation: 'Senior Medical Technologist (Lab)',
        joinDate: '2023-01-15',
        status: 'ACTIVE',
        monthlySalary: 28000,
        bankAccountNo: '1501203456789001',
        bankName: 'Dutch-Bangla Bank PLC',
      },
      {
        id: 'st-2',
        tenantId,
        employeeId: 'EMP-002',
        name: 'Kamal Hossain',
        role: 'RECEPTIONIST',
        department: 'Front Desk',
        phone: '01819-334455',
        email: 'kamal@carepulse.bd',
        designation: 'Front Office Executive',
        joinDate: '2023-06-01',
        status: 'ACTIVE',
        monthlySalary: 18000,
        bankAccountNo: '2050123456789002',
        bankName: 'Islami Bank Bangladesh',
      },
      {
        id: 'st-3',
        tenantId,
        employeeId: 'EMP-003',
        name: 'Nazmul Islam',
        role: 'PHLEBOTOMIST',
        department: 'Sample Collection',
        phone: '01912-778899',
        email: 'nazmul@carepulse.bd',
        designation: 'Phlebotomist / Collector',
        joinDate: '2023-09-10',
        status: 'ACTIVE',
        monthlySalary: 16000,
      },
      {
        id: 'st-4',
        tenantId,
        employeeId: 'EMP-004',
        name: 'Tania Akter',
        role: 'ACCOUNTANT',
        department: 'Finance',
        phone: '01678-445566',
        email: 'tania@carepulse.bd',
        designation: 'Accounts Executive',
        joinDate: '2022-11-01',
        status: 'ACTIVE',
        monthlySalary: 25000,
      }
    ]);
  }
  return staffCache.get(tenantId)!;
}

// ─── STAFF DIRECTORY ──────────────────────────────────────────
// GET /api/tenant/staff
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const staff = getTenantStaff(tenantId);
    res.json({ success: true, data: staff });
  })
);

// POST /api/tenant/staff
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const body = req.body;
    const staff = getTenantStaff(tenantId);

    const newStaff: StaffMemberStore = {
      id: `st-${Date.now()}`,
      tenantId,
      employeeId: body.employeeId || `EMP-${String(staff.length + 1).padStart(3, '0')}`,
      name: body.name,
      role: body.role || 'STAFF',
      department: body.department || 'General',
      phone: body.phone,
      email: body.email || '',
      designation: body.designation || 'Staff',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      status: body.status || 'ACTIVE',
      monthlySalary: Number(body.monthlySalary) || 0,
      nid: body.nid,
      address: body.address,
      emergencyContact: body.emergencyContact,
      bankAccountNo: body.bankAccountNo,
      bankName: body.bankName,
    };

    staff.unshift(newStaff);
    res.status(201).json({ success: true, data: newStaff });
  })
);

// PUT /api/tenant/staff/:id
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { id } = req.params;
    const staff = getTenantStaff(tenantId);
    const index = staff.findIndex(s => s.id === id);

    if (index === -1) {
      throw createError('Staff member not found', 404);
    }

    staff[index] = { ...staff[index], ...req.body, id, tenantId };
    res.json({ success: true, data: staff[index] });
  })
);

// DELETE /api/tenant/staff/:id
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { id } = req.params;
    const staff = getTenantStaff(tenantId);
    const filtered = staff.filter(s => s.id !== id);
    staffCache.set(tenantId, filtered);
    res.json({ success: true, message: 'Staff member removed' });
  })
);

// ─── ATTENDANCE ───────────────────────────────────────────────
// GET /api/tenant/staff/attendance/records
router.get(
  '/attendance/records',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const records = attendanceCache.get(tenantId) || [];
    res.json({ success: true, data: records });
  })
);

// POST /api/tenant/staff/attendance/mark
router.post(
  '/attendance/mark',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;
    const staff = getTenantStaff(tenantId).find(s => s.id === staffId);
    const records = attendanceCache.get(tenantId) || [];

    const existingIndex = records.findIndex(r => r.staffId === staffId && r.date === date);
    const record: AttendanceStore = {
      id: existingIndex >= 0 ? records[existingIndex].id : `att-${Date.now()}`,
      tenantId,
      staffId,
      staffName: staff?.name || 'Staff Member',
      date,
      status,
      checkIn,
      checkOut,
      notes,
    };

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }
    attendanceCache.set(tenantId, records);

    res.json({ success: true, data: record });
  })
);

// ─── LEAVE MANAGEMENT ─────────────────────────────────────────
// GET /api/tenant/staff/leave/requests
router.get(
  '/leave/requests',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const requests = leaveCache.get(tenantId) || [];
    res.json({ success: true, data: requests });
  })
);

// POST /api/tenant/staff/leave/requests
router.post(
  '/leave/requests',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { staffId, leaveType, startDate, endDate, totalDays, reason } = req.body;
    const staff = getTenantStaff(tenantId).find(s => s.id === staffId);
    const requests = leaveCache.get(tenantId) || [];

    const newReq: LeaveRequestStore = {
      id: `lr-${Date.now()}`,
      tenantId,
      staffId,
      staffName: staff?.name || 'Staff Member',
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason,
      status: 'PENDING',
    };

    requests.unshift(newReq);
    leaveCache.set(tenantId, requests);
    res.status(201).json({ success: true, data: newReq });
  })
);

// PATCH /api/tenant/staff/leave/requests/:id
router.patch(
  '/leave/requests/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { id } = req.params;
    const { status, reviewedBy } = req.body;
    const requests = leaveCache.get(tenantId) || [];
    const index = requests.findIndex(r => r.id === id);

    if (index === -1) {
      throw createError('Leave request not found', 404);
    }

    requests[index].status = status;
    requests[index].reviewedBy = reviewedBy || req.user?.userId || 'Administrator';
    requests[index].reviewDate = new Date().toISOString();

    res.json({ success: true, data: requests[index] });
  })
);

// ─── PAYROLL ──────────────────────────────────────────────────
// GET /api/tenant/staff/payroll/records
router.get(
  '/payroll/records',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const records = payrollCache.get(tenantId) || [];
    res.json({ success: true, data: records });
  })
);

// POST /api/tenant/staff/payroll/generate
router.post(
  '/payroll/generate',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { month } = req.body; // e.g. "2026-09"
    const staff = getTenantStaff(tenantId).filter(s => s.status === 'ACTIVE');
    const existing = payrollCache.get(tenantId) || [];

    const newRecords: PayrollRecordStore[] = staff.map(s => {
      const basic = s.monthlySalary;
      const gross = basic;
      const net = gross;

      return {
        id: `pr-${Date.now()}-${s.id}`,
        tenantId,
        staffId: s.id,
        staffName: s.name,
        department: s.department,
        month,
        basicSalary: basic,
        presentDays: 26,
        absentDays: 0,
        leaveDays: 0,
        overtimeAmount: 0,
        advanceDeduct: 0,
        bonus: 0,
        grossSalary: gross,
        deductions: 0,
        netSalary: net,
        status: 'DRAFT',
      };
    });

    const combined = [...newRecords, ...existing.filter(e => e.month !== month)];
    payrollCache.set(tenantId, combined);

    res.json({ success: true, data: newRecords });
  })
);

// PATCH /api/tenant/staff/payroll/:id/pay
router.patch(
  '/payroll/:id/pay',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const records = payrollCache.get(tenantId) || [];
    const index = records.findIndex(r => r.id === id);

    if (index === -1) {
      throw createError('Payroll record not found', 404);
    }

    records[index].status = 'PAID';
    records[index].paymentMethod = paymentMethod || 'Bank Transfer';
    records[index].paidAt = new Date().toISOString();
    records[index].paidBy = req.user?.userId || 'Admin';

    res.json({ success: true, data: records[index] });
  })
);

// ─── SALARY ADVANCES ──────────────────────────────────────────
// GET /api/tenant/staff/advances
router.get(
  '/advances',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const advances = advanceCache.get(tenantId) || [];
    res.json({ success: true, data: advances });
  })
);

// POST /api/tenant/staff/advances
router.post(
  '/advances',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { staffId, amount, givenDate, deductMonth, note } = req.body;
    const staff = getTenantStaff(tenantId).find(s => s.id === staffId);
    const advances = advanceCache.get(tenantId) || [];

    const newAdvance: SalaryAdvanceStore = {
      id: `adv-${Date.now()}`,
      tenantId,
      staffId,
      staffName: staff?.name || 'Staff Member',
      amount: Number(amount) || 0,
      givenDate: givenDate || new Date().toISOString().split('T')[0],
      deductMonth: deductMonth || '',
      note: note || '',
      isDeducted: false,
    };

    advances.unshift(newAdvance);
    advanceCache.set(tenantId, advances);

    res.status(201).json({ success: true, data: newAdvance });
  })
);

export default router;
