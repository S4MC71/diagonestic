import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/roleGuard';

const router = Router();

router.use(auth, tenantGuard);

/**
 * GET /api/tenant/modules
 * Returns all enabled modules for the current tenant.
 * Frontend uses this to decide which sidebar items to show.
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;

    const [modules, moduleDefs] = await Promise.all([
      prisma.tenantModule.findMany({
        where: { tenantId, isEnabled: true },
        select: { moduleKey: true, config: true },
      }),
      prisma.module.findMany({
        where: { isActive: true },
      }),
    ]);

    const defMap = new Map(moduleDefs.map((d) => [d.key, d]));

    const enabledModules = modules.reduce(
      (acc, m) => {
        const def = defMap.get(m.moduleKey);
        acc[m.moduleKey] = {
          enabled: true,
          config: m.config,
          label: def?.label ?? m.moduleKey,
          icon: def?.icon ?? '📦',
          category: def?.category ?? 'GENERAL',
        };
        return acc;
      },
      {} as Record<string, { enabled: boolean; config: unknown; label: string; icon: string; category: string }>
    );

    res.json({
      success: true,
      data: {
        modules: enabledModules,
        moduleKeys: modules.map((m) => m.moduleKey),
      },
    });
  })
);

export default router;
