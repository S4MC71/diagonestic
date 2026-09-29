import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler, createError } from '../../middleware/errorHandler';
import { auth } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/roleGuard';

const router = Router();
router.use(auth, tenantGuard);

interface WebsiteCMSStore {
  tenantId: string;
  isPublished: boolean;
  acceptBookings: boolean;
  theme: string;
  primaryColor: string;
  accentColor: string;
  primaryLanguage: 'en' | 'bn';
  logoUrl?: string;
  heroImageUrl?: string;
  tagline?: string;
  aboutText?: string;
  metaTitle?: string;
  metaDescription?: string;
  facebookUrl?: string;
  googleBusinessUrl?: string;
  customDomain?: string;
  announcement?: string;
  announcementType?: 'info' | 'warning' | 'success';
  showTestPrices?: boolean;
  showConsultationFees?: boolean;
}

interface BookingRequestStore {
  id: string;
  tenantId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  bookingType: 'appointment' | 'test';
  doctorId?: string;
  doctorName?: string;
  requestedTests?: string[];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  status: 'NEW' | 'CONFIRMED' | 'CANCELLED';
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
}

const websiteCache: Map<string, WebsiteCMSStore> = new Map();
const bookingCache: Map<string, BookingRequestStore[]> = new Map();

function getTenantWebsiteConfig(tenantId: string): WebsiteCMSStore {
  if (!websiteCache.has(tenantId)) {
    websiteCache.set(tenantId, {
      tenantId,
      isPublished: true,
      acceptBookings: true,
      theme: 'emerald-clean',
      primaryColor: '#059669',
      accentColor: '#10b981',
      primaryLanguage: 'en',
      tagline: 'Modern Diagnostic Care & Specialist Doctor Chambers',
      aboutText:
        'Serving patients with 100% digital automated reports, ISO-standard laboratory diagnostics, and renowned specialist physicians.',
      metaTitle: 'CarePulse Diagnostic & Consultation Center',
      metaDescription: 'Book doctor appointments and online pathology tests in Bangladesh.',
      announcement: 'Special 15% discount on Complete Health Checkup packages this month!',
      announcementType: 'info',
      showTestPrices: true,
      showConsultationFees: true,
      facebookUrl: 'https://facebook.com/carepulse.bd',
      googleBusinessUrl: 'https://g.page/carepulse-bd',
    });
  }
  return websiteCache.get(tenantId)!;
}

function getTenantBookings(tenantId: string): BookingRequestStore[] {
  if (!bookingCache.has(tenantId)) {
    bookingCache.set(tenantId, [
      {
        id: 'pbr-001',
        tenantId,
        patientName: 'Kazi Mahbubur Rahman',
        patientPhone: '01712-334455',
        patientAge: 42,
        patientGender: 'Male',
        bookingType: 'appointment',
        doctorId: 'doc-1',
        doctorName: 'Prof. Dr. M. A. Rahman',
        preferredDate: '2026-10-02',
        preferredTime: '06:00 PM',
        notes: 'Follow-up for chronic hypertension checkup.',
        status: 'NEW',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'pbr-002',
        tenantId,
        patientName: 'Shahana Akter',
        patientPhone: '01819-887766',
        patientAge: 32,
        patientGender: 'Female',
        bookingType: 'test',
        requestedTests: ['Complete Blood Count (CBC)', 'Lipid Profile', 'HbA1c'],
        preferredDate: '2026-10-01',
        preferredTime: '09:00 AM',
        notes: 'Fasting test. Morning home collection preferred if available.',
        status: 'NEW',
        createdAt: new Date().toISOString(),
      }
    ]);
  }
  return bookingCache.get(tenantId)!;
}

// ─── GET /api/tenant/website ──────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const config = getTenantWebsiteConfig(tenantId);
    res.json({ success: true, data: config });
  })
);

// ─── PUT /api/tenant/website ──────────────────────────────────
router.put(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const current = getTenantWebsiteConfig(tenantId);
    const updated = { ...current, ...req.body, tenantId };
    websiteCache.set(tenantId, updated);
    res.json({ success: true, data: updated });
  })
);

// ─── GET /api/tenant/website/bookings ─────────────────────────
router.get(
  '/bookings',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const bookings = getTenantBookings(tenantId);
    res.json({ success: true, data: bookings });
  })
);

// ─── PATCH /api/tenant/website/bookings/:id/confirm ───────────
router.patch(
  '/bookings/:id/confirm',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { id } = req.params;
    const bookings = getTenantBookings(tenantId);
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      throw createError('Booking request not found', 404);
    }

    bookings[index].status = 'CONFIRMED';
    bookings[index].confirmedBy = req.user?.userId || 'Reception Staff';
    bookings[index].confirmedAt = new Date().toISOString();

    res.json({ success: true, data: bookings[index] });
  })
);

// ─── PATCH /api/tenant/website/bookings/:id/cancel ────────────
router.patch(
  '/bookings/:id/cancel',
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId!;
    const { id } = req.params;
    const bookings = getTenantBookings(tenantId);
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      throw createError('Booking request not found', 404);
    }

    bookings[index].status = 'CANCELLED';
    res.json({ success: true, data: bookings[index] });
  })
);

export default router;
