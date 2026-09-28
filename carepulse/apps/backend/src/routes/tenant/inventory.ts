import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Auto Item Code ───────────────────────────────────────────
async function generateItemCode(tenantId: string): Promise<string> {
  const last = await prisma.inventoryItem.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { code: true },
  });
  let nextNum = 1;
  if (last) {
    const match = last.code.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  return `INV-${String(nextNum).padStart(4, '0')}`;
}

// ─── Validation ───────────────────────────────────────────────
const itemSchema = z.object({
  name:         z.string().min(1),
  category:     z.string().min(1),
  unit:         z.string().default('pcs'),
  stockQty:     z.number().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(5),
  unitCost:     z.number().min(0).default(0),
  location:     z.string().optional(),
  supplier:     z.string().optional(),
  notes:        z.string().optional(),
  isActive:     z.boolean().default(true),
});

const stockSchema = z.object({
  type:     z.enum(['IN', 'OUT']),
  qty:      z.number().positive(),
  reason:   z.string().optional(),
  refNo:    z.string().optional(),
});

// ─── GET /api/tenant/inventory ────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, category, isActive, lowStock, page = '1', limit = '50' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { name:     { contains: search, mode: 'insensitive' as const } },
          { code:     { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({ where, skip, take: limitNum, orderBy: { name: 'asc' } }),
      prisma.inventoryItem.count({ where }),
    ]);

    const result = lowStock === 'true'
      ? items.filter((i) => i.stockQty <= i.reorderLevel)
      : items;

    res.json({
      success: true,
      data: { items: result, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// ─── GET /api/tenant/inventory/categories ────────────────────
router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const categories = await prisma.inventoryItem.findMany({
      where: { tenantId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    res.json({ success: true, data: { categories: categories.map((c) => c.category) } });
  })
);

// ─── GET /api/tenant/inventory/:id ───────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const item = await prisma.inventoryItem.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!item) throw createError('Inventory item not found', 404);
    res.json({ success: true, data: { item } });
  })
);

// ─── POST /api/tenant/inventory ──────────────────────────────
router.post(
  '/',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'STORE_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = itemSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const code     = await generateItemCode(tenantId);

    const item = await prisma.inventoryItem.create({
      data: { ...parsed.data, tenantId, code },
    });
    res.status(201).json({ success: true, message: 'Item created', data: { item } });
  })
);

// ─── PUT /api/tenant/inventory/:id ───────────────────────────
router.put(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'STORE_MANAGER']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = itemSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Inventory item not found', 404);

    const item = await prisma.inventoryItem.update({ where: { id }, data: parsed.data });
    res.json({ success: true, message: 'Item updated', data: { item } });
  })
);

// ─── PATCH /api/tenant/inventory/:id/stock ───────────────────
router.patch(
  '/:id/stock',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'STORE_MANAGER', 'LAB_TECHNICIAN']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = stockSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Inventory item not found', 404);

    if (parsed.data.type === 'OUT' && existing.stockQty < parsed.data.qty) {
      throw createError(`Insufficient stock. Available: ${existing.stockQty}`, 400);
    }

    const delta    = parsed.data.type === 'IN' ? parsed.data.qty : -parsed.data.qty;
    const newStock = existing.stockQty + delta;

    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryItem.update({
        where: { id },
        data:  { stockQty: newStock },
      });
      await tx.inventoryTransaction.create({
        data: {
          tenantId,
          itemId:    id,
          type:      parsed.data.type,
          qty:       parsed.data.qty,
          stockBefore: existing.stockQty,
          stockAfter:  newStock,
          reason:    parsed.data.reason ?? null,
          refNo:     parsed.data.refNo ?? null,
          createdBy: req.user!.userId,
        },
      });
      return updated;
    });

    res.json({ success: true, message: `Stock ${parsed.data.type === 'IN' ? 'added' : 'deducted'}`, data: { item } });
  })
);

// ─── DELETE /api/tenant/inventory/:id ────────────────────────
router.delete(
  '/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Inventory item not found', 404);
    await prisma.inventoryItem.delete({ where: { id } });
    res.json({ success: true, message: 'Item deleted' });
  })
);

export default router;
