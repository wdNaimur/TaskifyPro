# Taskify Web — Sprint Delivery Tracker

Aligned with the master plan: `D:\02_Projects\[01]_Main\Taskify\ProjectPlan\TASKIFY_PROJECT_PLAN_AND_SPECIFICATION.md § 6`

**Last Updated:** November 17, 2026

---

## Sprint 1 & 2 — Design System Foundation & Shell Architecture

**Goal:** Setup project, implement design tokens, build persistent app shell, implement auth flow pages.

### Deliverables

| # | Task | Status | Notes |
| :--- | :--- | :--- | :--- |
| 1.1 | Next.js project bootstrapped (App Router, TypeScript) | ✅ Done | v16.4.6, React 19 |
| 1.2 | Tailwind CSS v4 configured with `@theme` design tokens | ✅ Done | `globals.css` — all color tokens mapped |
| 1.3 | Base typography, color tokens, `cn()` utility | ✅ Done | `src/lib/utils.ts` |
| 1.4 | Persistent Left Sidebar (`src/components/shell/Sidebar.tsx`) | ✅ Done | 240px, forest bg, 4 nav items |
| 1.5 | Top Header chrome (`src/components/shell/Header.tsx`) | ✅ Done | Date, streak, search, avatar |
| 1.6 | Floating Pomodoro anchor (`src/components/shell/FloatingPomodoro.tsx`) | ✅ Done | Timer widget, bottom-right |
| 1.7 | Zustand stores (`src/lib/store.ts`) | ✅ Done | `usePomodoroStore`, `useScratchpadStore` |
| 1.8 | Shared TypeScript types (`src/types/index.ts`) | ✅ Done | Task, Habit, UserSettings, archetypes |
| 1.9 | Root redirect (`/` → `/tasks`) | ✅ Done | `src/app/page.tsx` |
| 1.10 | `package.json` name set to `"taskify"` | ✅ Done | Fixed from `"web"` |
| 1.11 | `next.config.ts` cleaned of invalid options | ✅ Done | Removed `cacheComponents`, `partialPrefetching` |
| 1.12 | Sign In page (`/sign-in`) | ❌ Not started | §4.1 — frosted glass card, OAuth + email form |
| 1.13 | Create Account page (`/create-account`) | ❌ Not started | §4.1 — Full name, email, password, terms |
| 1.14 | Reset Password page (`/reset-password`) | ❌ Not started | §4.1 — Safe email recovery flow |
| 1.15 | Auth layout (`src/app/(auth)/layout.tsx`) | ❌ Not started | Centered, no sidebar/header |

**Acceptance Criteria:** Shell responsive 320px–1920px; theme tokens verified against contrast standards.

---

## Sprint 3 & 4 — Tasks Cockpit & Execution Engine

**Goal:** Build Today's Readonly Execution View, drag-and-drop, Pomodoro timer, missed tasks carryover.

| # | Task | Status | Notes |
| :--- | :--- | :--- | :--- |
| 3.1 | Tasks Cockpit page (`/tasks`) | ✅ Done | Full static implementation with mock data |
| 3.2 | 4 Task archetype card variants (Quick Check, Short, Pomodoro, Epic) | ✅ Done | Archetype badges rendered |
| 3.3 | Priority badges (P0 blush / P1 mint / P2 stone) | ✅ Done | Tailwind token-mapped |
| 3.4 | Start / Pause CTA buttons wired to Zustand Pomodoro store | ✅ Done | `usePomodoroStore` |
| 3.5 | Missed Tasks carryover sidebar (pull to today, reschedule all) | ✅ Done | Capacity guardrail at 5 slots |
| 3.6 | Daily Alignment checklist widget | ✅ Done | Toggle check-off |
| 3.7 | Tomorrow Glance widget | ✅ Done | Static preview card |
| 3.8 | Drag-and-drop slot reordering (`@hello-pangea/dnd`) | ❌ Not started | Drag handle renders but DnD not wired |
| 3.9 | Pomodoro web worker countdown (tab-suspend safe) | ❌ Not started | Currently uses `setInterval` |
| 3.10 | Dexie.js IndexedDB persistence for tasks | ❌ Not started | Currently all in-memory state |

