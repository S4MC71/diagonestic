import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Validation ───────────────────────────────────────────────
const doctorSchema = z.object({
  name:           z.string().min(2),
  degrees:        z.string().optional(),
  designation:    z.string().default('Consultant'),
  specialty:      z.string().min(1),
  hospital:       z.string().optional(),
  phone:          z.string().min(6),
  email:          z.string().email().optional().or(z.literal('')),
  bmdcReg:        z.string().optional(),
  isConsultant:   z.boolean().default(false),
  isReferralAgent: z.boolean().default(true),
  commissionType:  z.enum(['percentage', 'fixed']).default('percentage'),
  commissionValue: z.number().min(0).default(0),
  isActive:        z.boolean().default(true),
});

const chamberSchema = z.object({
  roomNo:          z.string().min(1),
  name:            z.string().min(1),
  floor:           z.string().optional(),
  department:      z.string().optional(),
  doctorId:        z.string().uuid().optional().nullable(),
  visitingDays:    z.array(z.string()).default([]),
  startTime:       z.string().optional(),
  endTime:         z.string().optional(),
  maxPatients:     z.number().int().positive().optional(),
  consultationFee: z.number().min(0).default(0),
  followUpFee:     z.number().min(0).default(0),
  status:          z.string().default('Available'),
});

// ═══════════════════════════════════════════════
// DOCTORS
// ═══════════════════════════════════════════════

// GET /api/tenant/doctors
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, isActive, page = '1', limit = '50' } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name:     { contains: search, mode: 'insensitive' as const } },
          { phone:    { contains: search } },
          { specialty: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({ where, skip, take: limitNum, orderBy: { name: 'asc' } }),
      prisma.doctor.count({ where }),
    ]);

    res.json({
      success: true,
      data: { doctors, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// GET /api/tenant/doctors/:id
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const doctor = await prisma.doctor.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: { chambers: true },
    });
    if (!doctor) throw createError('Doctor not found', 404);
    res.json({ success: true, data: { doctor } });
  })
);

// POST /api/tenant/doctors
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = doctorSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const doctor = await prisma.doctor.create({
      data: { ...parsed.data, tenantId: req.user!.tenantId! },
    });
    res.status(201).json({ success: true, message: 'Doctor created', data: { doctor } });
  })
);

// PUT /api/tenant/doctors/:id
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = doctorSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.doctor.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Doctor not found', 404);

    const doctor = await prisma.doctor.update({ where: { id }, data: parsed.data });
    res.json({ success: true, message: 'Doctor updated', data: { doctor } });
  })
);

// DELETE /api/tenant/doctors/:id
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.doctor.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Doctor not found', 404);
    await prisma.doctor.delete({ where: { id } });
    res.json({ success: true, message: 'Doctor deleted' });
  })
);

// ═══════════════════════════════════════════════
// CHAMBERS (nested under doctors route)
// ═══════════════════════════════════════════════

// GET /api/tenant/doctors/chambers
router.get(
  '/chambers/all',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const chambers = await prisma.chamber.findMany({
      where: { tenantId },
      include: { doctor: { select: { id: true, name: true, specialty: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: { chambers } });
  })
);

// POST /api/tenant/doctors/chambers
router.post(
  '/chambers',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = chamberSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const chamber = await prisma.chamber.create({
      data: { ...parsed.data, tenantId: req.user!.tenantId! },
    });
    res.status(201).json({ success: true, message: 'Chamber created', data: { chamber } });
  })
);

// PUT /api/tenant/doctors/chambers/:id
router.put(
  '/chambers/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const parsed   = chamberSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const existing = await prisma.chamber.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Chamber not found', 404);
    const chamber = await prisma.chamber.update({ where: { id }, data: parsed.data });
    res.json({ success: true, message: 'Chamber updated', data: { chamber } });
  })
);

// DELETE /api/tenant/doctors/chambers/:id
router.delete(
  '/chambers/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.chamber.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Chamber not found', 404);
    await prisma.chamber.delete({ where: { id } });
    res.json({ success: true, message: 'Chamber deleted' });
  })
);

export default router;
