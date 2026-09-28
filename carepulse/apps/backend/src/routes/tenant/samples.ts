import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Auto Sample ID ───────────────────────────────────────────
async function generateSampleId(tenantId: string): Promise<string> {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { samplePrefix: true },
  });
  const prefix = settings?.samplePrefix ?? 'SMP';
  const last = await prisma.sample.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { sampleId: true },
  });
  let nextNum = 1;
  if (last) {
    const match = last.sampleId.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  return `${prefix}-${String(nextNum).padStart(5, '0')}`;
}

// ─── Validation ───────────────────────────────────────────────
const sampleSchema = z.object({
  invoiceId:       z.string().uuid(),
  patientId:       z.string().uuid(),
  testId:          z.string().uuid().optional().nullable(),
  testName:        z.string().min(1),
  specimen:        z.string().optional(),
  tubeColor:       z.string().optional(),
  collectionType:  z.enum(['center', 'home']).default('center'),
  deliveryAddress: z.string().optional(),
  notes:           z.string().optional(),
});

const statusSchema = z.object({
  status:      z.enum(['PENDING', 'COLLECTED', 'RECEIVED', 'PROCESSING', 'DONE', 'REJECTED']),
  collectedBy: z.string().uuid().optional(),
  notes:       z.string().optional(),
});

// ─── GET /api/tenant/samples ──────────────────────────────────
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
          { sampleId: { contains: search, mode: 'insensitive' as const } },
          { testName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [samples, total] = await Promise.all([
      prisma.sample.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          patient:   { select: { id: true, name: true, phone: true, patientId: true } },
          collector: { select: { id: true, name: true } },
        },
      }),
      prisma.sample.count({ where }),
    ]);

    res.json({
      success: true,
      data: { samples, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// ─── GET /api/tenant/samples/:id ─────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const sample = await prisma.sample.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: {
        patient:  true,
        invoice:  { select: { invoiceNo: true, date: true } },
        test:     { select: { name: true, normalRange: true, unit: true } },
        collector: { select: { id: true, name: true } },
      },
    });
    if (!sample) throw createError('Sample not found', 404);
    res.json({ success: true, data: { sample } });
  })
);

// ─── POST /api/tenant/samples ────────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST', 'PHLEBOTOMIST', 'LAB_TECHNICIAN']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = sampleSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const sampleId = await generateSampleId(tenantId);

    const sample = await prisma.sample.create({
      data: { ...parsed.data, tenantId, sampleId },
    });
    res.status(201).json({ success: true, message: 'Sample registered', data: { sample } });
  })
);

// ─── PATCH /api/tenant/samples/:id/status ────────────────────
router.patch(
  '/:id/status',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'PHLEBOTOMIST', 'LAB_TECHNICIAN']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const existing = await prisma.sample.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Sample not found', 404);

    const updateData: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === 'COLLECTED') {
      updateData.collectedAt = new Date();
      updateData.collectedBy = parsed.data.collectedBy ?? req.user!.userId;
    }
    if (parsed.data.status === 'RECEIVED') {
      updateData.receivedAt = new Date();
    }

    const sample = await prisma.sample.update({ where: { id }, data: updateData });
    res.json({ success: true, message: 'Sample status updated', data: { sample } });
  })
);

// ─── DELETE /api/tenant/samples/:id ──────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.sample.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Sample not found', 404);
    await prisma.sample.delete({ where: { id } });
    res.json({ success: true, message: 'Sample deleted' });
  })
);

export default router;
