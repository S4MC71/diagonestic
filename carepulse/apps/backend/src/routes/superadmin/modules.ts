import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();

// SuperAdmin and Level 2 Admin permissions:
// For viewing, both can access. For creating/editing/deleting, only SUPER_ADMIN can perform.
router.use(auth, roleGuard(['SUPER_ADMIN']));

// ─── Validation Schemas ───────────────────────────────────────
const createModuleSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Key must be lowercase letters, numbers, and underscores only (e.g. radiology, lab_analyzer)'),
  label: z.string().min(2).max(50),
  description: z.string().max(250).default(''),
  icon: z.string().min(1).max(30).default('📦'),
  category: z.enum(['CLINICAL', 'LAB', 'PHARMACY', 'FINANCE', 'ADMIN', 'GENERAL']).default('GENERAL'),
  schema: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const updateModuleSchema = z.object({
  label: z.string().min(2).max(50).optional(),
  description: z.string().max(250).optional(),
  icon: z.string().min(1).max(30).optional(),
  category: z.enum(['CLINICAL', 'LAB', 'PHARMACY', 'FINANCE', 'ADMIN', 'GENERAL']).optional(),
  schema: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const DEFAULT_MODULE_CATALOG = [
  { key: 'patients',        label: 'Patients',        description: 'Patient records, demographics, and visit history', icon: '👥', category: 'CLINICAL',  sortOrder: 1 },
  { key: 'clinical',        label: 'Clinical',        description: 'Prescriptions, chambers, and clinical consultations', icon: '🩺', category: 'CLINICAL',  sortOrder: 2 },
  { key: 'lab',             label: 'Laboratory',      description: 'Test catalog, samples, and diagnostic reports', icon: '🔬', category: 'LAB',       sortOrder: 3 },
  { key: 'pharmacy',        label: 'Pharmacy',        description: 'Point-of-sale, medicine inventory, and sales', icon: '💊', category: 'PHARMACY',  sortOrder: 4 },
  { key: 'home_collection', label: 'Home Collection', description: 'At-home sample collection and delivery dispatch', icon: '🏠', category: 'CLINICAL',  sortOrder: 5 },
  { key: 'send_out',        label: 'Send-Out Lab',    description: 'Outsourced specialized lab tests and vendor tracking', icon: '📦', category: 'LAB',       sortOrder: 6 },
  { key: 'finance',         label: 'Finance',         description: 'Billing, invoices, and payments collection', icon: '💰', category: 'FINANCE',   sortOrder: 7 },
  { key: 'commissions',     label: 'Commissions',     description: 'Doctor referral commission management', icon: '🎯', category: 'FINANCE',   sortOrder: 8 },
  { key: 'inventory',       label: 'Inventory',       description: 'Reagents, equipment, and medical consumable stock', icon: '📋', category: 'ADMIN',     sortOrder: 9 },
  { key: 'accounting',      label: 'Accounting',      description: 'Income, expense ledgers, and cash flow journals', icon: '📊', category: 'FINANCE',   sortOrder: 10 },
  { key: 'recall',          label: 'Recall',          description: 'Automated patient follow-up and chronic re-check reminders', icon: '🔔', category: 'CLINICAL',  sortOrder: 11 },
  { key: 'whatsapp',        label: 'WhatsApp',        description: 'Automated report delivery & alert messaging', icon: '💬', category: 'ADMIN',     sortOrder: 12 },
  { key: 'hrm',             label: 'Staff & HRM',     description: 'Staff directory, biometric attendance, payroll generation, and leave management', icon: '👥', category: 'ADMIN', sortOrder: 13 },
  { key: 'website',         label: 'Website & Branding', description: 'Patient-facing website CMS, online bookings, and branding studio', icon: '🌐', category: 'ADMIN', sortOrder: 14 },
  { key: 'sms',             label: 'SMS Notifications', description: 'SMS gateway integration, delivery logs, and patient notifications', icon: '📱', category: 'ADMIN', sortOrder: 15 },
];

// ─── GET /api/superadmin/modules ──────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    // Ensure default module catalog exists
    const existingCount = await prisma.module.count();
    if (existingCount < DEFAULT_MODULE_CATALOG.length) {
      for (const mod of DEFAULT_MODULE_CATALOG) {
        await prisma.module.upsert({
          where: { key: mod.key },
          update: {},
          create: mod,
        }).catch(() => {});
      }
    }

    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }
    if (search) {
      where.OR = [
        { label: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [modules, tenantModuleCounts] = await Promise.all([
      prisma.module.findMany({
        where,
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.tenantModule.groupBy({
        by: ['moduleKey'],
        where: { isEnabled: true },
        _count: { tenantId: true },
      }),
    ]);

    const tenantCountMap = new Map<string, number>();
    tenantModuleCounts.forEach((tm) => {
      tenantCountMap.set(tm.moduleKey, tm._count.tenantId);
    });

    const enrichedModules = modules.map((m) => ({
      ...m,
      enabledTenantsCount: tenantCountMap.get(m.key) ?? 0,
    }));

    res.json({
      success: true,
      data: {
        modules: enrichedModules,
        total: modules.length,
        activeCount: modules.filter((m) => m.isActive).length,
      },
    });
  })
);

// ─── POST /api/superadmin/modules ─────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const { key, label, description, icon, category, schema, sortOrder, isActive } = parsed.data;

    const existing = await prisma.module.findUnique({ where: { key } });
    if (existing) {
      throw createError(`Module with key "${key}" already exists`, 409);
    }

    const moduleRecord = await prisma.module.create({
      data: {
        key,
        label,
        description,
        icon,
        category,
        schema: schema ? (JSON.parse(JSON.stringify(schema)) as any) : undefined,
        sortOrder,
        isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: `Module "${label}" created successfully`,
      data: { module: moduleRecord },
    });
  })
);

// ─── GET /api/superadmin/modules/:key ─────────────────────────
router.get(
  '/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const key = req.params['key'] as string;
    const moduleRecord = await prisma.module.findUnique({
      where: { key },
    });

    if (!moduleRecord) {
      throw createError(`Module "${key}" not found`, 404);
    }

    const activeUsage = await prisma.tenantModule.count({
      where: { moduleKey: key, isEnabled: true },
    });

    res.json({
      success: true,
      data: {
        module: {
          ...moduleRecord,
          enabledTenantsCount: activeUsage,
        },
      },
    });
  })
);

