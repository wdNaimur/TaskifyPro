# Taskify Web — Engineering Plan & Structure Reference

This `plan/` folder is the internal engineering reference for the **Taskify web application** (`D:\02_Projects\[01]_Main\Taskify\web`). It documents the codebase structure, sprint progress, component map, and routing architecture.

> **Master Product Plan** lives at: `D:\02_Projects\[01]_Main\Taskify\ProjectPlan\TASKIFY_PROJECT_PLAN_AND_SPECIFICATION.md`

---

## Documents in This Folder

| File | Purpose |
| :--- | :--- |
| [`STRUCTURE.md`](./STRUCTURE.md) | Full directory tree, folder responsibilities, and naming conventions |
| [`ROUTES.md`](./ROUTES.md) | App Router route map — every page, layout, and route group |
| [`SPRINT_TRACKER.md`](./SPRINT_TRACKER.md) | Sprint-by-sprint delivery checklist aligned with the master plan |
| [`DESIGN_TOKENS.md`](./DESIGN_TOKENS.md) | Tailwind v4 `@theme` tokens, color palette, typography scale |
| [`UX_FIX_PLAN.md`](./UX_FIX_PLAN.md) | **UX audit fixes** — 15 bugs across 4 waves, with exact file targets and acceptance criteria |

---

## Quick Reference — Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) |
| Icons | Lucide React |
| State | Zustand v5 (Pomodoro timer, scratchpad) |
| Drag & Drop | @hello-pangea/dnd |
| Local DB | Dexie.js (IndexedDB) |
| Package Manager | npm (node_modules present) |