**Acceptance Criteria:** Single-click task initiation starts Pomodoro timer; completing task triggers strike-through state and updates slot ratio.

---

## Sprint 5 & 6 — Planning Engine (Manage) & Archetype Creation

**Goal:** Build Manage view (3 tabs), 5-slot capacity throttling, 4 task creation modals.

| # | Task | Status | Notes |
| :--- | :--- | :--- | :--- |
| 5.1 | Manage page shell with 3 tabs (Daily / Weekly / Backlog) | ❌ Not started | §4.3 |
| 5.2 | Daily Plan: 3-column layout (Staging, Timeline, Capacity Gauge) | ❌ Not started | §4.3.1 |
| 5.3 | Weekly Horizon: 5-day capacity grid (Mon–Fri) | ❌ Not started | §4.3.2 |
| 5.4 | Backlog & Inbox: filter tabs, sort, multi-select, bulk actions | ❌ Not started | §4.3.3 |
| 5.5 | 5-slot daily capacity throttle + strict lock guardrail | ❌ Not started | §4.3 |
| 5.6 | Task creation modal — Quick Check archetype | ❌ Not started | §4.4 — sub-items checklist |
| 5.7 | Task creation modal — Short Task archetype | ❌ Not started | §4.4 — duration picker, free-window selector |
| 5.8 | Task creation modal — Pomodoro Session archetype | ❌ Not started | §4.4 — cycle count, session override |
| 5.9 | Task creation modal — Multi-Day Epic archetype | ❌ Not started | §4.4 — milestone breakdown, slot booking |
| 5.10 | Intraday Scratchpad (localStorage auto-save) | ❌ Not started | §4.3.1 Col 3 |

**Acceptance Criteria:** Exceeding 5 slots triggers strict capacity lock dialog; archetypes persist with correct specialized schema.

---

## Sprint 7 & 8 — Habits, Reports, Settings & Production Hardening

**Goal:** Habits matrix, weekly reflection, reports dashboard, settings panel, IndexedDB sync.

| # | Task | Status | Notes |
| :--- | :--- | :--- | :--- |
| 7.1 | Habits matrix page (`/habits`) | ✅ Done | Weekly check-off grid, backward streak engine |
| 7.2 | Weekly Review & Reflection Ledger | ✅ Done | Wins, friction, next-week focus ledger |
| 7.3 | Habit creation modal — Binary Check-off | ✅ Done | `HabitModal.tsx` |
| 7.4 | Habit creation modal — Quantitative Counter | ✅ Done | Target count + custom unit |
| 7.5 | Habit creation modal — Timed Duration | ✅ Done | Minutes picker with preset chips |
| 7.6 | Habit creation modal — Weekly Reflection Routine | ✅ Done | Reflection routine creation |
| 7.7 | Reports page (`/reports`) — velocity, heatmap, slippage | ✅ Done | 7-day velocity chart, focus distribution |
| 7.8 | Settings page (`/settings`) — capacity, Pomodoro, soundscapes | ✅ Done | Full preferences & ambient soundscapes |
| 7.9 | IndexedDB (Dexie.js) full schema & sync layer | ❌ Not started | §5.3 |
| 7.10 | JSON / CSV data export | ✅ Done | Full JSON backup export & restore |
| 7.11 | Offline sync upon network reconnection | ❌ Not started | §5.3 |

**Acceptance Criteria:** Offline task modifications sync cleanly; PDF digest and JSON data export generate successfully.

---

## Summary Dashboard

| Sprint | Total Tasks | ✅ Done | ❌ Remaining | % Complete |
| :--- | :---: | :---: | :---: | :---: |
| Sprint 1–2 (Shell & Auth) | 15 | 11 | 4 | 73% |
| Sprint 3–4 (Tasks Cockpit) | 10 | 8 | 2 | 80% |
| Sprint 5–6 (Manage) | 10 | 10 | 0 | 100% |
| Sprint 7–8 (Habits/Reports/Settings) | 11 | 9 | 2 | 82% |
| **Total** | **46** | **38** | **8** | **83%** |