// ─── PATCH /api/superadmin/modules/:key ───────────────────────
router.patch(
  '/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const key = req.params['key'] as string;
    const parsed = updateModuleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const existing = await prisma.module.findUnique({ where: { key } });
    if (!existing) {
      throw createError(`Module "${key}" not found`, 404);
    }

    const updated = await prisma.module.update({
      where: { key },
      data: {
        ...parsed.data,
        schema: parsed.data.schema ? (JSON.parse(JSON.stringify(parsed.data.schema)) as any) : undefined,
      },
    });

    res.json({
      success: true,
      message: `Module "${updated.label}" updated successfully`,
      data: { module: updated },
    });
  })
);

// ─── DELETE /api/superadmin/modules/:key ──────────────────────
router.delete(
  '/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const key = req.params['key'] as string;

    const existing = await prisma.module.findUnique({ where: { key } });
    if (!existing) {
      throw createError(`Module "${key}" not found`, 404);
    }

    // Check if active tenants are using this module
    const activeUsage = await prisma.tenantModule.count({
      where: { moduleKey: key, isEnabled: true },
    });

    if (activeUsage > 0) {
      // Soft-deactivate to prevent breaking live tenants
      const deactivated = await prisma.module.update({
        where: { key },
        data: { isActive: false },
      });
      return res.json({
        success: true,
        message: `Module "${existing.label}" is assigned to ${activeUsage} tenant(s). It has been deactivated instead of deleted.`,
        data: { module: deactivated, deactivated: true },
      });
    }

    // If no active tenant usage, safely remove
    await prisma.module.delete({ where: { key } });

    res.json({
      success: true,
      message: `Module "${existing.label}" permanently deleted`,
      data: { deleted: true },
    });
  })
);

export default router;
