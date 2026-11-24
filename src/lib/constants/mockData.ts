import { Task } from "@/types";

/**
 * ─────────────────────────────────────────────────────────────────
 * Demo / Seed Data & Development Test Suite
 * ─────────────────────────────────────────────────────────────────
 */

export const ENABLE_DEMO_SEED_DATA = false;

/**
 * Generates fresh test tasks with dynamic current dates.
 * Covers all archetypes: counter, checklist, timed, and staged backlog tasks.
 */
export function createDevTestTasks(): Task[] {
  const todayStr = typeof window !== "undefined"
    ? new Date().toISOString().split("T")[0]
    : "2026-11-24";

  return [
    {
      id: `task-dev-counter-${Date.now()}`,
      title: "Drink 5 glasses of water",
      archetype: "counter",
      priority: "P1",
      status: "scheduled",
      targetCount: 5,
      currentCount: 2,
      unit: "glasses",
      scheduledDate: todayStr,
      slotIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task-dev-checklist-${Date.now()}`,
      title: "PR review and deployment checklist",
      archetype: "checklist",
      priority: "P0",
      status: "scheduled",
      subItems: [
        { id: "sub-1", label: "Check unit tests and linting", done: true },
        { id: "sub-2", label: "Verify Vercel production build", done: false },
        { id: "sub-3", label: "Inspect confetti celebration", done: false },
      ],
      scheduledDate: todayStr,
      slotIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task-dev-timed-${Date.now()}`,
      title: "Deep work: System architecture review",
      archetype: "timed",
      priority: "P1",
      status: "scheduled",
      durationMinutes: 25,
      completedMinutes: 10,
      scheduledDate: todayStr,
      slotIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task-dev-backlog-p0-${Date.now()}`,
      title: "Critical: Database connection pool optimization",
      archetype: "checklist",
      priority: "P0",
      status: "staged",
      subItems: [
        { id: "sub-b1", label: "Audit slow queries", done: false },
        { id: "sub-b2", label: "Add composite index", done: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `task-dev-backlog-p2-${Date.now()}`,
      title: "Routine: Update dependencies and documentation",
      archetype: "timed",
      priority: "P2",
      status: "staged",
      durationMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export const INITIAL_SEED_TASKS: Task[] = [];
