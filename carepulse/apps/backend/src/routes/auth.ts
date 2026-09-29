import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';

const router = Router();

// ─── Validation Schemas ───────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const { username, password } = parsed.data;

    // Find user — SUPER_ADMIN has tenantId = null
    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        tenant: {
          select: { id: true, name: true, slug: true, status: true, planExpiresAt: true },
        },
      },
    });

    if (!user) {
      throw createError('Invalid username or password', 401);
    }

    if (!user.isActive) {
      throw createError('Your account has been deactivated. Contact your administrator.', 403);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw createError('Invalid username or password', 401);
    }

    // Check tenant status (skip for SUPER_ADMIN)
    if (user.role !== 'SUPER_ADMIN' && user.tenant) {
      if (user.tenant.status === 'SUSPENDED') {
        throw createError('Your organization account has been suspended. Contact support.', 403);
      }
      if (user.tenant.status === 'EXPIRED') {
        throw createError('Your subscription has expired. Please renew to continue.', 403);
      }
    }

    // Issue tokens
    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Fetch enabled modules for tenant user
    const enabledModules = user.tenantId
      ? await prisma.tenantModule.findMany({
          where: { tenantId: user.tenantId, isEnabled: true },
          select: { moduleKey: true },
        })
      : [];
    const moduleKeys = enabledModules.map((m) => m.moduleKey);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        modules: moduleKeys,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          modules: moduleKeys,
          tenant: user.tenant
            ? {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.slug,
                status: user.tenant.status,
                modules: moduleKeys,
              }
            : null,
        },
      },
    });
  })
);

// ─── POST /api/auth/refresh ───────────────────────────────────
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Refresh token is required', 400);
    }

    let payload;
    try {
      payload = verifyRefreshToken(parsed.data.refreshToken);
    } catch {
      throw createError('Invalid or expired refresh token', 401);
    }

    // Ensure user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true, tenantId: true },
    });

    if (!user || !user.isActive) {
      throw createError('User not found or deactivated', 401);
    }

    const newTokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    };

    res.json({
      success: true,
      data: {
        accessToken: signAccessToken(newTokenPayload),
        refreshToken: signRefreshToken(newTokenPayload),
      },
    });
  })
);

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get(
  '/me',
  auth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: {
          select: { id: true, name: true, slug: true, status: true },
        },
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const enabledModules = user.tenantId
      ? await prisma.tenantModule.findMany({
          where: { tenantId: user.tenantId, isEnabled: true },
          select: { moduleKey: true },
        })
      : [];
    const moduleKeys = enabledModules.map((m) => m.moduleKey);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          modules: moduleKeys,
        },
        modules: moduleKeys,
      },
    });
  })
);

// ─── POST /api/auth/logout ────────────────────────────────────
// Stateless JWT — client simply discards the token.
// This endpoint exists for audit logging or future token blocklist support.
router.post('/logout', auth, (req: Request, res: Response) => {
  // In a future implementation: add token to a blocklist (Redis)
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
