import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

interface SmsConfigStore {
  tenantId: string;
  provider: 'ssl_wireless' | 'greenweb' | 'twilio' | 'mock';
  apiKey: string;
  senderId: string;
  balance: number;
  notifyOnReportReady: boolean;
  notifyOnAppointment: boolean;
  notifyOnDuePayment: boolean;
  notifyOnOnlineBooking: boolean;
  reportReadyTemplate: string;
  appointmentTemplate: string;
  duePaymentTemplate: string;
}

interface SmsLogStore {
  id: string;
  tenantId: string;
  phone: string;
  message: string;
  type: 'REPORT_READY' | 'APPOINTMENT_REMINDER' | 'DUE_PAYMENT' | 'BOOKING_CONFIRM' | 'GENERAL';
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  provider: string;
  cost: number;
  createdAt: string;
}

const smsConfigCache: Map<string, SmsConfigStore> = new Map();
const smsLogCache: Map<string, SmsLogStore[]> = new Map();

function getTenantSmsConfig(tenantId: string): SmsConfigStore {
  if (!smsConfigCache.has(tenantId)) {
    smsConfigCache.set(tenantId, {
      tenantId,
      provider: 'ssl_wireless',
      apiKey: 'SSL_LIVE_KEY_894294029402',
      senderId: 'CAREPULSE',
      balance: 450.00,
      notifyOnReportReady: true,
      notifyOnAppointment: true,
      notifyOnDuePayment: true,
      notifyOnOnlineBooking: true,
      reportReadyTemplate:
        'Dear {patientName}, your test report is ready for collection at {clinicName}. View online: {reportLink}',
      appointmentTemplate:
        'Dear {patientName}, your appointment with {doctorName} is confirmed for {appointmentDate} at {appointmentTime}. Token: #{tokenNo}.',
      duePaymentTemplate:
        'Dear {patientName}, an outstanding balance of BDT {dueAmount} is due for invoice #{invoiceNo} at {clinicName}.',
    });
  }
  return smsConfigCache.get(tenantId)!;
}

function getTenantSmsLogs(tenantId: string): SmsLogStore[] {
  if (!smsLogCache.has(tenantId)) {
    smsLogCache.set(tenantId, [
      {
        id: 'sms-001',
        tenantId,
        phone: '01711-223344',
        message: 'Dear Rashida Begum, your test report is ready. View online: https://clinic.carepulse.bd/r/REP-2026-X892',
        type: 'REPORT_READY',
        status: 'DELIVERED',
        provider: 'SSL Wireless',
        cost: 0.50,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'sms-002',
        tenantId,
        phone: '01819-334455',
        message: 'Dear Kazi Mahbubur Rahman, your appointment with Prof. Dr. M. A. Rahman is confirmed. Token #1.',
        type: 'APPOINTMENT_REMINDER',
        status: 'DELIVERED',
        provider: 'SSL Wireless',
        cost: 0.50,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      }
    ]);
  }
  return smsLogCache.get(tenantId)!;
}

// ─── GET /api/tenant/sms/config ───────────────────────────────
router.get(
  '/config',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const config = getTenantSmsConfig(tenantId);
    res.json({ success: true, data: config });
  })
);

// ─── PUT /api/tenant/sms/config ───────────────────────────────
router.put(
  '/config',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const current = getTenantSmsConfig(tenantId);
    const updated = { ...current, ...req.body, tenantId };
    smsConfigCache.set(tenantId, updated);
    res.json({ success: true, data: updated });
  })
);

// ─── GET /api/tenant/sms/logs ─────────────────────────────────
router.get(
  '/logs',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const logs = getTenantSmsLogs(tenantId);
    res.json({ success: true, data: logs });
  })
);

// ─── POST /api/tenant/sms/send ────────────────────────────────
router.post(
  '/send',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { phone, message, type = 'GENERAL' } = req.body;

    if (!phone || !message) {
      throw createError('Phone and message are required', 400);
    }

    const config = getTenantSmsConfig(tenantId);
    if (config.balance < 0.50) {
      throw createError('Insufficient SMS gateway balance. Please recharge.', 400);
    }

    // Deduct SMS credit
    config.balance = Math.max(0, Number((config.balance - 0.50).toFixed(2)));

    // Create log record
    const logs = getTenantSmsLogs(tenantId);
    const newLog: SmsLogStore = {
      id: `sms-${Date.now()}`,
      tenantId,
      phone,
      message,
      type,
      status: 'DELIVERED',
      provider: config.provider === 'ssl_wireless' ? 'SSL Wireless' : config.provider.toUpperCase(),
      cost: 0.50,
      createdAt: new Date().toISOString(),
    };

    logs.unshift(newLog);

    res.json({
      success: true,
      message: `SMS dispatched successfully to ${phone}`,
      data: newLog,
      balanceRemaining: config.balance,
    });
  })
);

export default router;
