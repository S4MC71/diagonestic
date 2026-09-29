import path from 'path';
import dotenv from 'dotenv';
// __dirname = apps/backend/src → ../.env = apps/backend/.env ✓
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';

// Routes
import authRouter from './routes/auth';
import superAdminTenantsRouter from './routes/superadmin/tenants';
import superAdminPlansRouter from './routes/superadmin/plans';
import superAdminModulesRouter from './routes/superadmin/modules';
import superAdminAdminsRouter from './routes/superadmin/admins';
import tenantUsersRouter from './routes/tenant/users';
import tenantModulesRouter from './routes/tenant/modules';
import tenantPatientsRouter from './routes/tenant/patients';
import tenantTestsRouter from './routes/tenant/tests';
import tenantDoctorsRouter from './routes/tenant/doctors';
import tenantInvoicesRouter from './routes/tenant/invoices';
import tenantSamplesRouter from './routes/tenant/samples';
import tenantReportsRouter from './routes/tenant/reports';
import tenantAppointmentsRouter from './routes/tenant/appointments';
import tenantPharmacyRouter from './routes/tenant/pharmacy';
import tenantAccountingRouter from './routes/tenant/accounting';
import tenantInventoryRouter from './routes/tenant/inventory';
import tenantStaffRouter from './routes/tenant/staff';
import tenantWebsiteRouter from './routes/tenant/website';
import tenantSmsRouter from './routes/tenant/sms';
import publicRouter from './routes/public';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

// ─── Core Middleware ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── CORS ─────────────────────────────────────────────────────
const isDev = (process.env.NODE_ENV ?? 'development') === 'development';

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ??
  'http://localhost:5173,http://localhost:5174,http://localhost:3000'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      // In development: allow all localhost and local network origins
      if (isDev) {
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isLanIp     = /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin);
        const is172       = /^https?:\/\/172\.\d+\.\d+\.\d+(:\d+)?$/.test(origin);
        const is10        = /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin);
        if (isLocalhost || isLanIp || is172 || is10) return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin "${origin}" not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// Public Unauthenticated
app.use('/api/public',              publicRouter);

// SuperAdmin
app.use('/api/superadmin/tenants', superAdminTenantsRouter);
app.use('/api/superadmin/plans', superAdminPlansRouter);
app.use('/api/superadmin/modules', superAdminModulesRouter);
app.use('/api/superadmin/admins', superAdminAdminsRouter);

// Tenant
app.use('/api/tenant/users',        tenantUsersRouter);
app.use('/api/tenant/modules',      tenantModulesRouter);
app.use('/api/tenant/patients',     tenantPatientsRouter);
app.use('/api/tenant/tests',        tenantTestsRouter);
app.use('/api/tenant/doctors',      tenantDoctorsRouter);
app.use('/api/tenant/invoices',     tenantInvoicesRouter);
app.use('/api/tenant/samples',      tenantSamplesRouter);
app.use('/api/tenant/reports',      tenantReportsRouter);
app.use('/api/tenant/appointments', tenantAppointmentsRouter);
app.use('/api/tenant/pharmacy',     tenantPharmacyRouter);
app.use('/api/tenant/accounting',   tenantAccountingRouter);
app.use('/api/tenant/inventory',    tenantInventoryRouter);
app.use('/api/tenant/staff',        tenantStaffRouter);
app.use('/api/tenant/website',      tenantWebsiteRouter);
app.use('/api/tenant/sms',          tenantSmsRouter);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CarePulse API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}\n`);
});

export default app;
