import { Task } from "@/types";

/**
 * ─────────────────────────────────────────────────────────────────
 * Demo / Seed Data
 * When you connect Dexie.js (IndexedDB) or a backend,
 * you can empty this array or toggle SEED_DEMO_DATA to false.
 * ─────────────────────────────────────────────────────────────────
 */

export const ENABLE_DEMO_SEED_DATA = true;

const todayStr = new Date().toISOString().split("T")[0];

export const INITIAL_SEED_TASKS: Task[] = [
  {
    id: "task-1",
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
    id: "task-2",
    title: "PR review and deployment checklist",
    archetype: "checklist",
    priority: "P0",
    status: "scheduled",
    subItems: [
      { id: "sub-1", label: "Check unit tests", done: true },
      { id: "sub-2", label: "Verify Vercel preview build", done: false },
      { id: "sub-3", label: "Merge to main", done: false },
    ],
    scheduledDate: todayStr,
    slotIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Deep work: Next.js architecture review",
    archetype: "timed",
    priority: "P1",
    status: "scheduled",
    durationMinutes: 45,
    completedMinutes: 0,
    scheduledDate: todayStr,
    slotIndex: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Read 10 pages of software design patterns",
    archetype: "counter",
    priority: "P2",
    status: "scheduled",
    targetCount: 10,
    currentCount: 0,
    unit: "pages",
    scheduledDate: todayStr,
    slotIndex: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Weekly planning and triage session",
    archetype: "timed",
    priority: "P1",
    status: "staged",
    durationMinutes: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
