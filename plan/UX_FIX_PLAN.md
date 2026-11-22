# Taskify — UX Fix Plan

**Created:** November 22, 2026  
**Based on:** Full UX Flow Audit (20 issues identified)  
**Scope:** Bug fixes and UX improvements to existing features — not new feature sprints.

---

## How to Use This Document

Each fix is a self-contained unit with:
- **File(s) to edit** — exact paths
- **What to change** — precise description
- **Acceptance criteria** — how to verify it's done

Fixes are grouped into 4 waves by dependency and risk. Complete each wave before moving to the next.

---

## Wave 1 — Critical Logic Bugs (Do First)

These break core flows or produce wrong behavior today.

---

### Fix 1 — Floating Pill Starts Timer Before Task is Selected
**Severity:** 🔴 Critical  
**Files:** `src/components/shell/FloatingPomodoro.tsx`

**Problem:**  
The idle "Start Focus" button calls `startSession()` (which sets `isRunning: true` and starts the ticker) and *then* navigates to `/focus`. The user lands on the focus page task picker with the timer already counting down in the background — invisible but active.

**Change:**  
Remove `startSession()` from `handleStartIdle`. Just navigate to `/focus`. The focus page already shows a task list in its idle state where the user can start a session explicitly.

```ts
// BEFORE
const handleStartIdle = () => {
  startSession();
  router.push("/focus");
};

// AFTER
const handleStartIdle = () => {
  router.push("/focus");
};
```

**Acceptance Criteria:**
- Clicking "Start Focus" pill navigates to `/focus` without starting a timer.
- The focus page shows the idle task picker.
- Selecting a task from that list starts the timer correctly.
- Floating pill in idle state shows no running time.

---

### Fix 2 — Add "Stop Session" Button on Focus Page
**Severity:** 🔴 Critical  
**Files:** `src/app/focus/page.tsx`

**Problem:**  
There is no way to cancel an active session without either (a) marking the task complete or (b) navigating away while the timer silently continues in the background. Users are trapped.

**Change:**  
Add a "Stop" (×) icon button in the auto-hiding header area, next to the "← Tasks" button. Clicking it calls `stopSession()` and navigates to `/tasks`.

```tsx
// Add in the header, left of the Back button or as a third right-side control
{isSessionActive && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      stopSession();
      router.push("/tasks");
    }}
    className="..."
    title="Stop session"
  >
    <StopCircle className="h-3.5 w-3.5" />
    <span>Stop</span>
  </button>
)}
```

**Acceptance Criteria:**
- A "Stop" button is visible in the focus header when a session is active.
- Clicking it calls `stopSession()`, shows toast "Focus session ended", and navigates to `/tasks`.
- The floating Pomodoro pill returns to the idle "Start Focus" state.
- The button auto-hides with the rest of the controls after 2.5s inactivity.

---

### Fix 3 — Checklist Auto-Complete When All Sub-Items Are Done
**Severity:** 🔴 Critical  
**Files:** `src/lib/stores/taskStore.ts`

**Problem:**  
Checking all sub-items in a checklist does not auto-complete the parent task. The user must also click the top-level checkbox — a hidden double-action requirement.

**Change:**  
In the `toggleSubItem` action, after updating the sub-item, check if all sub-items are now `done`. If so, set `task.status = "done"` and `task.updatedAt`.

```ts
toggleSubItem: (taskId, subItemId) => {
  set((state) => ({
    tasks: state.tasks.map((task) => {
      if (task.id !== taskId) return task;
      const updatedSubItems = task.subItems?.map((s) =>
        s.id === subItemId ? { ...s, done: !s.done } : s
      );
      const allDone =
        updatedSubItems?.length > 0 &&
        updatedSubItems.every((s) => s.done);
      return {
        ...task,
        subItems: updatedSubItems,
        status: allDone ? "done" : task.status === "done" ? "scheduled" : task.status,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));
},
```

