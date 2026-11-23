import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit, HabitLogEntry, HabitType } from "@/types";
import { useToastStore } from "./toastStore";

export interface WeeklyReflection {
  weekKey: string; // e.g. "2026-W47"
  wins: string;
  friction: string;
  nextFocus: string;
  updatedAt: string;
}

interface HabitState {
  habits: Habit[];
  logs: Record<string, HabitLogEntry>; // Key: `${habitId}_${date}`
  reflections: Record<string, WeeklyReflection>; // Key: weekKey

  // Actions
  addHabit: (data: Omit<Habit, "id" | "streak" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (habitId: string, date: string, targetValue?: number) => void;
  incrementHabitDayValue: (habitId: string, date: string, delta: number, targetValue?: number) => void;
  saveReflection: (weekKey: string, updates: Partial<WeeklyReflection>) => void;
}

// Calculate consecutive-day streak ending today or yesterday
function calculateStreak(habitId: string, logs: Record<string, HabitLogEntry>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getLogDone = (d: Date): boolean => {
    const key = `${habitId}_${d.toISOString().split("T")[0]}`;
    return !!logs[key]?.done;
  };

  let count = 0;
  const cursor = new Date(today);

  // If today is completed, streak includes today
  const todayDone = getLogDone(cursor);
  if (todayDone) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // If today is not done yet, streak can still be intact if yesterday was done
    cursor.setDate(cursor.getDate() - 1);
    if (!getLogDone(cursor)) {
      return 0;
    }
  }

  // Count backwards
  while (getLogDone(cursor)) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

const INITIAL_HABITS: Habit[] = [
  {
    id: "habit-1",
    title: "Morning Hydration",
    type: "quantitative",
    targetValue: 8,
    unit: "glasses",
    streak: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: "habit-2",
    title: "Daily Mindful Walk",
    type: "timed",
    targetValue: 20,
    unit: "min",
    streak: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "habit-3",
    title: "Zero Inbox & Clear Desk",
    type: "binary",
    streak: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "habit-4",
    title: "Weekly Review & Reflection",
    type: "reflection",
    streak: 2,
    createdAt: new Date().toISOString(),
  },
];

// Helper to pre-populate seed logs for the current week
function generateInitialLogs(): Record<string, HabitLogEntry> {
  const logs: Record<string, HabitLogEntry> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Past 6 days
  for (let i = 1; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Seed habit-1 (Hydration)
    logs[`habit-1_${dateStr}`] = {
      id: `log-h1-${dateStr}`,
      habitId: "habit-1",
      date: dateStr,
      done: true,
      value: 8,
    };

    // Seed habit-2 (Walk) - every other day
    if (i % 2 === 0) {
      logs[`habit-2_${dateStr}`] = {
        id: `log-h2-${dateStr}`,
        habitId: "habit-2",
        date: dateStr,
        done: true,
        value: 20,
      };
    }

    // Seed habit-3 (Zero Inbox)
    logs[`habit-3_${dateStr}`] = {
      id: `log-h3-${dateStr}`,
      habitId: "habit-3",
      date: dateStr,
      done: true,
    };
  }

  return logs;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: INITIAL_HABITS,
      logs: generateInitialLogs(),
      reflections: {},

      addHabit: (data) => {
        const newHabit: Habit = {
          ...data,
          id: `habit-${Date.now()}`,
          streak: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        useToastStore.getState().addToast(`Habit "${newHabit.title}" created`, "success");
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHabit: (id) => {
        const target = get().habits.find((h) => h.id === id);
        if (!target) return;

        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));

        useToastStore.getState().addToast(`Deleted habit "${target.title}"`, "info", {
          label: "Undo",
          onClick: () => {
            set((state) => ({ habits: [target, ...state.habits] }));
          },
        });
      },

      toggleHabitDay: (habitId, date, targetValue = 1) => {
        const key = `${habitId}_${date}`;
        const currentLog = get().logs[key];
        const nextDone = !currentLog?.done;

        const updatedLogs = {
          ...get().logs,
          [key]: {
            id: currentLog?.id || `log-${habitId}-${date}`,
            habitId,
            date,
            done: nextDone,
            value: nextDone ? targetValue : 0,
          },
        };

        const newStreak = calculateStreak(habitId, updatedLogs);

        set((state) => ({
          logs: updatedLogs,
          habits: state.habits.map((h) => (h.id === habitId ? { ...h, streak: newStreak } : h)),
        }));
      },

      incrementHabitDayValue: (habitId, date, delta, targetValue = 1) => {
        const key = `${habitId}_${date}`;
        const currentLog = get().logs[key];
        const currentValue = currentLog?.value || 0;
        const nextValue = Math.max(0, currentValue + delta);
        const nextDone = nextValue >= targetValue;

        const updatedLogs = {
          ...get().logs,
          [key]: {
            id: currentLog?.id || `log-${habitId}-${date}`,
            habitId,
            date,
            done: nextDone,
            value: nextValue,
          },
        };

        const newStreak = calculateStreak(habitId, updatedLogs);

        set((state) => ({
          logs: updatedLogs,
          habits: state.habits.map((h) => (h.id === habitId ? { ...h, streak: newStreak } : h)),
        }));
      },

      saveReflection: (weekKey, updates) => {
        set((state) => {
          const current = state.reflections[weekKey] || {
            weekKey,
            wins: "",
            friction: "",
            nextFocus: "",
            updatedAt: new Date().toISOString(),
          };

          return {
            reflections: {
              ...state.reflections,
              [weekKey]: {
                ...current,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
        useToastStore.getState().addToast("Reflection saved", "success");
      },
    }),
    {
      name: "taskify-habit-storage",
    }
  )
);
