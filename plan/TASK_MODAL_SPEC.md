# Taskify — Task Creation & Edit Modal Specification

> **Document Status:** Approved & Implemented  
> **Location:** `plan/TASK_MODAL_SPEC.md`  
> **Last Updated:** November 18, 2026  

---

## 1. Overview & Generalized Task Architecture

In Taskify, tasks are categorized into **3 practical execution types**:

| Type ID | Display Label | Behavior | Example |
| :--- | :--- | :--- | :--- |
| **`checklist`** | **Checklist** *(Default)* | Micro checklist steps; completed when all steps are checked off or main checkbox is toggled. | "Bug fix checklist", "Deploy to Vercel" |
| **`counter`** | **Countable** | Quantitative target with an interactive `[+1]` increment button directly on the task card. | "Drink 5 glasses of water", "Read 10 pages" |
| **`timed`** | **Timed Block** | Freeform duration set via an interactive time dial/slider (5m to 180m). | "Study React internals (45m)" |

> **Note on Pomodoro:**  
> Pomodoro is an **execution tool**, not a rigid task schema! Any task (Checklist, Countable, or Timed) can have the Pomodoro focus timer launched on it whenever you start deep work.

---

## 2. Reusable Component Hierarchy

```
src/
├── components/
│   ├── ui/
│   │   └── Modal.tsx                ← Reusable Apple Liquid Glass Modal (handles Esc, scroll lock, backdrop)
│   ├── tasks/
│   │   ├── TaskCard.tsx             ← Renders Checkbox, Title, Badges, [+1] counter, Play Pomodoro, Edit, Delete
│   │   ├── ArchetypeBadge.tsx       ← Dynamic badge: "2/3 steps", "2/5 glasses", or "45m"
│   │   └── PriorityBadge.tsx        ← P0, P1, P2 badges
│   └── manage/
│       ├── DailyPlanTab.tsx         ← Capacity throttle (5 slots) + execution queue
│       ├── WeeklyHorizonTab.tsx     ← Mon–Fri horizon grid
│       ├── BacklogTab.tsx           ← Staged inbox triage
│       └── TaskModal.tsx            ← Wraps <Modal> with the 3 generalized task forms
```

---

## 3. Modal Fields Breakdown

1. **Title (Required)**: Text input with auto-focus.
2. **Task Type (Dropdown)**:
   - Options: `Checklist` (Default), `Countable`, `Timed Block`.
   - Frosted liquid glass backdrop blur menu.
   - Info `(i)` tooltip explaining use cases.
3. **Dynamic Contextual Fields**:
   - `checklist`: Step input + list with individual check-off and delete buttons.
   - `counter`: Target count number field + optional custom unit (e.g. `glasses`, `pages`, `reps`).
   - `timed`: Interactive range slider dial (5m–180m) + quick preset dials (`15m`, `25m`, `45m`, `60m`, `90m`).
4. **Priority**:
   - `P0 Urgent`, `P1 High` (Default), `P2 Normal`.
   - Info `(i)` tooltip explaining daily allocation limits.
5. **Schedule for Today**:
   - Checkbox toggle.
   - Guardrail alert if today already has 5 slots filled.
6. **Actions**:
   - `Cancel` & `Create Task` / `Save Changes`.
