# CarePulse — Project Overview

> **ডায়াগনস্টিক সেন্টার ম্যানেজমেন্ট প্ল্যাটফর্ম**  
> Cloud-based diagnostic, pharmacy & prescription software for clinics, pathology labs, and diagnostic centers in Bangladesh.

---

## 🏗️ Tech Stack

| টেকনোলজি | ব্যবহার |
|-----------|---------|
| **React 18** | UI Framework |
| **TypeScript 5** | Type Safety |
| **Vite 6** | Build Tool & Dev Server |
| **Lucide React** | Icon Library |
| **clsx** | Conditional Class Names |
| **Vanilla CSS** | Styling (index.css) |

**Dev server চালাতে:** `npm run dev` → `http://localhost:5173`  
**Build করতে:** `npm run build`

---

## 📁 ফোল্ডার স্ট্রাকচার

```
diagonestic/
├── index.html                  ← HTML entry point, fonts (Inter, Hind Siliguri, JetBrains Mono)
├── vite.config.ts              ← Vite config, port 5173
├── tsconfig.json               ← TypeScript config
├── package.json                ← Dependencies & scripts
├── vercel.json                 ← Vercel deployment config
├── public/
│   ├── logo.svg                ← Full logo
│   └── logo-icon.svg           ← Icon-only logo
└── src/
    ├── main.tsx                ← React root render
    ├── App.tsx                 ← Root component, view router, keyboard shortcuts
    ├── index.css               ← Global styles (26KB — সব CSS এখানে)
    ├── context/
    │   └── AppContext.tsx      ← Global state (সব data + actions এখানে)
    ├── types/
    │   └── index.ts            ← সব TypeScript interfaces & types
    ├── data/
    │   └── mockData.ts         ← Demo/mock data (34KB)
    ├── utils/
    │   └── navigation.ts       ← URL ↔ View mapping, path helpers
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx     ← Left navigation sidebar
    │   │   └── Topbar.tsx      ← Top navigation bar
    │   └── print/
    │       ├── PrintModal.tsx  ← Print modal overlay
    │       ├── A4Invoice.tsx   ← A4 invoice print layout
    │       └── ThermalReceipt.tsx ← 80mm thermal receipt layout
    └── views/                  ← প্রতিটি page/screen এখানে
        ├── settings/           ← Settings sub-views
        └── [31 view files]
```

---

## 🗂️ Views (Pages) — কোনটা কোথায়

### 🔐 Auth
| View File | Route | কী করে |
|-----------|-------|--------|
| `LoginView.tsx` | `/login` | Login screen |

### 📊 Dashboard
| View File | Route | কী করে |
|-----------|-------|--------|
| `DashboardView.tsx` | `/dashboard` | Main dashboard, stats overview |

### 🏥 Clinical (চিকিৎসা)
| View File | Route | কী করে |
|-----------|-------|--------|
| `PatientsView.tsx` | `/patient` | Patient list, add/edit patient |
| `RecallView.tsx` | `/recall` | Patient recall reminders |
| `PrescriptionsView.tsx` | `/prescription` | Prescription list |
| `NewPrescriptionView.tsx` | `/prescription/new` | Prescription তৈরি করা |
| `ChambersView.tsx` | `/chamber` | Doctor chambers/rooms |
| `AppointmentsView.tsx` | `/appointment` | Appointment booking & queue |
| `DoctorsView.tsx` | `/doctor` | Doctor management |
| `PracticeView.tsx` | `/practice` | Staff practice module |
| `ActionInboxView.tsx` | `/action-inbox` | Pending actions inbox |

### 🧪 Laboratory (ল্যাব)
| View File | Route | কী করে |
|-----------|-------|--------|
| `InvestigationsView.tsx` | `/investigation` | Test management, test groups |
| `SamplesView.tsx` | `/sample` | Sample collection & tracking |
| `HomeCollectionView.tsx` | `/home-collection` | Home sample collection |
| `SendOutVendorsView.tsx` | `/sendout-vendors` | External lab vendors |
| `LabReportsView.tsx` | `/lab-reports` | Lab report entry & verification |
| `ReportTemplatesView.tsx` | `/report-templates` | Report template management |

### 💊 Pharmacy (ফার্মেসি)
| View File | Route | কী করে |
|-----------|-------|--------|
| `PharmacyViews.tsx` | `/pharmacy/*` | সব pharmacy views একটা ফাইলে |
| | `/pharmacy` | Overview |
| | `/pharmacy/pos` | Point of Sale counter |
| | `/pharmacy/sales` | Sales history |
| | `/pharmacy/products` | Medicine stock |
| | `/pharmacy/purchases` | Purchase management |
| | `/pharmacy/suppliers` | Supplier management |
| | `/pharmacy/reports` | Reports |
| `DrugsView.tsx` | `/drug` | Drug/medicine database |

