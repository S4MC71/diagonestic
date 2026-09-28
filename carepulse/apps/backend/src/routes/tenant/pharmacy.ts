import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard, roleGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

// ─── Auto Sale Number ─────────────────────────────────────────
async function generateSaleNo(tenantId: string): Promise<string> {
  const last = await prisma.pharmacySale.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { saleNo: true },
  });
  let nextNum = 1;
  if (last) {
    const match = last.saleNo.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  return `PH-${String(nextNum).padStart(5, '0')}`;
}

// ─── Validation ───────────────────────────────────────────────
const productSchema = z.object({
  code:          z.string().min(1),
  name:          z.string().min(1),
  genericName:   z.string().optional(),
  manufacturer:  z.string().optional(),
  unit:          z.string().default('pcs'),
  packSize:      z.number().int().min(1).default(1),
  purchasePrice: z.number().min(0).default(0),
  salePrice:     z.number().min(0).default(0),
  stockQty:      z.number().min(0).default(0),
  reorderLevel:  z.number().int().min(0).default(10),
  rackLocation:  z.string().optional(),
  expiryDate:    z.string().optional().nullable(),
  isActive:      z.boolean().default(true),
});

const saleItemSchema = z.object({
  productId:   z.string().uuid(),
  productName: z.string().min(1),
  qty:         z.number().positive(),
  unitPrice:   z.number().min(0),
  discount:    z.number().min(0).default(0),
  netPrice:    z.number().min(0),
});

const saleSchema = z.object({
  invoiceId:     z.string().uuid().optional().nullable(),
  patientId:     z.string().uuid().optional().nullable(),
  items:         z.array(saleItemSchema).min(1),
  discount:      z.number().min(0).default(0),
  paid:          z.number().min(0).default(0),
  paymentMethod: z.string().optional(),
});

// ═══════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════

// GET /api/tenant/pharmacy/products
router.get(
  '/products',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, isActive, lowStock, page = '1', limit = '50' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      tenantId,
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' as const } },
          { code:        { contains: search, mode: 'insensitive' as const } },
          { genericName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.pharmacyProduct.findMany({ where, skip, take: limitNum, orderBy: { name: 'asc' } }),
      prisma.pharmacyProduct.count({ where }),
    ]);

    // Filter low stock after fetch (Prisma doesn't support column comparison in where easily)
    const result = lowStock === 'true'
      ? products.filter((p) => Number(p.stockQty) <= p.reorderLevel)
      : products;

    res.json({
      success: true,
      data: { products: result, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// GET /api/tenant/pharmacy/products/:id
router.get(
  '/products/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const product = await prisma.pharmacyProduct.findFirst({
      where: { id: req.params['id'] as string, tenantId: req.user!.tenantId! },
    });
    if (!product) throw createError('Product not found', 404);
    res.json({ success: true, data: { product } });
  })
);

// POST /api/tenant/pharmacy/products
router.post(
  '/products',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'PHARMACIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const existing = await prisma.pharmacyProduct.findFirst({ where: { tenantId, code: parsed.data.code } });
    if (existing) throw createError(`Product code "${parsed.data.code}" already exists`, 409);

    const data = {
      ...parsed.data,
      tenantId,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
    };
    const product = await prisma.pharmacyProduct.create({ data });
    res.status(201).json({ success: true, message: 'Product created', data: { product } });
  })
);

// PUT /api/tenant/pharmacy/products/:id
router.put(
  '/products/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'PHARMACIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;

    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const existing = await prisma.pharmacyProduct.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Product not found', 404);

    const data = {
      ...parsed.data,
      ...(parsed.data.expiryDate !== undefined && {
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      }),
    };
    const product = await prisma.pharmacyProduct.update({ where: { id }, data });
    res.json({ success: true, message: 'Product updated', data: { product } });
  })
);

// DELETE /api/tenant/pharmacy/products/:id
router.delete(
  '/products/:id',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const id       = req.params['id'] as string;
    const existing = await prisma.pharmacyProduct.findFirst({ where: { id, tenantId } });
    if (!existing) throw createError('Product not found', 404);
    await prisma.pharmacyProduct.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  })
);

// ═══════════════════════════════════════════════
// SALES
// ═══════════════════════════════════════════════

// GET /api/tenant/pharmacy/sales
router.get(
  '/sales',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { search, dateFrom, dateTo, page = '1', limit = '20' } =
      req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { tenantId };
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo   && { lte: new Date(dateTo + 'T23:59:59') }),
      };
    }
    if (search) where.saleNo = { contains: search, mode: 'insensitive' };

    const [sales, total] = await Promise.all([
      prisma.pharmacySale.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.pharmacySale.count({ where }),
    ]);

    res.json({
      success: true,
      data: { sales, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } },
    });
  })
);

// POST /api/tenant/pharmacy/sales
router.post(
  '/sales',
  roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN', 'CENTER_MANAGER', 'PHARMACIST', 'RECEPTIONIST']),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = saleSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);

    const tenantId = req.user!.tenantId!;
    const { items, discount, paid, paymentMethod, invoiceId, patientId } = parsed.data;

    const grossTotal = items.reduce((sum, i) => sum + i.netPrice, 0);
    const netTotal   = grossTotal - discount;
    const due        = Math.max(0, netTotal - paid);
    const saleNo     = await generateSaleNo(tenantId);

    const sale = await prisma.$transaction(async (tx) => {
      // Deduct stock for each product
      for (const item of items) {
        const product = await tx.pharmacyProduct.findFirst({ where: { id: item.productId, tenantId } });
        if (!product) throw createError(`Product ${item.productId} not found`, 404);
        if (Number(product.stockQty) < item.qty) {
          throw createError(`Insufficient stock for "${product.name}"`, 400);
        }
        await tx.pharmacyProduct.update({
          where: { id: item.productId },
          data:  { stockQty: { decrement: item.qty } },
        });
      }

      return tx.pharmacySale.create({
        data: {
          tenantId, saleNo,
          invoiceId: invoiceId ?? null,
          patientId: patientId ?? null,
          items,
          grossTotal, discount, netTotal, paid, due,
          paymentMethod: paymentMethod ?? null,
          soldBy: req.user!.userId,
        },
      });
    });

    res.status(201).json({ success: true, message: 'Sale recorded', data: { sale } });
  })
);

export default router;
