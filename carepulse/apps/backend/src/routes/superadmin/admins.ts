import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { requireSuperAdmin } from '../../middleware/roleGuard';

const router = Router();

// All admin management routes require SUPER_ADMIN
router.use(auth, requireSuperAdmin);

// ─── Validation Schemas ───────────────────────────────────────
const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must contain letters, numbers, and underscores only'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email().optional().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'ADMIN_L2']).default('ADMIN_L2'),
});

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

// ─── GET /api/superadmin/admins ───────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const admins = await prisma.user.findMany({
      where: {
        tenantId: null,
        role: { in: ['SUPER_ADMIN', 'ADMIN_L2'] },
      },
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
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: {
        admins,
        total: admins.length,
        superAdminCount: admins.filter((a) => a.role === 'SUPER_ADMIN').length,
        adminL2Count: admins.filter((a) => a.role === 'ADMIN_L2').length,
      },
    });
  })
);

// ─── POST /api/superadmin/admins ──────────────────────────────
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const { name, username, password, email, role } = parsed.data;

    // Check if username is already taken
    const existing = await prisma.user.findFirst({
      where: { username },
    });
    if (existing) {
      throw createError(`Username "${username}" is already in use`, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        tenantId: null,
        name,
        username,
        email: email || null,
        passwordHash,
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `${role === 'ADMIN_L2' ? 'Level 2 Admin' : 'Super Admin'} "${username}" created successfully`,
      data: { admin: newAdmin },
    });
  })
);

// ─── PATCH /api/superadmin/admins/:id/status ──────────────────
router.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const currentUserId = req.user?.userId;

    if (id === currentUserId) {
      throw createError('You cannot alter your own administrative status', 400);
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const admin = await prisma.user.findUnique({ where: { id } });
    if (!admin || admin.tenantId !== null) {
      throw createError('Administrative user not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
      select: { id: true, name: true, username: true, role: true, isActive: true },
    });

    res.json({
      success: true,
      message: `Admin "${updated.username}" ${updated.isActive ? 'activated' : 'deactivated'}`,
      data: { admin: updated },
    });
  })
);

// ─── DELETE /api/superadmin/admins/:id ────────────────────────
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const currentUserId = req.user?.userId;

    if (id === currentUserId) {
      throw createError('You cannot delete your own administrative account', 400);
    }

    const admin = await prisma.user.findUnique({ where: { id } });
    if (!admin || admin.tenantId !== null) {
      throw createError('Administrative user not found', 404);
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: `Administrative user "${admin.username}" deleted`,
    });
  })
);

export default router;
