import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Validation ───────────────────────────────────────────────
const testSchema = z.object({
  code:          z.string().min(1),
  name:          z.string().min(1),
  bengaliName:   z.string().optional(),
  department:    z.string().default('General'),
  specimen:      z.string().optional(),
  method:        z.string().optional(),
  normalRange:   z.string().optional(),
  unit:          z.string().optional(),
  price:         z.number().min(0).default(0),
  costPrice:     z.number().min(0).default(0),
  labVendorPrice: z.number().min(0).default(0),
  tubeColor:     z.string().optional(),
  tatHours:      z.number().int().default(24),
  isSendout:     z.boolean().default(false),
  isActive:      z.boolean().default(true),
});

// ─── GET /api/tenant/tests ────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, department, isActive, page = '1', limit = '50' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(department && { department }),
      ...(search && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' as const } },
          { code:        { contains: search, mode: 'insensitive' as const } },
          { bengaliName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [tests, total] = await Promise.all([
      prisma.diagnosticTest.findMany({ where, skip, take: limitNum, orderBy: { department: 'asc' } }),
      prisma.diagnosticTest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tests,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  })
);

// ─── GET /api/tenant/tests/:id ────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const test = await prisma.diagnosticTest.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
    });
    if (!test) throw createError('Test not found', 404);
    res.json({ success: true, data: { test } });
  })
);

// ─── POST /api/tenant/tests ───────────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = testSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const existing = await prisma.diagnosticTest.findFirst({
      where: { tenantId, code: parsed.data.code },
    });
    if (existing) throw createError(`Test code "${parsed.data.code}" already exists`, 409);

    const test = await prisma.diagnosticTest.create({ data: { ...parsed.data, tenantId } });
    res.status(201).json({ success: true, message: 'Test created', data: { test } });
  })
);

// ─── PUT /api/tenant/tests/:id ────────────────────────────────
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = testSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.diagnosticTest.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Test not found', 404);

    if (parsed.data.code && parsed.data.code !== existing.code) {
      const dup = await prisma.diagnosticTest.findFirst({ where: { tenantId, code: parsed.data.code } });
      if (dup) throw createError(`Test code "${parsed.data.code}" already exists`, 409);
    }

    const test = await prisma.diagnosticTest.update({ where: { id }, data: parsed.data });
    res.json({ success: true, message: 'Test updated', data: { test } });
  })
);

// ─── DELETE /api/tenant/tests/:id ────────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const existing = await prisma.diagnosticTest.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Test not found', 404);

    await prisma.diagnosticTest.delete({ where: { id } });
    res.json({ success: true, message: 'Test deleted' });
  })
);

export default router;
