# CarePoint — Appointment Manager

A high-reliability, accessible, and polished patient appointment management web application built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and **Vanilla CSS**. Designed for healthcare clinic administration to streamline scheduling, tracking, filtering, and managing patient appointments with local persistence.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Available Scripts](#available-scripts)
7. [Project Architecture & Directory Structure](#project-architecture--directory-structure)
8. [Data Model & Types](#data-model--types)
9. [Storage Strategy & Persistence](#storage-strategy--persistence)
10. [Form Validation & Error Handling](#form-validation--error-handling)
11. [Testing Strategy & Actual Verification Results](#testing-strategy--actual-verification-results)
12. [Resetting Demo Data](#resetting-demo-data)
13. [Limitations & Production Medical Security Disclaimer](#limitations--production-medical-security-disclaimer)

---

## 1. Project Overview

**CarePoint — Appointment Manager** is a healthcare SaaS dashboard engineered to manage clinical appointments reliably without complex backend infrastructure. It provides full lifecycle CRUD (Create, Read, Update, Delete) capabilities, combined with real-time multi-attribute search, faceted filtering, date range constraints, and dynamic summary analytics.

The application adheres to accessibility best practices (WCAG AA), responsive design principles for desktop, tablet, and mobile, and eliminates timezone shift anomalies in healthcare date handling.

---

## 2. Key Features

- **Dashboard Statistics (Summary Cards):**
  - Live metric cards showing Total Appointments, Scheduled, Completed, and Cancelled counts calculated dynamically from stored data.
- **Appointment Scheduling (Create):**
  - Accessible modal dialog with focus management and keyboard dismissal (`Escape`).
  - Strict validation for required fields, whitespace rejection, date validation (allowing past records), and time ranges.
  - Generates collision-resistant unique IDs (`apt-[timestamp]-[random]`) and ISO 8601 timestamps (`createdAt`, `updatedAt`).
- **Data Visualization (View):**
  - Desktop: Clean, responsive tabular display with patient name, formatted date/time, doctor, appointment type, accessible status badges, and action toolbars.
  - Mobile & Tablet: Card-based responsive list with identical full action capabilities.
  - Details Modal: Dedicated inspection dialog displaying complete appointment metadata including system IDs and timestamps.
- **Appointment Modification (Edit):**
  - Reusable modal dialog pre-filled with existing appointment values.
  - Preserves immutable system ID and original creation timestamp while updating `updatedAt`.
- **Safe Deletion Flow (Delete):**
  - Custom accessible confirmation modal identifying the exact patient name, assigned physician, and date/time.
  - Safe default focus on "Cancel" button to prevent accidental clicks.
- **Real-Time Search:**
  - Case-insensitive search across Patient Name, Doctor, Appointment Type, and Status with live typing updates and a clear button.
- **Faceted Filters & Sorting:**
  - Status filter (Scheduled, Confirmed, Completed, Cancelled).
  - Appointment Type filter (General Consultation, Follow-up, Dental, Cardiology, Dermatology, Other).
  - Doctor filter dynamically populated from current records and medical specialists.
  - Date Range filter (From Date / To Date).
  - Multi-attribute sorting (Appointment Date, Patient Name, Date Created) in Ascending or Descending order.
  - Combined filter logic with active filter counters and one-click filter reset.
- **Toast Notifications:**
  - Non-blocking notification toasts with icons for success, info, and error events with auto-dismissal (4s) and manual dismiss buttons.
- **Fictional Demo Seed Data & Reset:**
  - Automatically seeds 8 realistic fictional appointments on the initial browser visit.
  - Option to reset back to initial demo data with a confirmation safeguard dialog.

---

## 3. Technology Stack

- **Framework:** Next.js 14.2 (App Router)
- **Library:** React 18.3
- **Language:** TypeScript 5.6 (strict mode enabled, zero `any` usage)
- **Styling:** Vanilla CSS design system (tokens, CSS custom properties, responsive breakpoints; **No Tailwind CSS**)
- **Icons:** Lucide React
- **Persistence:** Browser `localStorage` with versioned envelope schema and SSR safety checks
- **Testing:** Vitest 2.1 + React Testing Library + `@testing-library/jest-dom` + `jsdom`
- **Linter:** ESLint with Next.js Core Web Vitals config

---

## 4. Prerequisites

- **Node.js:** v18.17.0 or higher (tested on Node v24.19.0)
- **npm:** v9.0.0 or higher (tested on npm 10.8.3)
- Modern web browser (Chrome, Edge, Firefox, Safari) with JavaScript and `localStorage` enabled.

---

## 5. Installation & Setup

1. Clone or open the project folder in your terminal:
   ```bash
   cd c:/Users/Amith/Desktop/Appointment_App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 6. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000` |
| `npm run build` | Compiles an optimized production build |
| `npm run start` | Starts production server after build |
| `npm run lint` | Runs Next.js ESLint verification |
| `npm run typecheck` | Runs TypeScript compiler check (`tsc --noEmit`) |
| `npm test` | Runs the Vitest automated test suite once |
| `npm run test:watch`| Runs Vitest in watch mode |

---

## 7. Project Architecture & Directory Structure

```
Appointment_App/
├── app/
│   ├── globals.css              # Custom Vanilla CSS design system & tokens
│   ├── layout.tsx               # Root HTML5 layout, metadata & viewport
│   └── page.tsx                 # Application entry point rendering Dashboard
├── components/
│   ├── AppointmentCards.tsx     # Responsive mobile card layout
│   ├── AppointmentDetailsModal.tsx # Detailed record inspection dialog
│   ├── AppointmentFormModal.tsx # Create & Edit form dialog with inline errors
│   ├── AppointmentTable.tsx     # Desktop data table with sorting and actions
│   ├── Dashboard.tsx            # Main dashboard container & state orchestration
│   ├── DeleteConfirmModal.tsx   # Custom accessible delete confirmation modal
│   ├── Header.tsx               # Application header with branding & CTA
│   ├── ResetConfirmModal.tsx    # Confirmation dialog for demo data reset
│   ├── SearchAndFilter.tsx      # Search bar, multi-select dropdowns & sort bar
│   ├── StatusBadge.tsx          # Accessible colored status badges
│   ├── SummaryCards.tsx         # 4 dynamic metric calculation cards
│   └── Toast.tsx                # Toast notification system
├── lib/
│   ├── storage.ts               # LocalStorage data access layer & seed data
│   ├── utils.ts                 # Date/time formatting, calculations & filters
│   └── validation.ts            # Form validation logic & error builders
├── types/
│   └── appointment.ts           # TypeScript interfaces, types & constants
├── tests/
│   ├── setup.ts                 # Vitest test setup with localStorage clearance
│   ├── storage.test.ts          # Storage access layer unit tests
│   ├── utils.test.ts            # Formatting, calculations & filter unit tests
│   ├── validation.test.ts       # Validation rules & trimming unit tests
│   └── appointment-manager.test.tsx # React Testing Library component integration tests
├── next.config.mjs              # Next.js configuration
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript strict configuration
└── vitest.config.ts             # Vitest test runner configuration
```

---

## 8. Data Model & Types

Each appointment record conforms to the following TypeScript definition:

```typescript
export type AppointmentType =
  | 'General Consultation'
  | 'Follow-up'
  | 'Dental'
  | 'Cardiology'
  | 'Dermatology'
  | 'Other';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface Appointment {
  id: string;              // e.g. "apt-demo-01" or "apt-mg87xk-ab34c"
  patientName: string;     // Trimmed patient full name
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:mm" (24-hour)
  doctor: string;          // Assigned physician or specialist
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  createdAt: string;       // ISO 8601 string
  updatedAt: string;       // ISO 8601 string
}
```

---

## 9. Storage Strategy & Persistence

The application utilizes a dedicated data access layer (`lib/storage.ts`):

- **Storage Key:** `carepoint_appointments_v1`
- **Versioned Envelope:** `{ version: 1, data: Appointment[] }`
- **First Visit Seeding:** If `localStorage` has no record for the key, 8 fictional demo appointments are seeded.
- **Persistence Across Visits:** Subsequent page reloads retrieve user-modified data without overwriting it.
- **Graceful Error Recovery:** If `localStorage` contains invalid JSON, corrupt structures, or incomplete fields, the system falls back safely to demo data and logs a diagnostic warning without crashing the UI.
- **SSR Hydration Protection:** All browser storage reads are deferred until client-side mount (`useEffect`), completely preventing SSR hydration divergence errors.

---

## 10. Form Validation & Error Handling

Validation rules implemented in `lib/validation.ts`:

- **Patient Name:** Required, trimmed, minimum 2 characters, maximum 100 characters. Rejects whitespace-only inputs.
- **Doctor Name:** Required, trimmed, minimum 2 characters, maximum 100 characters. Supports standard dropdown list or custom specialist entry.
- **Appointment Date:** Required, validates against standard `YYYY-MM-DD` and checks calendar validity (e.g., rejects Feb 30). **Historical dates are allowed** to support recording past clinical consults.
- **Appointment Time:** Required, validates 24-hour time (`00:00` to `23:59`).
- **Appointment Type:** Must match one of the predefined union members (`General Consultation`, `Follow-up`, `Dental`, `Cardiology`, `Dermatology`, `Other`).
- **Appointment Status:** Must match one of the predefined union members (`Scheduled`, `Confirmed`, `Completed`, `Cancelled`).
- **Inline Error Feedback:** Invalid fields display descriptive text below the corresponding input and highlight borders in red.
- **Data Preservation:** Entered values are preserved in form state if submission fails validation.

---

## 11. Testing Strategy & Actual Verification Results

Automated tests are implemented using **Vitest** and **React Testing Library** under `tests/`.

### Verified Test Requirements

1. **Valid appointment creation:** Verified in `storage.test.ts`, `validation.test.ts`, and `appointment-manager.test.tsx`.
2. **Required-field validation:** Verified in `validation.test.ts` and `appointment-manager.test.tsx`.
3. **Whitespace-only name validation:** Verified in `validation.test.ts`.
4. **Appointment editing & timestamp preservation:** Verified in `storage.test.ts` and `appointment-manager.test.tsx`.
5. **Correct appointment deletion:** Verified in `storage.test.ts` and `appointment-manager.test.tsx`.
6. **Cancellation of deletion:** Verified in `appointment-manager.test.tsx`.
7. **Case-insensitive search:** Verified in `utils.test.ts` and `appointment-manager.test.tsx`.
8. **Status and appointment-type filtering:** Verified in `utils.test.ts` and `appointment-manager.test.tsx`.
9. **Combined search and filters:** Verified in `utils.test.ts`.
10. **Persistence and recovery of stored appointments:** Verified in `storage.test.ts`.
11. **Handling of malformed stored data:** Verified in `storage.test.ts`.
12. **Dashboard summary calculations:** Verified in `utils.test.ts` and `appointment-manager.test.tsx`.

### Actual Test Execution Output

```
 ✓ tests/validation.test.ts (8 tests)
 ✓ tests/utils.test.ts (14 tests)
 ✓ tests/storage.test.ts (9 tests)
 ✓ tests/appointment-manager.test.tsx (9 tests)

 Test Files  4 passed (4)
      Tests  40 passed (40)
   Duration  3.99s
```

### Type Checking & Linter Results

- **`npm run typecheck`:** Exited with code `0` (Zero TypeScript errors).
- **`npm run lint`:** Exited with code `0` (`✔ No ESLint warnings or errors`).
- **`npm run build`:** Compiled successfully, prerendered all routes statically.

---

## 12. Resetting Demo Data

To restore the original 8 fictional demo appointments:
1. Scroll to the bottom of the dashboard footer.
2. Click the **"Reset Demo Data"** button.
3. Review the custom confirmation dialog.
4. Click **"Restore Demo Data"**. All custom session changes will be replaced with the baseline fictional records, and a notification toast will confirm the reset.

---

## 13. Limitations & Production Medical Security Disclaimer

> [!WARNING]
> **Educational & Demonstration Notice:**
> The `localStorage` mechanism employed in this application is designed solely for local demonstrations, automated evaluation, and technical assessment.
> 
> In a production clinical environment:
> - `localStorage` is **not HIPAA / GDPR compliant** and lacks encryption at rest.
> - Data is constrained to a single browser profile and does not sync across multiple devices or users.
> - A production healthcare application requires an authenticated REST/GraphQL API, role-based access control (RBAC), end-to-end encryption, audit logs, and persistent relational storage (e.g., PostgreSQL with pgAudit).
> - All names and medical records in this application are completely fictional. Never input real Protected Health Information (PHI).
