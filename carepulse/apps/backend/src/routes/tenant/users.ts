import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { roleGuard, tenantGuard } from '../../middleware/roleGuard';

const router = Router();

router.use(auth, tenantGuard);

// ─── Validation ───────────────────────────────────────────────
const createUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username: letters, numbers, underscore only'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([
    'TENANT_ADMIN',
    'CENTER_MANAGER',
    'RECEPTIONIST',
    'LAB_TECHNICIAN',
    'DOCTOR',
    'PHARMACIST',
    'ACCOUNTANT',
    'PHLEBOTOMIST',
  ]),
  email: z.string().email().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  role: z
    .enum([
      'TENANT_ADMIN',
      'CENTER_MANAGER',
      'RECEPTIONIST',
      'LAB_TECHNICIAN',
      'DOCTOR',
      'PHARMACIST',
      'ACCOUNTANT',
      'PHLEBOTOMIST',
    ])
    .optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

// ─── GET /api/tenant/users ────────────────────────────────────
router.get(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: { users } });
  })
);

// ─── POST /api/tenant/users ───────────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const tenantId = req.user!.tenantId!;
    const { name, username, password, role, email } = parsed.data;

    // Check plan's max user limit
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: { select: { maxUsers: true } },
        _count: { select: { users: { where: { isActive: true } } } },
      },
    });

    if (!tenant) throw createError('Tenant not found', 404);

    const userLimit = tenant.maxUsers ?? tenant.plan?.maxUsers ?? 5;
    if (tenant._count.users >= userLimit) {
      throw createError(
        `User limit reached (${userLimit} users max allowed for your center). Please contact system administrator to increase your user limit.`,
        409
      );
    }

    // Check username uniqueness within tenant
    const existingUser = await prisma.user.findFirst({
      where: { tenantId, username },
    });
    if (existingUser) {
      throw createError(`Username "${username}" is already taken`, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { tenantId, name, username, email, passwordHash, role },
      select: { id: true, name: true, username: true, email: true, role: true, isActive: true, createdAt: true },
    });

    res.status(201).json({ success: true, message: 'User created', data: { user } });
  })
);

// ─── PATCH /api/tenant/users/:id ─────────────────────────────
router.patch(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const tenantId = req.user!.tenantId!;

    // Ensure user belongs to this tenant
    const user = await prisma.user.findFirst({
      where: { id, tenantId },
    });
    if (!user) throw createError('User not found', 404);

    // Prevent deactivating the last admin
    if (parsed.data.isActive === false && user.role === 'TENANT_ADMIN') {
      const adminCount = await prisma.user.count({
        where: { tenantId, role: 'TENANT_ADMIN', isActive: true },
      });
      if (adminCount <= 1) {
        throw createError('Cannot deactivate the last admin account', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.password) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
      delete updateData.password;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, username: true, email: true, role: true, isActive: true },
    });

    res.json({ success: true, message: 'User updated', data: { user: updated } });
  })
);

// ─── DELETE /api/tenant/users/:id ────────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const id       = req.params['id'] as string;
    const tenantId = req.user!.tenantId!;

    const user = await prisma.user.findFirst({
      where: { id, tenantId },
    });
    if (!user) throw createError('User not found', 404);

    // Prevent deleting own account
    if (user.id === req.user!.userId) {
      throw createError('Cannot delete your own account', 409);
    }

    // Prevent deleting last admin
    if (user.role === 'TENANT_ADMIN') {
      const adminCount = await prisma.user.count({
        where: { tenantId, role: 'TENANT_ADMIN', isActive: true },
      });
      if (adminCount <= 1) {
        throw createError('Cannot delete the last admin account', 409);
      }
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User deleted' });
  })
);

export default router;
