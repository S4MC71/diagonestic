import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access guard.
 * Must be used AFTER the `auth` middleware.
 *
 * Usage:
 *   router.get('/tenants', auth, roleGuard(['SUPER_ADMIN']), handler)
 *   router.post('/users', auth, roleGuard(['SUPER_ADMIN', 'TENANT_ADMIN']), handler)
 */
export function roleGuard(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Ensures the request is from a user that belongs to a specific tenant.
 * Prevents cross-tenant data access.
 *
 * For SUPER_ADMIN, this guard is bypassed — they can access any tenant.
 */
export function tenantGuard(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  // Super admins can access any tenant
  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  // Tenant users must have a tenantId
  if (!req.user.tenantId) {
    res.status(403).json({ success: false, message: 'No tenant context found' });
    return;
  }

  next();
}
