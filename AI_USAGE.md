# AI Usage & Engineering Process Disclosure

This document details the role of the AI coding assistant (Antigravity), architectural decisions made during development, edge cases evaluated, verification performed, and specific areas recommended for human engineer review.

---

## 1. Role of the AI Coding Assistant

The AI coding assistant acted as a senior full-stack software engineer pair-programmer responsible for:
- Initializing the Next.js 14 App Router project structure directly within the workspace base directory without creating extraneous nested folders.
- Selecting stable, mutually compatible versions of Next.js, React 18, TypeScript, Vitest, React Testing Library, and Lucide React.
- Crafting a bespoke, accessible Vanilla CSS design system tailored for healthcare SaaS without using Tailwind CSS.
- Implementing the TypeScript data models, validation layer, storage access abstraction, and React UI components.
- Designing and running unit and component integration test suites using Vitest and React Testing Library.
- Executing TypeScript checks, ESLint verification, production builds, and resolving build warnings.

---

## 2. Key Implementation Decisions

### A. Next.js App Router with Client-Side Hydration Protection
- **Decision:** Use Next.js 14 with App Router, structuring the main application as a client-hydrated root with strict separation of concerns.
- **Rationale:** Since `localStorage` is exclusively available in the browser window, reading it directly in server-side component render cycles causes React hydration divergence errors. The dashboard uses a two-phase initialization pattern (`useEffect`) to guarantee zero hydration warnings while loading stored appointments.

### B. Prevention of Timezone Shift Bugs in Date-Only Fields
- **Decision:** Parse appointment dates (`YYYY-MM-DD`) by splitting parts and constructing the Date in local time (`new Date(year, month - 1, day)`), rather than using `new Date("YYYY-MM-DD")`.
- **Rationale:** Standard `new Date("YYYY-MM-DD")` interprets ISO date-only strings as UTC midnight (`00:00:00Z`). In timezones west of UTC (such as US Eastern or Pacific), converting this to a local date string shifts the calendar day back by one full day (e.g., October 20 becomes October 19). The custom date formatter avoids this pitfall.

### C. Versioned Storage Envelope and Defensive Fallback
- **Decision:** Wrap the appointment list in a versioned envelope `{ version: 1, data: Appointment[] }` with runtime type assertions in `lib/storage.ts`.
- **Rationale:** If a user’s `localStorage` contains legacy data, truncated strings, or unexpected keys, the storage layer catches JSON parsing errors and filters invalid records, falling back to the 8 fictional demo appointments rather than crashing the interface.

### D. Accessible Modal Dialogs vs. Native Alerts
- **Decision:** Build custom accessible modal dialogs for creation/editing, deletion confirmation, and demo reset, instead of relying on browser `window.confirm()` or `window.alert()`.
- **Rationale:** Browser alerts cannot be styled, lack keyboard focus trapping, are visually jarring, and fail modern web accessibility standards. The custom modals include `role="dialog"` or `role="alertdialog"`, `aria-modal="true"`, focus management (defaulting to the Cancel button for destructive actions), and Escape key dismissal.

### E. Cohesive Search, Filtering, and Sorting Pipeline
- **Decision:** Process search query, status filter, type filter, doctor filter, date range filter, and sorting order as a single pipeline in `lib/utils.ts`.
- **Rationale:** In many web applications, applying a filter clears search results or vice-versa. The unified pipeline ensures that all criteria operate conjunctively (`AND` logic) and results reflect all active filters simultaneously.

---

## 3. Potential AI-Generated Mistakes & Risks Checked

During development, the AI assistant systematically monitored, checked, and resolved the following risks:

| Identified Risk / Potential Mistake | Verification / Fix Applied |
| :--- | :--- |
| **Peer dependency conflicts with Vite and React plugins** | When installing `@vitejs/plugin-react`, npm flagged a peer dependency conflict between Vite 5 (pulled by Vitest 2) and `@vitejs/plugin-react@6` (requiring Vite 8). Resolved by explicitly installing `@vitejs/plugin-react@^4.3.4` which natively matches Vite 5. |
| **React hook missing dependency warning (`react-hooks/exhaustive-deps`)** | In `components/AppointmentFormModal.tsx`, `allDoctorOptions` was computed without memoization, triggering an ESLint warning. Fixed by wrapping `allDoctorOptions` in `useMemo` and adding it to the `useEffect` dependency array. Verified with `npm run lint`. |
| **Missing import during production build** | `useMemo` was utilized in `AppointmentFormModal.tsx` but was omitted from the React import statement. Caught during `npm run build` type-checking and immediately resolved. |
| **Responsive table & mobile cards dual-render query collision in tests** | When running React Testing Library integration tests, `screen.getByText('Eleanor Vance')` failed with a "Found multiple elements" error because both the desktop table and mobile card view rendered the name into the jsdom DOM. Resolved by querying `getAllByText` to cleanly accommodate the responsive design. |
| **Whitespace-only input bypass** | Ensured validation trims patient and doctor names before checking length, preventing users from creating appointments with spaces or tab characters. |

---

## 4. Tests Used to Verify Behavior

Automated verification was carried out via **40 passing tests** across 4 test suites:

1. **`tests/validation.test.ts` (8 tests):**
   - Valid appointment input acceptance.
   - Missing required fields rejection.
   - Whitespace-only name rejection.
   - Whitespace trimming on valid inputs.
   - Calendar-invalid date rejection (e.g. Feb 30).
   - Historical date acceptance (past appointments allowed).
   - Time format and 24-hour boundary rejection.
   - Unrecognized appointment type/status union rejection.

2. **`tests/storage.test.ts` (9 tests):**
   - Initial demo data seeding on first visit.
   - Preservation of user data across subsequent visits.
   - Graceful recovery from malformed JSON in `localStorage`.
   - Schema validation filtering of corrupted records.
   - New appointment creation with unique ID and timestamp generation.
   - Edit operation preserving `id` and original `createdAt` while updating `updatedAt`.
   - Deletion of specific appointment records and persistence.
   - Non-existent ID deletion handling.
   - Reset to initial demo dataset.

3. **`tests/utils.test.ts` (14 tests):**
   - Timezone-safe date formatting.
   - 24-hour to 12-hour AM/PM time formatting.
   - Summary count calculations across statuses.
   - Case-insensitive search across patient, doctor, type, and status.
   - Status filtering.
   - Appointment type filtering.
   - Doctor filtering.
   - Date range filtering (`startDate` to `endDate`).
   - Combined search and multi-filter integration.
   - Sorting by Date, Patient Name, and Creation Date in ascending and descending order.

4. **`tests/appointment-manager.test.tsx` (9 tests):**
   - Complete rendering of dashboard, summary cards, and initial appointments.
   - Create appointment validation errors and form state preservation.
   - End-to-end appointment creation, table update, summary increment, and success toast.
   - Editing existing appointments and immediate DOM update.
   - Delete confirmation dialog display and cancellation safety.
   - Delete confirmation execution, table removal, summary decrement, and toast.
   - Live search input filtering and clearing.
   - Status dropdown filtering.
   - Demo data reset flow and restoration of baseline records.

---

## 5. Areas Requiring Human Review

The following areas cannot be verified solely by automated unit and component tests and should be reviewed by a human software engineer or technical evaluator:

1. **Browser Compatibility & High-DPI Rendering:**
   - Visual inspection on Safari (iOS / macOS) and Firefox to confirm consistent flexbox/grid rendering, scrollbar aesthetics, and button focus rings.
2. **Screen Reader User Experience:**
   - Manual testing with NVDA (Windows) or VoiceOver (macOS) to evaluate live announcements of toast messages and modal dialog focus trap ergonomics.
3. **Clinical Domain Requirements:**
   - Evaluation by healthcare practitioners on whether additional clinical metadata (e.g., patient date of birth, insurance ID, visit notes, room number) should be incorporated into the core schema.
4. **Backend & Cloud Migration:**
   - Architecture review for replacing browser `localStorage` with a HIPAA-compliant server database, encrypted sessions, audit logging, and role-based permissions before production rollout.
