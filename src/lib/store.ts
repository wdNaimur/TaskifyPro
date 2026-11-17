import { create } from "zustand";

// ── Pomodoro Timer Modes ─────────────────────────────────────────
export type PomodoroMode = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  completedCycles: number;

  // Actions
  setMode: (mode: PomodoroMode) => void;
  startTimer: (taskId?: string, taskTitle?: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
}

// Standard durations in seconds
export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,       // 25 minutes
  shortBreak: 5 * 60,  // 5 minutes
  longBreak: 15 * 60,  // 15 minutes
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
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
      // Every 4 work sessions, trigger long break
      const nextMode: PomodoroMode = nextCycles % 4 === 0 ? "longBreak" : "shortBreak";
      set({
        mode: nextMode,
        timeLeft: POMODORO_DURATIONS[nextMode],
        isRunning: false,
        completedCycles: nextCycles,
      });
    } else {
      // Break is done, return to work
      set({
        mode: "work",
        timeLeft: POMODORO_DURATIONS.work,
        isRunning: false,
      });
    }
  },
}));

// ── Scratchpad Store (for quick notes) ───────────────────────────
interface ScratchpadState {
  note: string;
  setNote: (note: string) => void;
}

export const useScratchpadStore = create<ScratchpadState>((set) => ({
  note: "",
  setNote: (note: string) => set({ note }),
}));
