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

    const modules = await prisma.tenantModule.findMany({
      where: { tenantId, isEnabled: true },
      select: { moduleKey: true, config: true },
    });

    const enabledModules = modules.reduce(
      (acc, m) => {
        acc[m.moduleKey] = { enabled: true, config: m.config };
        return acc;
      },
      {} as Record<string, { enabled: boolean; config: unknown }>
    );

    res.json({ success: true, data: { modules: enabledModules } });
  })
);

export default router;
