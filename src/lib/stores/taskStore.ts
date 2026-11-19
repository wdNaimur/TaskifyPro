import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus } from "@/types";
import { INITIAL_SEED_TASKS, ENABLE_DEMO_SEED_DATA } from "@/lib/constants";

interface TaskState {
  tasks: Task[];
  selectedTab: "daily" | "weekly" | "backlog";
  setSelectedTab: (tab: "daily" | "weekly" | "backlog") => void;

  // CRUD Operations
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
  toggleSubItem: (taskId: string, subItemId: string) => void;
  moveTaskToToday: (id: string) => void;
  incrementCounter: (id: string) => void;
  addTimeToTask: (id: string, minutes: number) => void;
  resetToSeedData: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: ENABLE_DEMO_SEED_DATA ? INITIAL_SEED_TASKS : [],
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

      toggleSubItem: (taskId, subItemId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId && task.subItems) {
              const nextSubItems = task.subItems.map((sub) =>
                sub.id === subItemId ? { ...sub, done: !sub.done } : sub
              );
              return {
                ...task,
                subItems: nextSubItems,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          }),
        }));
      },

      moveTaskToToday: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "scheduled",
                  scheduledDate: new Date().toISOString().split("T")[0],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      incrementCounter: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id && task.archetype === "counter") {
              const current = task.currentCount || 0;
              const target = task.targetCount || 1;
              const nextCount = Math.min(target, current + 1);
              const isNowDone = nextCount >= target;

              return {
                ...task,
                currentCount: nextCount,
                status: isNowDone ? "done" : task.status,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          }),
        }));
      },

      addTimeToTask: (id, minutes) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id && task.archetype === "timed") {
              const prevCompleted = task.completedMinutes || 0;
              const newCompleted = Math.max(0, prevCompleted + minutes);
              const target = task.durationMinutes || 0;
              const isNowDone = target > 0 && newCompleted >= target;

              return {
                ...task,
                completedMinutes: newCompleted,
                status: isNowDone ? "done" : task.status,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          }),
        }));
      },

      resetToSeedData: () => {
        set({ tasks: INITIAL_SEED_TASKS });
      },
    }),
    {
      name: "taskify-tasks-storage",
    }
  )
);
