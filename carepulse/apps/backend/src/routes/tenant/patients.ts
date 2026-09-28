import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();

router.use(auth, tenantGuard);

// ─── Validation ───────────────────────────────────────────────
const patientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  whatsapp: z.string().optional(),
  age: z.number().int().min(0),
  ageUnit: z.enum(['Years', 'Months', 'Days']).default('Years'),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string().optional(),
  address: z.string().min(1),
  nid: z.string().optional(),
});

// Generate next patientId for a tenant: PT-0001, PT-0002, ...
async function generatePatientId(tenantId: string): Promise<string> {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { patientPrefix: true },
  });
  const prefix = settings?.patientPrefix ?? 'PT';

  const lastPatient = await prisma.patient.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { patientId: true },
  });

  let nextNum = 1;
  if (lastPatient) {
    const match = lastPatient.patientId.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }

  return `${prefix}-${String(nextNum).padStart(4, '0')}`;
}

// ─── GET /api/tenant/patients ─────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { patientId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        patients,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  })
);

// ─── GET /api/tenant/patients/:id ─────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const patient = await prisma.patient.findFirst({
      where: { id, tenantId: req.user!.tenantId! },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, invoiceNo: true, netTotal: true, paymentStatus: true, date: true },
        },
      },
    });

    if (!patient) throw createError('Patient not found', 404);

    res.json({ success: true, data: { patient } });
  })
);

// ─── POST /api/tenant/patients ────────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = patientSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const tenantId = req.user!.tenantId!;
    const patientId = await generatePatientId(tenantId);

    const patient = await prisma.patient.create({
      data: { ...parsed.data, tenantId, patientId },
    });

    res.status(201).json({ success: true, message: 'Patient registered', data: { patient } });
  })
);

// ─── PUT /api/tenant/patients/:id ─────────────────────────────
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const id     = req.params['id'] as string;
    const parsed = patientSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0].message, 400);
    }

    const tenantId = req.user!.tenantId!;
    const existing = await prisma.patient.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Patient not found', 404);

    const updated = await prisma.patient.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ success: true, message: 'Patient updated', data: { patient: updated } });
  })
);

// ─── DELETE /api/tenant/patients/:id ─────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const id       = req.params['id'] as string;
    const tenantId = req.user!.tenantId!;
    const existing = await prisma.patient.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Patient not found', 404);

    await prisma.patient.delete({ where: { id } });

    res.json({ success: true, message: 'Patient deleted' });
  })
);

export default router;
