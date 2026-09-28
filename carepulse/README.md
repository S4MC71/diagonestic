# CarePulse — SaaS Backend + SuperAdmin Panel

## Project Structure
```
carepulse/
├── apps/
│   ├── backend/          ← Node.js + Express + Prisma API  (port 4000)
│   └── superadmin/       ← React + Vite SuperAdmin Panel    (port 5174)
└── package.json          ← npm workspaces root
```

---

## 🚀 Quick Start

### Step 1 — Setup Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Connection String** (Session mode, port 5432)

### Step 2 — Backend Setup
```bash
cd apps/backend

# Copy env file and fill in values
copy .env.example .env
# Edit .env — add DATABASE_URL and JWT secrets

# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed initial data (plans + superadmin user)
npx ts-node prisma/seed.ts

# Start dev server
npm run dev
# → API running at http://localhost:4000
```

### Step 3 — SuperAdmin Frontend
```bash
cd apps/superadmin

# Copy env file
copy .env.example .env
# Set VITE_API_URL=http://localhost:4000

# Start dev server
npm run dev
# → SuperAdmin panel at http://localhost:5174
```

### Step 4 — Login
- URL: `http://localhost:5174`
- Username: `superadmin`
- Password: `CarePulse@2025!` ← **change this after first login!**

---

## 📡 API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (any role) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### SuperAdmin — Tenants
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/superadmin/tenants` | List all tenants |
| GET | `/api/superadmin/tenants/:id` | Tenant detail |
| POST | `/api/superadmin/tenants` | Create tenant |
| PATCH | `/api/superadmin/tenants/:id/status` | Update status |
| PATCH | `/api/superadmin/tenants/:id/modules` | Toggle module |
| POST | `/api/superadmin/tenants/:id/assign-plan` | Assign plan |
| DELETE | `/api/superadmin/tenants/:id` | Delete tenant |

### SuperAdmin — Plans
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/superadmin/plans` | List plans |
| POST | `/api/superadmin/plans` | Create plan |
| PUT | `/api/superadmin/plans/:id` | Update plan |
| DELETE | `/api/superadmin/plans/:id` | Delete plan |

### Tenant — Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenant/users` | List tenant users |
| POST | `/api/tenant/users` | Create user |
| PATCH | `/api/tenant/users/:id` | Update user |
| DELETE | `/api/tenant/users/:id` | Delete user |

### Tenant — Modules
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenant/modules` | Get enabled modules |

### Tenant — Patients
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenant/patients` | List patients |
| GET | `/api/tenant/patients/:id` | Patient detail |
| POST | `/api/tenant/patients` | Create patient |
| PUT | `/api/tenant/patients/:id` | Update patient |
| DELETE | `/api/tenant/patients/:id` | Delete patient |

---

## 🔐 Roles & Access

| Role | Can Access |
|------|-----------|
| `SUPER_ADMIN` | Everything — all tenants, all APIs |
| `TENANT_ADMIN` | Own tenant — all modules, user management |
| `CENTER_MANAGER` | Tenant data — read-only admin functions |
| `RECEPTIONIST` | Patients, Invoices, Appointments, Samples |
| `LAB_TECHNICIAN` | Samples, Lab Reports |
| `DOCTOR` | Prescriptions, own Appointments |
| `PHARMACIST` | Pharmacy POS, stock |
| `ACCOUNTANT` | Finance, Accounting, Commissions |
| `PHLEBOTOMIST` | Sample collection |

---

## 📦 Modules

| Key | Label |
|-----|-------|
| `patients` | Patient management |
| `clinical` | Prescriptions, Doctors, Chambers, Appointments |
| `lab` | Investigations, Samples, Lab Reports |
| `pharmacy` | Medicine stock, POS, Purchases |
| `home_collection` | Home sample collection |
| `send_out` | Send-out lab vendors |
| `finance` | Invoices, Payments |
| `commissions` | Doctor referral commissions |
| `inventory` | Non-medicine stock |
| `accounting` | Income/expense accounting |
| `recall` | Patient recall reminders |
| `whatsapp` | WhatsApp notifications |

---

## 🔜 Next Steps (APIs to build)
- [ ] `/api/tenant/doctors` — Doctors CRUD
- [ ] `/api/tenant/invoices` — Invoice creation + payments
- [ ] `/api/tenant/tests` — Diagnostic tests CRUD
- [ ] `/api/tenant/samples` — Sample lifecycle
- [ ] `/api/tenant/lab-reports` — Report entry + verify
- [ ] `/api/tenant/pharmacy/*` — Pharmacy POS + stock
- [ ] `/api/tenant/settings` — Tenant settings GET/PATCH
- [ ] `/api/tenant/appointments` — Appointment management
