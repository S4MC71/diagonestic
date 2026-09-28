import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Auto Invoice Number ──────────────────────────────────────
async function generateInvoiceNo(tenantId: string): Promise<string> {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { invoicePrefix: true },
  });
  const prefix = settings?.invoicePrefix ?? 'INV';
  const last = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNo: true },
  });
  let nextNum = 1;
  if (last) {
    const match = last.invoiceNo.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  return `${prefix}-${String(nextNum).padStart(5, '0')}`;
}

// ─── Validation ───────────────────────────────────────────────
const invoiceItemSchema = z.object({
  testId:      z.string().uuid().optional().nullable(),
  testCode:    z.string().min(1),
  testName:    z.string().min(1),
  quantity:    z.number().int().min(1).default(1),
  unitPrice:   z.number().min(0),
  discount:    z.number().min(0).default(0),
  netPrice:    z.number().min(0),
  isSendout:   z.boolean().default(false),
  labVendorId: z.string().optional().nullable(),
});

const invoiceSchema = z.object({
  patientId:     z.string().uuid(),
  referredBy:    z.string().uuid().optional().nullable(),
  date:          z.string().optional(),
  items:         z.array(invoiceItemSchema).min(1),
  discount:      z.number().min(0).default(0),
  discountPct:   z.number().min(0).max(100).default(0),
  paid:          z.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  vat:           z.number().min(0).default(0),
});

const paymentSchema = z.object({
  amount:        z.number().min(0.01),
  paymentMethod: z.string().optional(),
});

// ─── GET /api/tenant/invoices ─────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, status, dateFrom, dateTo, page = '1', limit = '20' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(status && { paymentStatus: status }),
      ...((dateFrom || dateTo) && {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo   && { lte: new Date(dateTo)   }),
        },
      }),
      ...(search && {
        OR: [
          { invoiceNo:   { contains: search, mode: 'insensitive' as const } },
          { patientName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { items: true, patient: { select: { phone: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: { invoices, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// ─── GET /api/tenant/invoices/:id ────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: {
        items: true,
        patient: true,
        referrer: { select: { id: true, name: true, specialty: true } },
      },
    });
    if (!invoice) throw createError('Invoice not found', 404);
    res.json({ success: true, data: { invoice } });
  })
);

// ─── POST /api/tenant/invoices ───────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST', 'ACCOUNTANT']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = invoiceSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const { items, patientId, referredBy, date, discount, discountPct, paid, paymentMethod, vat } = parsed.data;

    // Verify patient belongs to tenant
    const patient = await prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw createError('Patient not found', 404);

    const grossTotal = items.reduce((sum, i) => sum + i.netPrice * i.quantity, 0);
    const netTotal   = grossTotal - discount + vat;
    const due        = Math.max(0, netTotal - paid);
    const payStatus  = due === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';
    const invoiceNo  = await generateInvoiceNo(tenantId);

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          tenantId, invoiceNo,
          patientId, patientName: patient.name,
          referredBy: referredBy ?? null,
          date:       date ? new Date(date) : new Date(),
          grossTotal, discount, discountPct, netTotal, paid, due, vat,
          paymentStatus: payStatus,
          paymentMethod: paymentMethod ?? null,
          createdBy: req.user!.userId,
          items: { create: items },
        },
        include: { items: true },
      });

      // Update patient outstanding due
      await tx.patient.update({
        where: { id: patientId },
        data: {
          outstandingDue: { increment: due },
          totalBilled:    { increment: netTotal },
          totalVisits:    { increment: 1 },
          lastVisitAt:    new Date(),
        },
      });

      return inv;
    });

    res.status(201).json({ success: true, message: 'Invoice created', data: { invoice } });
  })
);

// ─── PATCH /api/tenant/invoices/:id/payment ──────────────────
router.patch(
  '/:id/payment',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST', 'ACCOUNTANT']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw createError('Invoice not found', 404);

    const newPaid = Number(invoice.paid) + parsed.data.amount;
    const newDue  = Math.max(0, Number(invoice.netTotal) - newPaid);
    const status  = newDue === 0 ? 'PAID' : 'PARTIAL';

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: { paid: newPaid, due: newDue, paymentStatus: status, paymentMethod: parsed.data.paymentMethod },
      });
      // Update patient outstanding
      const reduction = Math.min(parsed.data.amount, Number(invoice.due));
      if (reduction > 0) {
        await tx.patient.update({
          where: { id: invoice.patientId },
          data: { outstandingDue: { decrement: reduction } },
        });
      }
      return inv;
    });

    res.json({ success: true, message: 'Payment recorded', data: { invoice: updated } });
  })
);

// ─── DELETE /api/tenant/invoices/:id ─────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Invoice not found', 404);
    await prisma.invoice.delete({ where: { id } });
    res.json({ success: true, message: 'Invoice deleted' });
  })
);

export default router;
