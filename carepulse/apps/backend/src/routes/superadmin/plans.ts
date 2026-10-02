import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { requireSuperAdmin, requireAdminL2OrAbove } from '../../middleware/roleGuard';

const router = Router();

// Base router requires authentication
router.use(auth);

// ─── Validation ───────────────────────────────────────────────
const planSchema = z.object({
  name: z.string().min(2),
  priceMonthly: z.number().int().min(0),
  priceYearly: z.number().int().min(0).optional(),
  maxUsers: z.number().int().min(1).default(5),
  modules: z
    .array(
      z.enum([
        'patients', 'clinical', 'lab', 'pharmacy', 'home_collection',
        'send_out', 'finance', 'commissions', 'inventory', 'accounting',
        'recall', 'whatsapp', 'multi_branch',
      ])
    )
    .min(1, 'At least one module is required'),
  isActive: z.boolean().default(true),
});

// ─── GET /api/superadmin/plans ────────────────────────────────
router.get(
  '/',
  requireAdminL2OrAbove,
  asyncHandler(async (_req: Request, res: Response) => {
    const plans = await prisma.plan.findMany({
      orderBy: { priceMonthly: 'asc' },
      include: { _count: { select: { tenants: true } } },
    });

    res.json({
      success: true,
      data: {
        plans: plans.map((p) => ({ ...p, tenantCount: p._count.tenants })),
      },
    });
  })
);

// ─── GET /api/superadmin/plans/:id ───────────────────────────
router.get(
  '/:id',
  requireAdminL2OrAbove,
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { _count: { select: { tenants: true } } },
    });

    if (!plan) throw createError('Plan not found', 404);
    res.json({ success: true, data: { plan } });
  })
);

// ─── POST /api/superadmin/plans ───────────────────────────────
router.post(
  '/',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const plan = await prisma.plan.create({
      data: {
        ...parsed.data,
        modules: parsed.data.modules as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({
      success: true,
      message: `Plan "${plan.name}" created`,
      data: { plan },
    });
  })
);

// ─── PUT /api/superadmin/plans/:id ───────────────────────────
router.put(
  '/:id',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const parsed = planSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) throw createError('Plan not found', 404);

    const updateData: Prisma.PlanUpdateInput = { ...parsed.data };
    if (parsed.data.modules) {
      updateData.modules = parsed.data.modules as Prisma.InputJsonValue;
    }

    const updated = await prisma.plan.update({ where: { id }, data: updateData });
    res.json({ success: true, message: 'Plan updated', data: { plan: updated } });
  })
);

// ─── DELETE /api/superadmin/plans/:id ────────────────────────
router.delete(
  '/:id',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { _count: { select: { tenants: true } } },
    });

    if (!plan) throw createError('Plan not found', 404);

    if (plan._count.tenants > 0) {
      throw createError(
        `Cannot delete: ${plan._count.tenants} active tenant(s) are on this plan`,
        409
      );
    }

    await prisma.plan.delete({ where: { id } });
    res.json({ success: true, message: 'Plan deleted' });
  })
);

export default router;
