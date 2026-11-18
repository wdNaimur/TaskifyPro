import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PomodoroMode = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  completedCycles: number;

  setMode: (mode: PomodoroMode) => void;
  startTimer: (taskId?: string, taskTitle?: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
}

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: "work",
      timeLeft: POMODORO_DURATIONS.work,
      isRunning: false,
      activeTaskId: null,
      activeTaskTitle: null,
      completedCycles: 0,

      setMode: (mode: PomodoroMode) => {
        set({
          mode,
          timeLeft: POMODORO_DURATIONS[mode],
          isRunning: false,
        });
      },

      startTimer: (taskId?: string, taskTitle?: string) => {
        const state = get();
        set({
          isRunning: true,
          activeTaskId: taskId !== undefined ? taskId : state.activeTaskId,
          activeTaskTitle: taskTitle !== undefined ? taskTitle : state.activeTaskTitle,
        });
      },

      pauseTimer: () => {
        set({ isRunning: false });
      },

      resetTimer: () => {
        const { mode } = get();
        set({
          timeLeft: POMODORO_DURATIONS[mode],
          isRunning: false,
        });
      },

      tick: () => {
        const { timeLeft, isRunning, completeSession } = get();
        if (!isRunning) return;

        if (timeLeft <= 1) {
          completeSession();
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      completeSession: () => {
        const { mode, completedCycles } = get();
        if (mode === "work") {
          const nextCycles = completedCycles + 1;
          const nextMode: PomodoroMode = nextCycles % 4 === 0 ? "longBreak" : "shortBreak";
          set({
            mode: nextMode,
            timeLeft: POMODORO_DURATIONS[nextMode],
            isRunning: false,
            completedCycles: nextCycles,
          });
        } else {
          set({
            mode: "work",
            timeLeft: POMODORO_DURATIONS.work,
            isRunning: false,
          });
        }
      },
    }),
    {
      name: "taskify-pomodoro-storage",
      // Only persist mode and completed cycles, reset isRunning to false on reload
      partialize: (state) => ({
        mode: state.mode,
        completedCycles: state.completedCycles,
        activeTaskId: state.activeTaskId,
        activeTaskTitle: state.activeTaskTitle,
      }),
    }
  )
);
