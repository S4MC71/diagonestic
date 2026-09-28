import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();

// All routes require SUPER_ADMIN role
router.use(auth, roleGuard(['SUPER_ADMIN']));

// ─── Helpers ──────────────────────────────────────────────────
/** Cast req.query values safely to string */
function qs(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

/** Cast arbitrary object to Prisma-compatible InputJsonValue */
function toJson(val: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(val)) as Prisma.InputJsonValue;
}

// ─── Validation Schemas ───────────────────────────────────────
const createTenantSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  name: z.string().min(2),
  bengaliName: z.string().optional(),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  address: z.string().optional(),
  planId: z.string().uuid().optional(),
  planExpiresAt: z.string().datetime().optional(),
  adminName: z.string().min(2),
  adminUsername: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  adminPassword: z.string().min(8),
});

const updateStatusSchema = z.object({
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED']),
});

const toggleModuleSchema = z.object({
  moduleKey: z.string().min(1),
  isEnabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

const assignPlanSchema = z.object({
  planId: z.string().uuid(),
  planExpiresAt: z.string().datetime(),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  amount: z.number().int().positive(),
  method: z.string().optional(),
  notes: z.string().optional(),
});

// ─── GET /api/superadmin/tenants ──────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const status   = qs(req.query.status);
    const search   = qs(req.query.search);
    const page     = parseInt(qs(req.query.page)  ?? '1',  10);
    const limit    = parseInt(qs(req.query.limit) ?? '20', 10);

    const pageNum  = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip     = (pageNum - 1) * limitNum;

    const where: Prisma.TenantWhereInput = {};
    if (status && status !== 'ALL') where.status = status as Prisma.EnumTenantStatusFilter;
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { slug:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: { select: { id: true, name: true } },
          _count: { select: { users: true } },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tenants: tenants.map((t) => ({
          id:            t.id,
          slug:          t.slug,
          name:          t.name,
          bengaliName:   t.bengaliName,
          phone:         t.phone,
          email:         t.email,
          status:        t.status,
          plan:          t.plan,
          planExpiresAt: t.planExpiresAt,
          userCount:     t._count.users,
          createdAt:     t.createdAt,
        })),
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  })
);

// ─── GET /api/superadmin/tenants/:id ─────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        modules: true,
        settings: true,
        users: {
          select: { id: true, name: true, username: true, role: true, isActive: true, lastLoginAt: true },
          orderBy: { createdAt: 'asc' },
        },
        subscriptionPayments: {
          orderBy: { paidAt: 'desc' },
          take: 10,
        },
        _count: { select: { patients: true, invoices: true } },
      },
    });

    if (!tenant) throw createError('Tenant not found', 404);

    res.json({ success: true, data: { tenant } });
  })
);

// ─── POST /api/superadmin/tenants ─────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createTenantSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const {
      slug, name, bengaliName, phone, email, address,
      planId, planExpiresAt, adminName, adminUsername, adminPassword,
    } = parsed.data;

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw createError(`Slug "${slug}" is already taken`, 409);

    let planModules: string[] = [];
    if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) throw createError('Plan not found', 404);
      planModules = plan.modules as string[];
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug,
          name,
          bengaliName,
          phone,
          email,
          address,
          planId:         planId ?? null,
          planExpiresAt:  planExpiresAt ? new Date(planExpiresAt) : null,
          status:         planId ? 'ACTIVE' : 'TRIAL',
        },
      });

      await tx.tenantSettings.create({ data: { tenantId: tenant.id } });

      await tx.user.create({
        data: {
          tenantId:     tenant.id,
          name:         adminName,
          username:     adminUsername,
          passwordHash,
          role:         'TENANT_ADMIN',
        },
      });

      if (planModules.length > 0) {
        await tx.tenantModule.createMany({
          data: planModules.map((moduleKey) => ({
            tenantId: tenant.id,
            moduleKey,
            isEnabled: true,
          })),
        });
      }

      return tenant;
    });

    res.status(201).json({
      success: true,
      message: `Tenant "${name}" created successfully`,
      data: { tenantId: result.id, slug: result.slug },
    });
  })
);

// ─── PATCH /api/superadmin/tenants/:id/status ─────────────────
router.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw createError('Tenant not found', 404);

    await prisma.tenant.update({ where: { id }, data: { status: parsed.data.status } });

    res.json({ success: true, message: `Status updated to ${parsed.data.status}` });
  })
);

// ─── PATCH /api/superadmin/tenants/:id/modules ────────────────
router.patch(
  '/:id/modules',
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const parsed = toggleModuleSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw createError('Tenant not found', 404);

    const { moduleKey, isEnabled, config } = parsed.data;
    const configJson = config ? toJson(config) : toJson({});

    await prisma.tenantModule.upsert({
      where:  { tenantId_moduleKey: { tenantId: id, moduleKey } },
      update: { isEnabled, config: configJson },
      create: { tenantId: id, moduleKey, isEnabled, config: configJson },
    });

    res.json({
      success: true,
      message: `Module "${moduleKey}" ${isEnabled ? 'enabled' : 'disabled'}`,
    });
  })
);

// ─── POST /api/superadmin/tenants/:id/assign-plan ─────────────
router.post(
  '/:id/assign-plan',
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const parsed = assignPlanSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const { planId, planExpiresAt, billingCycle, amount, method, notes } = parsed.data;

    const [tenant, plan] = await Promise.all([
      prisma.tenant.findUnique({ where: { id } }),
      prisma.plan.findUnique({ where: { id: planId } }),
    ]);

    if (!tenant) throw createError('Tenant not found', 404);
    if (!plan)   throw createError('Plan not found',   404);

    const modules = plan.modules as string[];

    await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id },
        data: { planId, planExpiresAt: new Date(planExpiresAt), status: 'ACTIVE' },
      });

      for (const moduleKey of modules) {
        await tx.tenantModule.upsert({
          where:  { tenantId_moduleKey: { tenantId: id, moduleKey } },
          update: { isEnabled: true },
          create: { tenantId: id, moduleKey, isEnabled: true },
        });
      }

      await tx.subscriptionPayment.create({
        data: {
          tenantId: id,
          planId,
          amount,
          method,
          billingCycle,
          notes,
          status: 'PAID',
        },
      });
    });

    res.json({ success: true, message: `Plan "${plan.name}" assigned successfully` });
  })
);

// ─── DELETE /api/superadmin/tenants/:id ───────────────────────
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw createError('Tenant not found', 404);

    await prisma.tenant.delete({ where: { id } });

    res.json({ success: true, message: 'Tenant permanently deleted' });
  })
);

export default router;
