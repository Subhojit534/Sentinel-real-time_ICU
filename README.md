<div align="center">

<img src="public/favicon.ico" width="64" height="64" alt="Sentinel Logo" />

# 🏥 Project Sentinel
### Decentralized ICU Monitoring & Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

> **Project Sentinel** is a real-time, AI-augmented ICU monitoring platform that gives clinical teams a unified view of every patient across all wards — from live vitals and deterioration risk scores to bed management, alert triage, and exportable medical reports.

---

[Live Demo](#) &nbsp;·&nbsp; [Report a Bug](#) &nbsp;·&nbsp; [Request a Feature](#)

</div>

---

## 📸 Screenshots

| Sign In | ICU Dashboard | Patient Management |
|---------|--------------|-------------------|
| ![Login](public/placeholder-login.png) | ![Dashboard](public/placeholder-dashboard.png) | ![Patients](public/placeholder-patients.png) |

| Bed Management | Alert Panel | PDF Report |
|---------------|------------|-----------|
| ![Beds](public/placeholder-beds.png) | ![Alerts](public/placeholder-alerts.png) | ![PDF](public/placeholder-pdf.png) |

---

## ✨ Features

### 🔐 Authentication & Session Management
- **Role-based sign-up** for Physicians, Nurses, Registrars, and Administrators
- Secure login with Supabase PostgreSQL user validation
- Persistent sessions via `localStorage` — stays logged in across page refreshes
- Demo mode with pre-seeded accounts for instant evaluation
- Dynamic profile: name, role, hospital, ward, and **license / registration number** all sync from the database

### 📊 ICU Monitoring Dashboard
- Live patient grid with real-time vital sign streams
- **NEWS2 scoring** (National Early Warning Score v2) calculated and colour-coded per patient
- **Sentinel-AI Deterioration Model** — 4-hour prediction risk score (%) with trend bars
- Animated vital tiles (HR, SpO₂, Systolic BP, Temperature, RR, MAP)
- Real-time simulation engine with stochastic vitals variance (runs in background)

### 👥 Patient Management
- Full patient directory with multi-filter search (name, diagnosis, bed, physician)
- Status filter tabs: Critical · Warning · Watch · Stable
- Per-ward filter with live counts
- Sliding detail panel showing full clinical summary, all six vitals, AI risk breakdown

### 🛏️ Bed Management
- Live bed grid fetched directly from the `beds` table in Supabase
- Allocate a new patient to any available bed with a single modal form
- Discharge a patient — cascades to remove vitals history, alerts, and releases the bed
- Real-time status colours: Occupied · Available · Maintenance · Reserved

### 🚨 Alert Management Panel
- Unified alert feed across all wards and all severity levels
- Filter by severity (Low / Moderate / High / Critical) and status (Active / Acknowledged / Resolved)
- AI-generated alerts distinguished from manual clinical alerts
- Acknowledge and escalate actions with animated state transitions

### 📈 Vitals History & Trends
- 24-hour / 48-hour trend charts per patient using Recharts
- Multi-metric overlay: HR, SpO₂, BP, Temperature, Respiratory Rate, MAP
- Patient selector to compare trends across different patients

### 📄 PDF Report Generation (NEW)
- Select one or multiple patients using checkboxes
- Generate a **professional A4 PDF clinical report** with one click
- Report includes:
  - Branded cover page with stats summary and patient index table
  - Per-patient page: identity card, clinical summary, full vitals table with normal ranges and ABNORMAL flags, AI risk bar, and three-line signature block
- **CONFIDENTIAL** badge on every page with HIPAA/DPDPA footer
- File saved automatically as `Sentinel_PatientName_YYYY-MM-DD.pdf`

### ⚙️ Settings
- **Profile tab** — edit name, specialization, license number (fetched from DB), view role and hospital
- **Notifications tab** — granular toggles for Critical/High/Moderate/Low alerts, AI predictions, shift reminders, email and SMS delivery
- **Security tab** — two-factor authentication toggle, session timeout configuration
- **Display tab** — compact mode, high contrast, AI risk visibility, auto-refresh interval
- **System tab** — database connectivity status, real-time sync settings

---

## 🏗️ Architecture

```
projectsentinel/
├── src/
│   ├── app/
│   │   ├── api/                        # Next.js Route Handlers (API layer)
│   │   │   ├── alerts/                 # GET alerts with Supabase fallback
│   │   │   ├── beds/                   # GET bed grid from DB
│   │   │   ├── patients/               # GET list, POST allocate, DELETE discharge
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # DELETE patient (cascade vitals + alerts)
│   │   │   │       └── vitals/         # GET 24h/48h vitals history
│   │   │   └── wards/                  # GET ward list
│   │   │
│   │   ├── icu-monitoring-dashboard/   # Main real-time monitoring grid
│   │   ├── patients/                   # Patient directory + PDF export
│   │   ├── bed-management/             # Bed grid + allocate/discharge modals
│   │   ├── alert-management-panel/     # Alert triage feed
│   │   ├── vitals-history/             # Trend charts
│   │   ├── settings/                   # User settings page
│   │   └── sign-up-login-screen/       # Auth pages (login + signup)
│   │
│   ├── components/                     # Shared UI components
│   │   ├── AppLayout.tsx               # Sidebar + Topbar shell
│   │   ├── AppProviders.tsx            # Route-aware providers (suppresses on login page)
│   │   ├── Sidebar.tsx                 # Nav sidebar (session-aware user profile)
│   │   ├── Topbar.tsx                  # Top bar (session-aware name/role)
│   │   └── ui/                         # Atomic components (badges, indicators)
│   │
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client initialisation
│   │   ├── api.ts                      # Frontend API wrapper functions
│   │   ├── session.ts                  # localStorage session helpers
│   │   ├── mockData.ts                 # Fallback mock data (DB-first pattern)
│   │   ├── types.ts                    # Shared TypeScript interfaces
│   │   └── generatePatientPDF.ts       # jsPDF clinical report generator
│   │
│   ├── providers/
│   │   └── SimulationProvider.tsx      # Background vitals simulation engine
│   │
│   └── styles/
│       └── tailwind.css                # Global Tailwind styles
│
├── database/
│   ├── supabase_schema.sql             # Full PostgreSQL schema
│   └── seed.sql                        # Seed data (hospitals, wards, beds, patients)
│
└── scripts/
    └── setup-db.js                     # Database bootstrap script
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, React Server Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Vanilla CSS |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) with Row-Level Security |
| **Charts** | [Recharts 2](https://recharts.org/) |
| **PDF Export** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Icons** | [Lucide React](https://lucide.dev/) + [Heroicons](https://heroicons.com/) |
| **Forms** | [React Hook Form 7](https://react-hook-form.com/) |
| **3D / Landing** | [Three.js](https://threejs.org/) — interactive Rubik's Cube landing page |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Linting** | ESLint + Prettier |
| **Port** | `4028` (dev and production) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18.x`
- **npm** `>= 9.x`
- A [Supabase](https://supabase.com/) project (free tier works fine)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/projectsentinel.git
cd projectsentinel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (or copy `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> 📍 Find these in your Supabase dashboard → **Settings → API**

### 4. Set Up the Database

**Step 4a** — Run the schema in your Supabase SQL Editor:

```sql
-- Paste the contents of database/supabase_schema.sql
```

**Step 4b** — Apply the license number migration (if upgrading an existing DB):

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number TEXT;
```

**Step 4c** — Seed sample data:

```sql
-- Paste the contents of database/seed.sql
```

**Step 4d** — Enable Row Level Security policies (run in SQL Editor):

```sql
-- Allow anon + authenticated to read/write all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE vitals_current ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON vitals_current FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE vitals_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON vitals_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON alerts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON beds FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

---

## 👤 Demo Accounts

The seeded database includes the following test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Doctor** | `priya.sharma@sentinel.icu` | `demo1234` |
| **Nurse** | `kavita.rao@sentinel.icu` | `demo1234` |
| **Admin** | `admin@sentinel.icu` | `admin123` |

> These accounts are also available as **quick-fill buttons** on the login screen.

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server on port 4028
npm run build        # Build for production
npm run start        # Start production server on port 4028
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Run Prettier formatter
npm run type-check   # Run TypeScript type-checking without emitting
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `hospitals` | Hospital registry |
| `wards` | ICU wards linked to hospitals |
| `users` | Clinician accounts (doctor / nurse / admin) with license numbers |
| `patients` | Active patient records with diagnosis, bed, status, NEWS2 |
| `vitals_current` | Latest vitals snapshot per patient |
| `vitals_history` | Full time-series vitals for trend analysis |
| `alerts` | Clinical alerts with severity, status, escalation level |
| `beds` | Bed registry with real-time occupancy status |

---

## 🔒 Security Notes

> ⚠️ **This is a demo/development build.**

- Passwords are stored in **plain text** in the `users` table for demo simplicity. For production, migrate to [Supabase Auth](https://supabase.com/docs/guides/auth) with hashed credentials and JWT sessions.
- RLS policies are permissive (`FOR ALL … USING (true)`) for ease of development. Tighten these in production using role-based claims.
- The `localStorage` session contains user profile data (name, role, email). For production, use Supabase Auth sessions with `getSession()`.

---

## 🗺️ Roadmap

- [x] Real-time vitals simulation engine
- [x] Supabase PostgreSQL integration with fallback mock data
- [x] Bed allocation and patient discharge with cascade deletes
- [x] AI deterioration risk scoring (simulated)
- [x] PDF clinical report export with signature blocks
- [x] Role-based session persistence
- [ ] Supabase Auth (JWT) full migration
- [ ] Real-time subscriptions via Supabase Realtime (WebSocket)
- [ ] Role-gated UI views (admin vs. doctor vs. nurse)
- [ ] Mobile-responsive layout for tablet use at bedside
- [ ] Email/SMS notification delivery via Supabase Edge Functions
- [ ] Audit log trail for HIPAA compliance

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (ESLint + Prettier config is included).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**Subhojit Paul** — [GitHub](https://github.com/Subhojit534)

---

<div align="center">

Built with ❤️ for the frontline clinical teams who never stop.

**Project Sentinel** — *Monitor. Predict. Protect.*

</div>