import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// ─── GET /api/public/report/:token ────────────────────────────
// Publicly accessible for patients who receive report link via SMS
router.get(
  '/report/:token',
  asyncHandler(async (req: Request, res: Response) => {
    const token = String(req.params.token);
    const { phonePin } = req.query as { phonePin?: string };

    // In a live system, this looks up by shareToken or reportId
    // Return sample verified diagnostic report structure
    const reportData = {
      token,
      reportNo: `RPT-2026-${token.slice(-4).toUpperCase()}`,
      invoiceNo: `INV-2026-${token.slice(-4).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'VERIFIED',
      centerName: 'CarePulse Diagnostic Center',
      centerAddress: 'House #12, Road #4, Dhanmondi, Dhaka-1205',
      centerPhone: '01700-000000',
      patient: {
        name: 'Mrs. Rashida Begum',
        age: 38,
        gender: 'Female',
        phoneLast4: '3344',
      },
      doctor: {
        name: 'Prof. Dr. M. A. Rahman',
        designation: 'Consultant Pathologist',
        degrees: 'MBBS, M.Phil (Pathology)',
      },
      technologist: {
        name: 'Farzana Parvin',
        degrees: 'B.Sc in Medical Laboratory Technology',
      },
      investigation: {
        name: 'Complete Blood Count (CBC) with ESR',
        specimen: 'EDTA Whole Blood',
        results: [
          { parameter: 'Hemoglobin (Hb%)', observed: '13.5', refRange: '12.0 - 16.0', unit: 'g/dL', isAbnormal: false },
          { parameter: 'Total WBC Count', observed: '7,800', refRange: '4,000 - 11,000', unit: '/cu.mm', isAbnormal: false },
          { parameter: 'Platelet Count', observed: '260,000', refRange: '150,000 - 450,000', unit: '/cu.mm', isAbnormal: false },
          { parameter: 'ESR (Westergren)', observed: '12', refRange: '0 - 20', unit: 'mm in 1st hr', isAbnormal: false },
        ],
        remarks: 'All analyzed parameters are within biological reference intervals for age and sex.'
      }
    };

    res.json({ success: true, data: reportData });
  })
);

// ─── POST /api/public/booking ─────────────────────────────────
// Allows patients to submit appointments or test requests from clinic website
router.post(
  '/booking',
  asyncHandler(async (req: Request, res: Response) => {
    const { tenantSlug, patientName, patientPhone, bookingType, doctorId, requestedTests, preferredDate, preferredTime, notes } = req.body;

    if (!patientName || !patientPhone) {
      throw createError('Patient name and mobile number are required', 400);
    }

    const bookingRecord = {
      id: `pbr-${Date.now()}`,
      tenantSlug: tenantSlug || 'default',
      patientName,
      patientPhone,
      bookingType: bookingType || 'appointment',
      doctorId,
      requestedTests: requestedTests || [],
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: preferredTime || '10:00 AM',
      notes,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Booking request received successfully. Our reception will contact you shortly.',
      data: bookingRecord,
    });
  })
);

export default router;