**Acceptance Criteria:**
- Checking the last remaining sub-item automatically moves the task to the "Completed Today" section.
- Un-checking a sub-item on a completed checklist task moves it back to "To-Do" (not done).
- Counter and Timed tasks are unaffected.

---

### Fix 4 — Counter Task: Progress Bar + Auto-Complete at Target
**Severity:** 🔴 Critical  
**Files:** `src/lib/stores/taskStore.ts`, `src/components/tasks/TaskCard.tsx`, `src/components/tasks/ArchetypeBadge.tsx`

**Problem:**  
(a) `incrementCounter` never checks if `currentCount === targetCount`. The counter keeps accepting `[+1]` clicks past the target indefinitely.  
(b) The TaskCard shows no visual progress for how close the counter is to its target.

**Changes — Part A (Auto-complete):**  
In `taskStore.ts → incrementCounter`, after incrementing, check if the new count meets/exceeds the target. If so, set `status = "done"`.

```ts
incrementCounter: (id) => {
  set((state) => ({
    tasks: state.tasks.map((t) => {
      if (t.id !== id || t.archetype !== "counter") return t;
      const newCount = (t.currentCount || 0) + 1;
      const isComplete = newCount >= (t.targetCount || 1);
      return {
        ...t,
        currentCount: newCount,
        status: isComplete ? "done" : t.status,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));
},
```

**Changes — Part B (Progress bar):**  
In `TaskCard.tsx`, inside the counter section, render a mini progress bar below the title badges:

```tsx
{isCounter && !isDone && (
  <div className="mt-1.5 flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(100, ((task.currentCount || 0) / (task.targetCount || 1)) * 100)}%`,
        }}
      />
    </div>
    <span className="text-[10px] font-mono text-slate-400 shrink-0">
      {task.currentCount || 0}/{task.targetCount || 1} {task.unit || ""}
    </span>
  </div>
)}
```

**Acceptance Criteria:**
- A progress bar appears on counter task cards showing current/target.
- Reaching the target automatically moves the task to "Completed Today".
- The `[+1]` button is hidden once the task is done (already handled by `!isDone` guard).

---

### Fix 5 — Timed Task: Show `completedMinutes` Progress
**Severity:** 🟠 Significant  
**Files:** `src/components/tasks/TaskCard.tsx`

**Problem:**  
The store credits `completedMinutes` via `addTimeToTask` every minute of focused work, but the TaskCard never displays this. Timed tasks show no indication of cumulative focus time.

**Change:**  
Add a progress bar below the title badges on timed task cards showing `completedMinutes / durationMinutes`:

```tsx
{isTimed && (task.completedMinutes || 0) > 0 && (
  <div className="mt-1.5 flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, ((task.completedMinutes || 0) / (task.durationMinutes || 1)) * 100)}%`,
        }}
      />
    </div>
    <span className="text-[10px] font-mono text-slate-400 shrink-0">
      {task.completedMinutes || 0}/{task.durationMinutes || 0}m
    </span>
  </div>
)}
```

**Acceptance Criteria:**
- After focusing on a timed task for ≥1 minute, the card shows a blue progress bar.
- The bar fills proportionally to `completedMinutes / durationMinutes`.
- If `completedMinutes` is 0 or undefined, nothing is rendered (no empty bar).

---

## Wave 2 — Navigation & State Issues

---

### Fix 6 — Weekly Horizon: Use Real Current Day
**Severity:** 🟠 Significant  
**Files:** `src/components/manage/WeeklyHorizonTab.tsx`

**Problem:**  
`const currentDayIndex = 1;` is hardcoded to Tuesday forever.

**Change:**
```ts
// BEFORE
const currentDayIndex = 1;

