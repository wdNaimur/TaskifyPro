# Taskify Web — Directory Structure & Conventions

**Root:** `D:\02_Projects\[01]_Main\Taskify\web`

---

## Full Directory Tree

```
web/
├── plan/                          ← 📋 THIS FOLDER — engineering docs & planning
│   ├── README.md                  ← Overview & quick-reference
│   ├── STRUCTURE.md               ← (this file) directory map & conventions
│   ├── ROUTES.md                  ← App Router route inventory
│   ├── SPRINT_TRACKER.md          ← Sprint delivery checklist
│   └── DESIGN_TOKENS.md           ← Tailwind theme tokens reference
│
├── src/
│   ├── app/                       ← Next.js App Router root
│   │   ├── layout.tsx             ← Root HTML shell (Inter font, metadata, globals.css)
│   │   ├── page.tsx               ← Root redirect → /tasks
│   │   ├── globals.css            ← Tailwind v4 @theme tokens + base styles
│   │   ├── favicon.ico
│   │   │
│   │   └── (dashboard)/           ← Route group: authenticated app shell
│   │       ├── layout.tsx         ← Dashboard shell (Sidebar + Header + FloatingPomodoro)
│   │       ├── tasks/
│   │       │   └── page.tsx       ← Tasks Cockpit — readonly execution view ✅ BUILT
│   │       ├── manage/
│   │       │   └── page.tsx       ← Manage planning engine 🔲 STUB
│   │       ├── habits/
│   │       │   └── page.tsx       ← Habits & reflection 🔲 STUB
│   │       ├── reports/
│   │       │   └── page.tsx       ← Reports & analytics 🔲 STUB
│   │       └── settings/
│   │           └── page.tsx       ← System settings 🔲 STUB
│   │
│   ├── components/
│   │   └── shell/                 ← Persistent chrome components
│   │       ├── Sidebar.tsx        ← Left sidebar nav (240px, forest bg) ✅ BUILT
│   │       ├── Header.tsx         ← Top header (date, streak, search, avatar) ✅ BUILT
│   │       └── FloatingPomodoro.tsx ← Bottom-right floating Pomodoro widget ✅ BUILT
│   │
│   ├── lib/
│   │   ├── store.ts               ← Zustand stores: usePomodoroStore, useScratchpadStore
│   │   └── utils.ts               ← cn() utility (clsx + tailwind-merge)
│   │
│   └── types/
│       └── index.ts               ← Shared TypeScript types (Task, Habit, UserSettings…)
│
├── public/                        ← Static assets
├── node_modules/                  ← Dependencies (installed)
├── .next/                         ← Build output (gitignored)
├── package.json                   ← name: "taskify"
├── next.config.ts                 ← Next.js config (clean — no invalid options)
├── tsconfig.json                  ← TypeScript config (strict, bundler resolution)
├── eslint.config.mjs              ← ESLint config (next/core-web-vitals)
└── tailwind.config (via globals.css @theme)
```

---

## Folder Responsibilities

### `src/app/(dashboard)/`
All authenticated screens live under the `(dashboard)` route group. The group's `layout.tsx` injects the full app shell (Sidebar + Header + FloatingPomodoro) around every child page. The parentheses mean the segment is **not** part of the URL path.

### `src/components/shell/`
Persistent chrome components that render on every authenticated page. Keep these **thin** — no business logic, only layout and navigation. Business logic belongs in `src/lib/` stores.

### `src/components/` (future subfolders)
As more screens are built, add feature-scoped subfolders:
```
src/components/
├── shell/          ← Global chrome (Sidebar, Header, FloatingPomodoro)
├── tasks/          ← Task card, archetype badges, missed-task rail
├── manage/         ← Daily plan columns, weekly horizon grid, backlog table
├── habits/         ← Habit matrix, reflection ledger, habit modals
├── reports/        ← Velocity charts, heatmap, slippage cards
├── settings/       ← Capacity sliders, soundscape picker
└── ui/             ← Reusable primitives: Button, Modal, Badge, Input…
```

### `src/lib/`
- **`store.ts`** — Zustand stores. Add new stores here (e.g. `useTaskStore`, `useHabitStore`).
- **`utils.ts`** — Pure utility functions. `cn()` for class merging is here.
- **`db.ts`** *(to be created)* — Dexie.js IndexedDB schema and instance.

### `src/types/`
Single source of truth for all shared TypeScript interfaces and enums. Never duplicate types across files — always import from `@/types`.

---

## Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| Page files | `page.tsx` (Next.js required) | `tasks/page.tsx` |
| Layout files | `layout.tsx` (Next.js required) | `(dashboard)/layout.tsx` |
| Components | PascalCase `.tsx` | `TaskCard.tsx` |
| Hooks / stores | camelCase `use` prefix | `usePomodoroStore` |
| Utility functions | camelCase | `cn()`, `formatDate()` |
| Types / interfaces | PascalCase | `Task`, `UserSettings` |
| CSS token names | kebab-case under `@theme` | `--color-sage`, `--color-forest` |
| Route paths | kebab-case | `/manage`, `/habits` |

---

## Import Path Alias

All `src/` imports use the `@/` alias (configured in `tsconfig.json`):

```ts
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { Sidebar } from "@/components/shell/Sidebar";
```
