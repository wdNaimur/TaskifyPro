import { create } from "zustand";
import { Task, TaskArchetype, Priority, TaskStatus } from "@/types";

interface TaskState {
  tasks: Task[];
  selectedTab: "daily" | "weekly" | "backlog";
  setSelectedTab: (tab: "daily" | "weekly" | "backlog") => void;

  // CRUD Operations
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
}

// Initial demo tasks so the app has realistic content right out of the box
const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Review Sprint Architecture & Layout",
    archetype: "pomodoro",
    priority: "P0",
    status: "scheduled",
    pomodoroCount: 2,
    scheduledDate: new Date().toISOString().split("T")[0],
    slotIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Reply to team design feedback",
    archetype: "quick-check",
    priority: "P1",
    status: "scheduled",
    subItems: [
      { id: "sub-1", label: "Check Figma comments", done: true },
      { id: "sub-2", label: "Send summary on Slack", done: false },
    ],
    scheduledDate: new Date().toISOString().split("T")[0],
    slotIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Configure Tailwind liquid glass tokens",
    archetype: "short",
    priority: "P1",
    status: "done",
    durationMinutes: 30,
    scheduledDate: new Date().toISOString().split("T")[0],
    slotIndex: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Mobile navigation drawer edge-case tests",
    archetype: "short",
    priority: "P2",
    status: "scheduled",
    durationMinutes: 20,
    scheduledDate: new Date().toISOString().split("T")[0],
    slotIndex: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Quarterly Roadmapping & Feature Specs",
    archetype: "epic",
    priority: "P1",
    status: "staged",
    milestones: ["Auth Flow Spec", "Reports Engine", "IndexedDB Offline Sync"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskState>((set) => ({
  tasks: INITIAL_TASKS,
  selectedTab: "daily",
  setSelectedTab: (tab) => set({ selectedTab: tab }),

  addTask: (newTaskData) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  toggleTaskDone: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === id) {
          const nextStatus: TaskStatus = task.status === "done" ? "scheduled" : "done";
          return {
            ...task,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      }),
    }));
  },
}));
