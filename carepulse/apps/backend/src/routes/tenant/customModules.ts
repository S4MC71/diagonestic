import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/roleGuard';

const router = Router();

// Secure all endpoints with authentication and tenant isolation
router.use(auth, tenantGuard);

interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'status';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

interface ModuleSchema {
  fields: FieldDefinition[];
  tableColumns: string[];
}

// Helper to generate next record ID for a tenant module: e.g. RAD-0001, BLOOD-0001
async function generateRecordId(tenantId: string, moduleKey: string): Promise<string> {
  const prefix = moduleKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'REC';
  
  const count = await prisma.tenantCustomRecord.count({
    where: { tenantId, moduleKey },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * GET /api/tenant/custom-modules/:moduleKey/schema
 * Returns the module definition, interactive schema (fields, columns), and tenant stats
 */
router.get(
  '/:moduleKey/schema',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const moduleKey = req.params['moduleKey'] as string;

    const moduleDef = await prisma.module.findUnique({
      where: { key: moduleKey },
    });

    if (!moduleDef) {
      throw createError(`Module "${moduleKey}" does not exist`, 404);
    }

    // Verify tenant has module enabled or it is a core/active module
    const tenantMod = await prisma.tenantModule.findUnique({
      where: {
        tenantId_moduleKey: {
          tenantId,
          moduleKey,
        },
      },
    });

    // Parse schema safely
    let schema: ModuleSchema = { fields: [], tableColumns: [] };
    if (moduleDef.schema && typeof moduleDef.schema === 'object') {
      const parsed = moduleDef.schema as any;
      schema = {
        fields: Array.isArray(parsed.fields) ? parsed.fields : [],
        tableColumns: Array.isArray(parsed.tableColumns) ? parsed.tableColumns : [],
      };
    }

    const totalRecords = await prisma.tenantCustomRecord.count({
      where: { tenantId, moduleKey },
    });

    res.json({
      success: true,
      data: {
        module: {
          key: moduleDef.key,
          label: moduleDef.label,
          description: moduleDef.description,
          icon: moduleDef.icon,
          category: moduleDef.category,
          isActive: moduleDef.isActive,
          isEnabledForTenant: tenantMod ? tenantMod.isEnabled : true,
        },
        schema,
        stats: {
          totalRecords,
        },
      },
    });
  })
);

/**
 * GET /api/tenant/custom-modules/:moduleKey/records
 * Returns paginated, searchable records for the tenant & module
 */
router.get(
  '/:moduleKey/records',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const moduleKey = req.params['moduleKey'] as string;
    const { search, status, page = '1', limit = '25' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      tenantId,
      moduleKey,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { recordId: { contains: s, mode: 'insensitive' } },
        { title: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.tenantCustomRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.tenantCustomRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        records,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

/**
 * POST /api/tenant/custom-modules/:moduleKey/records
 * Create a new record with custom fields data
 */
router.post(
  '/:moduleKey/records',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const moduleKey = req.params['moduleKey'] as string;
    const { title, status = 'Active', data = {} } = req.body;

    const moduleDef = await prisma.module.findUnique({
      where: { key: moduleKey },
    });

    if (!moduleDef) {
      throw createError(`Module "${moduleKey}" not found`, 404);
    }

    // Auto generate clean human readable ID
    const recordId = await generateRecordId(tenantId, moduleKey);

    // Compute title if not explicitly provided
    let computedTitle = typeof title === 'string' && title.trim() ? title.trim() : '';
    if (!computedTitle && typeof data === 'object' && data !== null) {
      // Find first non-empty text value in data
      for (const val of Object.values(data)) {
        if (typeof val === 'string' && val.trim().length > 0) {
          computedTitle = val.trim();
          break;
        }
      }
    }
    if (!computedTitle) {
      computedTitle = `${moduleDef.label} Entry #${recordId}`;
    }

    const newRecord = await prisma.tenantCustomRecord.create({
      data: {
        tenantId,
        moduleKey,
        recordId,
        title: computedTitle,
        status: typeof status === 'string' ? status : 'Active',
        data: data && typeof data === 'object' ? data : {},
        createdBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: { record: newRecord },
    });
  })
);

/**
 * PATCH /api/tenant/custom-modules/:moduleKey/records/:id
 * Update an existing record
 */
router.patch(
  '/:moduleKey/records/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const moduleKey = req.params['moduleKey'] as string;
    const id = req.params['id'] as string;
    const { title, status, data } = req.body;

    const existing = await prisma.tenantCustomRecord.findFirst({
      where: { id, tenantId, moduleKey },
    });

    if (!existing) {
      throw createError('Record not found', 404);
    }

    const updateData: any = {};
    if (typeof title === 'string' && title.trim()) updateData.title = title.trim();
    if (typeof status === 'string') updateData.status = status;
    if (data && typeof data === 'object') {
      const mergedData = {
        ...(typeof existing.data === 'object' && existing.data !== null ? (existing.data as any) : {}),
        ...data,
      };
      updateData.data = mergedData;
    }

    const updated = await prisma.tenantCustomRecord.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: { record: updated },
    });
  })
);

/**
 * DELETE /api/tenant/custom-modules/:moduleKey/records/:id
 * Delete an existing record
 */
router.delete(
  '/:moduleKey/records/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const moduleKey = req.params['moduleKey'] as string;
    const id = req.params['id'] as string;

    const existing = await prisma.tenantCustomRecord.findFirst({
      where: { id, tenantId, moduleKey },
    });

    if (!existing) {
      throw createError('Record not found', 404);
    }

    await prisma.tenantCustomRecord.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Record deleted successfully',
    });
  })
);

export default router;