// AFTER
// getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
// WEEK_DAYS is Mon(0)...Fri(4), so map: Mon=1 → 0, Tue=2 → 1, etc.
const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...
const currentDayIndex = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1; // -1 on weekends
```

**Acceptance Criteria:**
- The correct weekday shows the "Today" badge.
- On Saturday/Sunday no day shows as today (weekend = no "Today" badge).

---

### Fix 7 — Header Subtitle: Show Context-Aware Page Label
**Severity:** 🟠 Significant  
**Files:** `src/components/shell/Header.tsx`

**Problem:**  
The subtitle always says "Today's Focus" regardless of which page you're on.

**Change:**  
Use `usePathname()` to pick the subtitle dynamically:

```tsx
"use client";
import { usePathname } from "next/navigation";

const PAGE_SUBTITLES: Record<string, string> = {
  "/tasks":    "Today's Focus",
  "/manage":   "Planning Engine",
  "/habits":   "Habit Tracker",
  "/reports":  "Analytics",
  "/settings": "Settings",
  "/focus":    "Deep Focus Mode",
};

const pathname = usePathname();
const subtitle = PAGE_SUBTITLES[pathname] ?? "Taskify";
```

**Acceptance Criteria:**
- `/tasks` shows "Today's Focus".
- `/manage` shows "Planning Engine".
- `/habits` shows "Habit Tracker".
- Other pages show their respective labels.

---

### Fix 8 — Full 5-Slot Cap: Explain Why "+ Add Task" is Hidden
**Severity:** 🟡 Minor  
**Files:** `src/app/(dashboard)/tasks/page.tsx`

**Problem:**  
When all 5 slots are taken, the "+ Add Task" button silently disappears with no explanation.

**Change:**  
Replace the hidden button with a small locked-state pill:

```tsx
{todayTasks.length >= 5 ? (
  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-800 text-xs font-semibold">
    <Lock className="h-3.5 w-3.5" />
    <span>5/5 — Day is full</span>
  </div>
) : (
  <button onClick={() => setIsTaskModalOpen(true)} ...>
    + Add Task
  </button>
)}
```

**Acceptance Criteria:**
- When exactly 5 tasks are allocated, a locked amber pill "5/5 — Day is full" replaces the add button.
- Clicking it does nothing (it's informational).
- Below 5 tasks: normal add button.

---

### Fix 9 — Pull from Backlog Should Respect Priority Order
**Severity:** 🟠 Significant  
**Files:** `src/app/(dashboard)/tasks/page.tsx`

**Problem:**  
`stagedTasks[0]` is always pulled regardless of priority. P2 tasks added before P0 tasks get promoted first.

**Change:**

```ts
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2 };

