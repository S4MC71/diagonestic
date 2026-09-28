import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Validation ───────────────────────────────────────────────
const txnSchema = z.object({
  date:          z.string().optional(),
  type:          z.enum(['INCOME', 'EXPENSE']),
  category:      z.string().min(1),
  amount:        z.number().positive(),
  description:   z.string().min(1),
  paymentMethod: z.string().optional(),
  reference:     z.string().optional(),
});

// ─── GET /api/tenant/accounting ──────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { type, category, dateFrom, dateTo, search, page = '1', limit = '20' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(type     && { type }),
      ...(category && { category }),
      ...((dateFrom || dateTo) && {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo   && { lte: new Date(dateTo) }),
        },
      }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' as const } },
          { category:    { contains: search, mode: 'insensitive' as const } },
          { reference:   { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.accountingTransaction.findMany({
        where, skip, take: limitNum,
        orderBy: { date: 'desc' },
        include: { creator: { select: { id: true, name: true } } },
      }),
      prisma.accountingTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: { transactions, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// ─── GET /api/tenant/accounting/summary ──────────────────────
router.get(
  '/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { dateFrom, dateTo } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { tenantId };
    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo   && { lte: new Date(dateTo) }),
      };
    }

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.accountingTransaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum:  { amount: true },
        _count: true,
      }),
      prisma.accountingTransaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum:  { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome  = Number(incomeResult._sum.amount  ?? 0);
    const totalExpense = Number(expenseResult._sum.amount ?? 0);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance:    totalIncome - totalExpense,
        incomeCount:   incomeResult._count,
        expenseCount:  expenseResult._count,
      },
    });
  })
);

// ─── GET /api/tenant/accounting/:id ──────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const txn = await prisma.accountingTransaction.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: { creator: { select: { id: true, name: true } } },
    });
    if (!txn) throw createError('Transaction not found', 404);
    res.json({ success: true, data: { transaction: txn } });
  })
);

// ─── POST /api/tenant/accounting ─────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'ACCOUNTANT']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = txnSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const txn = await prisma.accountingTransaction.create({
      data: {
        ...parsed.data,
        tenantId:  req.user!.tenantId!,
        date:      parsed.data.date ? new Date(parsed.data.date) : new Date(),
        createdBy: req.user!.userId,
      },
    });
    res.status(201).json({ success: true, message: 'Transaction recorded', data: { transaction: txn } });
  })
);

// ─── PUT /api/tenant/accounting/:id ──────────────────────────
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'ACCOUNTANT']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = txnSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.accountingTransaction.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Transaction not found', 404);

    const txn = await prisma.accountingTransaction.update({
      where: { id },
      data:  { ...parsed.data, ...(parsed.data.date && { date: new Date(parsed.data.date) }) },
    });
    res.json({ success: true, message: 'Transaction updated', data: { transaction: txn } });
  })
);

// ─── DELETE /api/tenant/accounting/:id ───────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.accountingTransaction.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Transaction not found', 404);
    await prisma.accountingTransaction.delete({ where: { id } });
    res.json({ success: true, message: 'Transaction deleted' });
  })
);

export default router;
