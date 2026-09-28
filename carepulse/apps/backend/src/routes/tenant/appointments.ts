import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Auto Appointment Number ──────────────────────────────────
async function generateAppointmentNo(tenantId: string): Promise<string> {
  const last = await prisma.appointment.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { appointmentNo: true },
  });
  let nextNum = 1;
  if (last) {
    const match = last.appointmentNo.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  return `APT-${String(nextNum).padStart(5, '0')}`;
}

// ─── Validation ───────────────────────────────────────────────
const appointmentSchema = z.object({
  patientId:       z.string().uuid(),
  doctorId:        z.string().uuid(),
  chamberId:       z.string().uuid().optional().nullable(),
  appointmentDate: z.string().min(1),
  appointmentTime: z.string().optional(),
  type:            z.enum(['New', 'Follow-up', 'Emergency']).default('New'),
  fee:             z.number().min(0).default(0),
  paid:            z.number().min(0).default(0),
  paymentMethod:   z.string().optional(),
  notes:           z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['Scheduled', 'Confirmed', 'Waiting', 'Completed', 'Cancelled', 'No-show']),
});

// ─── GET /api/tenant/appointments ────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, status, doctorId, date, page = '1', limit = '20' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(status   && { status }),
      ...(doctorId && { doctorId }),
      ...(date     && { appointmentDate: new Date(date) }),
      ...(search   && {
        OR: [
          { appointmentNo: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take: limitNum,
        orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'asc' }],
        include: {
          patient: { select: { id: true, name: true, phone: true, patientId: true } },
          doctor:  { select: { id: true, name: true, specialty: true } },
          chamber: { select: { id: true, name: true, roomNo: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: { appointments, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// ─── GET /api/tenant/appointments/:id ────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const appt = await prisma.appointment.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: {
        patient: true,
        doctor:  true,
        chamber: true,
        creator: { select: { id: true, name: true } },
      },
    });
    if (!appt) throw createError('Appointment not found', 404);
    res.json({ success: true, data: { appointment: appt } });
  })
);

// ─── POST /api/tenant/appointments ───────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;

    // Verify patient & doctor belong to tenant
    const [patient, doctor] = await Promise.all([
      prisma.patient.findFirst({ where: { id: parsed.data.patientId, tenantId } }),
      prisma.doctor.findFirst({ where: { id: parsed.data.doctorId, tenantId } }),
    ]);
    if (!patient) throw createError('Patient not found', 404);
    if (!doctor)  throw createError('Doctor not found', 404);

    const appointmentNo = await generateAppointmentNo(tenantId);
    const due = Math.max(0, parsed.data.fee - parsed.data.paid);

    const appointment = await prisma.appointment.create({
      data: {
        ...parsed.data,
        tenantId,
        appointmentNo,
        appointmentDate: new Date(parsed.data.appointmentDate),
        status:    'Scheduled',
        createdBy: req.user!.userId,
      },
    });
    res.status(201).json({ success: true, message: 'Appointment created', data: { appointment } });
  })
);

// ─── PATCH /api/tenant/appointments/:id/status ───────────────
router.patch(
  '/:id/status',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST', 'DOCTOR']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const existing = await prisma.appointment.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Appointment not found', 404);

    const appt = await prisma.appointment.update({ where: { id }, data: { status: parsed.data.status } });
    res.json({ success: true, message: 'Status updated', data: { appointment: appt } });
  })
);

// ─── PUT /api/tenant/appointments/:id ────────────────────────
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'RECEPTIONIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = appointmentSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.appointment.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Appointment not found', 404);

    const updateData = {
      ...parsed.data,
      ...(parsed.data.appointmentDate && { appointmentDate: new Date(parsed.data.appointmentDate) }),
    };
    const appt = await prisma.appointment.update({ where: { id }, data: updateData });
    res.json({ success: true, message: 'Appointment updated', data: { appointment: appt } });
  })
);

// ─── DELETE /api/tenant/appointments/:id ─────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.appointment.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Appointment not found', 404);
    await prisma.appointment.delete({ where: { id } });
    res.json({ success: true, message: 'Appointment deleted' });
  })
);

export default router;