const handlePullFromBacklog = () => {
  if (stagedTasks.length === 0) return;
  const sorted = [...stagedTasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
  moveTaskToToday(sorted[0].id);
};
```

**Acceptance Criteria:**
- If backlog has a P2 task created before a P0 task, pulling always promotes the P0 first.
- Ties within the same priority level pull in creation order (original array order).

---

### Fix 10 — Add "Stop Session" Reset Option on Focus Page (Timer Reset)
**Severity:** 🟡 Minor  
**Files:** `src/app/focus/page.tsx`

**Problem:**  
No way to reset the timer back to its full duration if the user starts the wrong duration or wants to restart cleanly. (Distinct from Fix 2 — this is a *reset*, not a *stop*.)

**Change:**  
Add a small "Reset" button in the auto-hiding header next to the Finish Task button, only visible when session is active. It calls `resetTimer()` from the store (already implemented).

**Acceptance Criteria:**
- A small reset icon button (↺) appears in the focus header when a session is active.
- Clicking it resets `timeLeft` to `focusMinutes * 60` without navigating away.
- The timer stays paused after reset.

---

## Wave 3 — Data Integrity & Task Lifecycle

---

### Fix 11 — Task Delete: Add Undo Toast
**Severity:** 🟠 Significant  
**Files:** `src/components/tasks/TaskCard.tsx`, `src/lib/stores/taskStore.ts`, `src/lib/stores/toastStore.ts`

**Problem:**  
Clicking the trash icon instantly and permanently deletes a task with no confirmation or recovery window.

**Change:**  
Instead of calling `onDelete(task.id)` immediately, hold the deletion for 4 seconds with an undo-able toast:

```tsx
// In TaskCard onDelete handler:
const handleDelete = () => {
  // Optimistically remove from UI:
  onDelete(task.id);
  
  // Show undo toast (toast store needs undo action support OR use a local state trick)
  toast.info(`Deleted: "${task.title}"`, { undoAction: () => onRestore?.(task) });
};
```

> **Note:** This requires either extending `toastStore` to support an undo callback, or implementing a "soft-delete" flag on the task (mark as `cancelled`, then permanently remove after 4s timeout). Soft-delete is simpler.

**Recommended Approach — Soft Delete:**
1. Add `cancelled` status handling already in `TaskStatus` type ✅ (already defined).
2. `onDelete` sets `status = "cancelled"` instead of removing from array.
3. A toast fires: *"Task deleted — Undo"* with an undo button that sets status back to previous.
4. After 4s with no undo, a cleanup removes `cancelled` tasks from the store.

**Acceptance Criteria:**
- Clicking delete shows a toast with an Undo button.
- Clicking Undo within 4 seconds restores the task fully.
- After 4 seconds the task is permanently gone.
- Cancelled tasks are hidden from all list views immediately.

---

### Fix 12 — Backlog: Sort by Priority
**Severity:** 🟠 Significant  
**Files:** `src/components/manage/BacklogTab.tsx`

**Problem:**  
Backlog renders in raw creation order. P0 tasks can be buried under P2 items.

**Change:**

```ts
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2 };