### 💰 Finance (আর্থিক)
| View File | Route | কী করে |
|-----------|-------|--------|
| `InvoicesView.tsx` | `/invoice` | Invoice list |
| `NewInvoiceView.tsx` | `/invoice/new` | নতুন invoice তৈরি |
| `PaymentsView.tsx` | `/payment` | Payment tracking |
| `CommissionsView.tsx` | `/commission` | Doctor commission management |
| `AccountingView.tsx` | `/accounting` | Income/expense accounting |

### 📦 Inventory
| View File | Route | কী করে |
|-----------|-------|--------|
| `InventoryView.tsx` | `/inventory` | Stock management, requisitions |

### ⚙️ Admin
| View File | Route | কী করে |
|-----------|-------|--------|
| `UsersView.tsx` | `/user` | User management |
| `RolesView.tsx` | `/role` | Role & permission management |
| `SubscriptionView.tsx` | `/subscription` | Subscription & billing |
| `SupportView.tsx` | `/support` | Support tickets |
| `TutorialsView.tsx` | `/tutorial` | Tutorials/help |

### ⚙️ Settings (views/settings/)
| View File | কী করে |
|-----------|--------|
| `SettingsView.tsx` | Settings container |
| `ProfileSettingsTab.tsx` | Organization profile |
| `ReportsSettingsTab.tsx` | Report preferences |
| `ReportFooterSettingsTab.tsx` | Report footer/signature |
| `PharmacySettingsTab.tsx` | Pharmacy settings |
| `WhatsAppSettingsTab.tsx` | WhatsApp notification settings |

---

## ⌨️ Global Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | New Invoice তৈরি |
| `F2` | Pharmacy POS খোলা |
| `F3` | New Prescription |
| `F4` | New Invoice |
| `F8` | Patients page |
| `F9` | Invoices page |
| `Escape` | Print modal বন্ধ |

---

## 🧠 Architecture (কিভাবে কাজ করে)

```
main.tsx
  └── App.tsx  ←  keyboard shortcuts + view router
        ├── AppContext.tsx  ←  সব global state এখানে (Context API)
        │     ├── currentUser / login / logout
        │     ├── patients, doctors, invoices, samples... (সব data)
        │     ├── setCurrentView()  ←  navigation
        │     └── openPrintModal()  ←  print trigger
        ├── Sidebar.tsx  ←  left nav
        ├── Topbar.tsx   ←  top bar
        ├── [CurrentView]  ←  switch/case দিয়ে render হয়
        └── PrintModal.tsx  ←  সবার উপরে overlay
```

### State Management
- **কোনো Redux নেই** — শুধু React Context API (`AppContext`)
- সব data `AppContext.tsx`-এ থাকে (patients, invoices, doctors, etc.)
- Views `useApp()` hook দিয়ে data নেয়

### Navigation System
- **কোনো React Router নেই** — custom URL-based navigation
- `utils/navigation.ts` → URL path থেকে view name বের করে
- Browser URL update হয় `history.pushState()` দিয়ে
- `currentView` state change হলে `App.tsx`-এর switch case সেই view render করে

### Print System
- `openPrintModal(invoice, format)` call করলে modal খোলে
- Format: `thermal` (80mm), `a4`, `a5`
- `PrintModal.tsx` → `A4Invoice.tsx` বা `ThermalReceipt.tsx` render করে

---

## 📊 Data Types (types/index.ts)

প্রধান interfaces:

| Type | কী |
|------|----|
| `User` | Staff/user account |
| `Patient` | রোগীর তথ্য |
| `DiagnosticTest` | পরীক্ষার details (price, sample type, parameters) |
| `Invoice` | বিল/চালান |
| `InvoiceItem` | Invoice-এর প্রতিটি test |
| `Sample` | Sample collection record |
| `LabReport` | Lab result entry |
| `Doctor` | ডাক্তারের তথ্য + commission |
| `Appointment` | অ্যাপয়েন্টমেন্ট |
| `Chamber` | Doctor chamber/room |
| `PharmacyProduct` | Medicine stock |
| `PharmacySale` | Pharmacy sale |
| `InventoryItem` | Non-medicine inventory |
| `AccountingTransaction` | Income/expense entry |
| `CommissionEntry` | Doctor commission record |
| `TenantSettings` | Organization settings |
| `SupportTicket` | Help/support ticket |

---

## 🚀 Development শুরু করতে

```bash
# Dependencies install (প্রথমবার)
npm install

# Dev server চালু করা
npm run dev
# → http://localhost:5173 এ খুলবে

# Build করা
npm run build

# Build preview
npm run preview
```

---

## 📝 গুরুত্বপূর্ণ নোট

- এটি একটি **frontend-only** প্রজেক্ট। কোনো backend API নেই। সব data `src/data/mockData.ts`-এ hardcoded mock data।
- App নামটা internally **"CarePulse"** — `index.html`-এ title দেখো।
- নতুন view যোগ করতে হলে ৪টা জায়গায় কাজ করতে হবে:
  1. `src/types/index.ts` → `ActiveView` union-এ নাম যোগ
  2. `src/utils/navigation.ts` → path mapping যোগ
  3. `src/views/` → নতুন `.tsx` ফাইল তৈরি
  4. `src/App.tsx` → import + switch case যোগ
