# Taskify Web — App Router Route Map

All routes use the **Next.js 16 App Router** with the `(dashboard)` route group for authenticated screens.

---

## Route Inventory

| URL Path | File | Layout | Status | Plan Section |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Root | ✅ Redirect → `/tasks` | — |
| `/tasks` | `src/app/(dashboard)/tasks/page.tsx` | Dashboard | ✅ Built | §4.2 Tasks Cockpit |
| `/manage` | `src/app/(dashboard)/manage/page.tsx` | Dashboard | 🔲 Stub | §4.3 Manage Engine |
| `/habits` | `src/app/(dashboard)/habits/page.tsx` | Dashboard | 🔲 Stub | §4.5 Habits & Reflection |
| `/reports` | `src/app/(dashboard)/reports/page.tsx` | Dashboard | 🔲 Stub | §4.6 Reports & Analytics |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | Dashboard | 🔲 Stub | §4.7 System Settings |
| `/sign-in` | `src/app/(auth)/sign-in/page.tsx` | Auth | ❌ Missing | §4.1 Authentication |
| `/create-account` | `src/app/(auth)/create-account/page.tsx` | Auth | ❌ Missing | §4.1 Authentication |
| `/reset-password` | `src/app/(auth)/reset-password/page.tsx` | Auth | ❌ Missing | §4.1 Authentication |

**Legend:** ✅ Built · 🔲 Stub (renders placeholder) · ❌ Missing (not yet created)

---

## Layout Hierarchy

```
src/app/
│
├── layout.tsx                  ← RootLayout
│   └── (Root HTML, Inter font, globals.css, metadata)
│
├── (dashboard)/layout.tsx      ← DashboardLayout  [wraps all app pages]
│   ├── <Sidebar />             ← Fixed 240px left nav
│   ├── <Header />              ← Fixed top bar (left-60, h-14)
│   ├── <FloatingPomodoro />    ← Fixed bottom-right widget
│   └── <main> {children} </main>
│
└── (auth)/layout.tsx           ← AuthLayout  [to be created]
    └── Centered single-card container over #F8F9FA canvas
```

---

## Route Group: `(dashboard)`

The `(dashboard)` folder is a **Next.js route group** (parentheses = not in URL). It applies the full app shell (Sidebar + Header + Pomodoro widget) to all nested pages without adding `/dashboard` to the URL.

```
(dashboard)/
├── layout.tsx      ← Injects Sidebar + Header + FloatingPomodoro
├── tasks/page.tsx  → renders at /tasks
├── manage/page.tsx → renders at /manage
├── habits/page.tsx → renders at /habits
├── reports/page.tsx → renders at /reports
└── settings/page.tsx → renders at /settings
```

## Route Group: `(auth)` *(to be created)*

```
(auth)/
├── layout.tsx           ← Minimal centered layout, no sidebar/header
├── sign-in/page.tsx     → renders at /sign-in
├── create-account/page.tsx → renders at /create-account
└── reset-password/page.tsx → renders at /reset-password
```

---

## Future Routes (Post-Sprint 5+)

| URL Path | Purpose | Plan Section |
| :--- | :--- | :--- |
| `/manage/daily` | Daily Plan tab (3-column) | §4.3.1 |
| `/manage/weekly` | Weekly Horizon tab (5-day) | §4.3.2 |
| `/manage/backlog` | Backlog & Triage Inbox | §4.3.3 |
