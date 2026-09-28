import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Auto Report Number ───────────────────────────────────────
async function generateReportNo(tenantId: string): Promise<string> {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { reportPrefix: true },
  });
  const prefix = settings?.reportPrefix ?? 'RPT';
  const last = await prisma.labReport.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { reportNo: true },
  });
  let nextNum = 1;
  if (last) {
    const match = last.reportNo.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  return `${prefix}-${String(nextNum).padStart(5, '0')}`;
}

// ─── Validation ───────────────────────────────────────────────
const reportSchema = z.object({
  invoiceId:      z.string().uuid(),
  patientId:      z.string().uuid(),
  testId:         z.string().uuid().optional().nullable(),
  testName:       z.string().min(1),
  results:        z.array(z.record(z.unknown())).default([]),
  interpretation: z.string().optional(),
  remarks:        z.string().optional(),
  isCritical:     z.boolean().default(false),
});

const verifySchema = z.object({
  pathologistId: z.string().uuid().optional(),
  remarks:       z.string().optional(),
});

// ─── GET /api/tenant/reports ──────────────────────────────────
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
      ...(status && { status }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo   && { lte: new Date(dateTo + 'T23:59:59') }),
        },
      }),
      ...(search && {
        OR: [
          { reportNo: { contains: search, mode: 'insensitive' as const } },
          { testName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [reports, total] = await Promise.all([
      prisma.labReport.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          patient:     { select: { id: true, name: true, phone: true, patientId: true } },
          pathologist: { select: { id: true, name: true } },
        },
      }),
      prisma.labReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: { reports, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// ─── GET /api/tenant/reports/:id ─────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const report = await prisma.labReport.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: {
        patient:     true,
        test:        { select: { name: true, normalRange: true, unit: true, department: true } },
        invoice:     { select: { invoiceNo: true, date: true } },
        pathologist: { select: { id: true, name: true } },
      },
    });
    if (!report) throw createError('Report not found', 404);
    res.json({ success: true, data: { report } });
  })
);

// ─── POST /api/tenant/reports ────────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'LAB_TECHNICIAN']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const reportNo = await generateReportNo(tenantId);

    const report = await prisma.labReport.create({
      data: {
        tenantId, reportNo, status: 'PENDING',
        patientId:      parsed.data.patientId,
        invoiceId:      parsed.data.invoiceId,
        testId:         parsed.data.testId ?? null,
        testName:       parsed.data.testName,
        results:        parsed.data.results as object[],
        interpretation: parsed.data.interpretation,
        remarks:        parsed.data.remarks,
        isCritical:     parsed.data.isCritical ?? false,
      },
    });
    res.status(201).json({ success: true, message: 'Report created', data: { report } });
  })
);

// ─── PUT /api/tenant/reports/:id ─────────────────────────────
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'LAB_TECHNICIAN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = reportSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.labReport.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Report not found', 404);
    if (existing.status === 'VERIFIED') throw createError('Verified reports cannot be edited', 403);

    const report = await prisma.labReport.update({
      where: { id },
      data: {
        status:         'READY',
        testName:       parsed.data.testName,
        results:        parsed.data.results as object[] | undefined,
        interpretation: parsed.data.interpretation,
        remarks:        parsed.data.remarks,
        isCritical:     parsed.data.isCritical,
      },
    });
    res.json({ success: true, message: 'Report updated', data: { report } });
  })
);

// ─── PATCH /api/tenant/reports/:id/verify ────────────────────
router.patch(
  '/:id/verify',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'DOCTOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const existing = await prisma.labReport.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Report not found', 404);

    const report = await prisma.labReport.update({
      where: { id },
      data: {
        status:        'VERIFIED',
        verifiedAt:    new Date(),
        pathologistId: parsed.data.pathologistId ?? req.user!.userId,
        remarks:       parsed.data.remarks,
      },
    });
    res.json({ success: true, message: 'Report verified', data: { report } });
  })
);

// ─── PATCH /api/tenant/reports/:id/printed ───────────────────
router.patch(
  '/:id/printed',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.labReport.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Report not found', 404);
    const report = await prisma.labReport.update({ where: { id }, data: { printedAt: new Date() } });
    res.json({ success: true, message: 'Marked as printed', data: { report } });
  })
);

// ─── DELETE /api/tenant/reports/:id ──────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.labReport.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Report not found', 404);
    await prisma.labReport.delete({ where: { id } });
    res.json({ success: true, message: 'Report deleted' });
  })
);

export default router;