// Sort before rendering:
const sortedTasks = [...tasks].sort(
  (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
);
```

Also add a visual priority group separator between P0, P1, P2 sections.

**Acceptance Criteria:**
- P0 tasks appear first, then P1, then P2.
- Within each priority group, tasks appear in creation order.
- A subtle section header ("P0 — Urgent", etc.) separates the groups when each group has ≥1 item.

---

### Fix 13 — Task Modal Default Scheduling Based on Active Tab
**Severity:** 🟡 Minor  
**Files:** `src/app/(dashboard)/manage/page.tsx`, `src/components/manage/TaskModal.tsx`

**Problem:**  
Opening "Add Task" from the Backlog tab still defaults `isScheduledToday: true`. Users adding from the backlog likely want it staged, not scheduled immediately.

**Change:**  
Pass `defaultScheduleToday` prop to `TaskModal` based on which tab is active:

```tsx
// In manage/page.tsx:
<TaskModal
  isOpen={isModalOpen}
  onClose={...}
  onSave={handleSaveTask}
  taskToEdit={taskToEdit}
  defaultScheduleToday={selectedTab !== "backlog"}
/>
```

**Acceptance Criteria:**
- Opening "Add Task" from the Daily Plan or Weekly Horizon tab: "Schedule for Today" checkbox is **checked** by default.
- Opening from the Backlog tab: "Schedule for Today" checkbox is **unchecked** by default.
- The user can still manually toggle either way.

---

## Wave 4 — Polish & Dead-End States

---

### Fix 14 — Stub Pages: Add Proper "Coming Soon" Empty States
**Severity:** 🟡 Minor  
**Files:** `src/app/(dashboard)/habits/page.tsx`, `src/app/(dashboard)/reports/page.tsx`, `src/app/(dashboard)/settings/page.tsx`

**Problem:**  
All three pages show raw plain text. This destroys trust that the app is complete and intentional.

**Change:**  
Replace plain text with styled empty state components:

```tsx
export default function HabitsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Habit Tracker</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        Track daily habits, build streaks, and reflect weekly.
        Coming in the next sprint.
      </p>
      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
        Sprint 7 & 8
      </span>
    </div>
  );
}
```

Same pattern for Reports and Settings (different icon and description).

**Acceptance Criteria:**
- Each stub page shows a centered icon, title, description, and "Sprint 7 & 8" badge.
- The page looks intentional, not broken.
- No raw text remains.

---

### Fix 15 — Notification Bell: Remove Hardcoded Red Dot
**Severity:** 🟡 Minor  
**Files:** `src/components/shell/Header.tsx`

**Problem:**  
The bell always shows a red badge regardless of real notification state, training users to ignore it.

**Change:**  
Simply remove the `<span>` red dot badge until notifications are implemented:

```tsx
// Remove:
<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-priority-p0-text ring-2 ring-white" />
```

**Acceptance Criteria:**
- The bell icon has no badge dot.
- When real notifications are implemented in Sprint 7, the dot can be restored.

---

## Implementation Order Summary

| Wave | Fix # | Title | Files | Est. Effort |
|------|-------|-------|-------|-------------|
| 1 | Fix 1 | Floating pill: don't start session on nav | `FloatingPomodoro.tsx` | 5 min |
| 1 | Fix 2 | Add Stop Session button on Focus page | `focus/page.tsx` | 15 min |
| 1 | Fix 3 | Checklist auto-complete when all sub-items done | `taskStore.ts` | 15 min |
| 1 | Fix 4 | Counter: progress bar + auto-complete at target | `taskStore.ts`, `TaskCard.tsx` | 30 min |
| 1 | Fix 5 | Timed task: show `completedMinutes` progress | `TaskCard.tsx` | 20 min |
| 2 | Fix 6 | Weekly Horizon: real current day | `WeeklyHorizonTab.tsx` | 5 min |
| 2 | Fix 7 | Header subtitle: context-aware per page | `Header.tsx` | 10 min |
| 2 | Fix 8 | Full capacity: explain why Add Task is hidden | `tasks/page.tsx` | 10 min |
| 2 | Fix 9 | Pull from Backlog: sort by priority | `tasks/page.tsx` | 10 min |
| 2 | Fix 10 | Focus page: add Reset timer button | `focus/page.tsx` | 10 min |
| 3 | Fix 11 | Task delete: undo toast / soft-delete | `TaskCard.tsx`, `taskStore.ts` | 45 min |
| 3 | Fix 12 | Backlog: sort by priority with group headers | `BacklogTab.tsx` | 20 min |
| 3 | Fix 13 | Task modal default schedule based on active tab | `manage/page.tsx`, `TaskModal.tsx` | 10 min |
| 4 | Fix 14 | Stub pages: proper Coming Soon empty states | `habits/`, `reports/`, `settings/` | 20 min |
| 4 | Fix 15 | Remove hardcoded notification red dot | `Header.tsx` | 2 min |

**Total estimated effort: ~3.5 hours**

---

## Status Tracking

| Fix | Status | PR / Commit |
|-----|--------|-------------|
| Fix 1 — Floating pill nav | ✅ Done | — |
| Fix 2 — Stop session button | ✅ Done | — |
| Fix 3 — Checklist auto-complete | ✅ Done | — |
| Fix 4 — Counter progress + auto-complete | ✅ Done | — |
| Fix 5 — Timed progress bar | ✅ Done | — |
| Fix 6 — Weekly day fix | ✅ Done | — |
| Fix 7 — Header subtitle | ✅ Done | — |
| Fix 8 — Full cap message | ✅ Done | — |
| Fix 9 — Backlog pull priority | ✅ Done | — |
| Fix 10 — Timer reset button | ✅ Done | — |
| Fix 11 — Delete undo toast | ✅ Done | — |
| Fix 12 — Backlog sort | ✅ Done | — |
| Fix 13 — Modal default schedule | ✅ Done | — |
| Fix 14 — Stub empty states | ✅ Done | — |
| Fix 15 — Remove red dot | ✅ Done | — |
