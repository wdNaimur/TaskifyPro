import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_USER_SETTINGS } from "@/lib/constants";
import { toast } from "./toastStore";
import { useTaskStore } from "./taskStore";

export type PomodoroMode = "work" | "shortBreak" | "longBreak";

export interface LauncherInitialData {
  taskId?: string | null;
  taskTitle?: string | null;
  durationMinutes?: number;
}

export interface FocusSessionConfig {
  taskId?: string | null;
  taskTitle?: string | null;
  focusMinutes: number;
  breakMinutes: number;
  totalParts: number;
}

interface PomodoroState {
  // Session Configuration & State
  isSessionActive: boolean;
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  focusMinutes: number;
  breakMinutes: number;
  totalParts: number;
  currentPart: number;
  completedCycles: number;
  elapsedWorkSeconds: number;

  // Launcher Modal State
  isLauncherOpen: boolean;
  launcherInitialData: LauncherInitialData | null;

  // Actions
  openLauncher: (initialData?: LauncherInitialData) => void;
  closeLauncher: () => void;
  startSession: (config: FocusSessionConfig) => void;
  stopSession: () => void;
  setMode: (mode: PomodoroMode) => void;
  startTimer: (taskId?: string, taskTitle?: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // Defaults
      isSessionActive: false,
      mode: "work",
      timeLeft: DEFAULT_USER_SETTINGS.pomodoroDuration * 60,
      isRunning: false,
      activeTaskId: null,
      activeTaskTitle: null,
      focusMinutes: DEFAULT_USER_SETTINGS.pomodoroDuration,
      breakMinutes: DEFAULT_USER_SETTINGS.shortBreak,
      totalParts: 1,
      currentPart: 1,
      completedCycles: 0,
      elapsedWorkSeconds: 0,

      // Modal state
      isLauncherOpen: false,
      launcherInitialData: null,

      openLauncher: (initialData) => {
        set({
          isLauncherOpen: true,
          launcherInitialData: initialData || null,
        });
      },

      closeLauncher: () => {
        set({
          isLauncherOpen: false,
          launcherInitialData: null,
        });
      },

      startSession: (config) => {
        set({
          isSessionActive: true,
          mode: "work",
          isRunning: true,
          activeTaskId: config.taskId || null,
          activeTaskTitle: config.taskTitle || null,
          focusMinutes: config.focusMinutes,
          breakMinutes: config.breakMinutes,
          totalParts: config.totalParts,
          currentPart: 1,
          timeLeft: config.focusMinutes * 60,
          elapsedWorkSeconds: 0,
          isLauncherOpen: false,
          launcherInitialData: null,
        });
        toast.success(
          config.taskTitle
            ? `Started Focus on: ${config.taskTitle}`
            : "Focus session started!"
        );
      },

      stopSession: () => {
        const { mode, activeTaskId, elapsedWorkSeconds } = get();
        // Credit remaining accumulated seconds if >= 30
        if (mode === "work" && activeTaskId && elapsedWorkSeconds >= 30) {
          useTaskStore.getState().addTimeToTask(activeTaskId, 1);
        }

        set({
          isSessionActive: false,
          isRunning: false,
          mode: "work",
          activeTaskId: null,
          activeTaskTitle: null,
          currentPart: 1,
          timeLeft: get().focusMinutes * 60,
          elapsedWorkSeconds: 0,
        });
        toast.info("Focus session ended");
      },

      setMode: (mode: PomodoroMode) => {
        const { focusMinutes, breakMinutes } = get();
        const duration =
          mode === "work"
            ? focusMinutes * 60
            : mode === "shortBreak"
            ? breakMinutes * 60
            : DEFAULT_USER_SETTINGS.longBreak * 60;

        set({
          mode,
          timeLeft: duration,
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
        const { mode, focusMinutes, breakMinutes } = get();
        const duration =
          mode === "work"
            ? focusMinutes * 60
            : breakMinutes * 60;

        set({
          timeLeft: duration,
          isRunning: false,
        });
      },

      tick: () => {
        const { timeLeft, isRunning, mode, activeTaskId, elapsedWorkSeconds, completeSession } = get();
        if (!isRunning) return;

        // If actively focusing on a task, credit 1 minute for every 60 seconds
        if (mode === "work" && activeTaskId) {
          const nextElapsed = (elapsedWorkSeconds || 0) + 1;
          if (nextElapsed >= 60) {
            useTaskStore.getState().addTimeToTask(activeTaskId, 1);
            set({ elapsedWorkSeconds: 0 });
          } else {
            set({ elapsedWorkSeconds: nextElapsed });
          }
        }

        if (timeLeft <= 1) {
          completeSession();
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      completeSession: () => {
        const {
          mode,
          activeTaskId,
          elapsedWorkSeconds,
          currentPart,
          totalParts,
          focusMinutes,
          breakMinutes,
          completedCycles,
          activeTaskTitle,
        } = get();

        // Credit remaining accumulated seconds if >= 30
        if (mode === "work" && activeTaskId && elapsedWorkSeconds >= 30) {
          useTaskStore.getState().addTimeToTask(activeTaskId, 1);
        }

        if (mode === "work") {
          // If we have more parts left to do
          if (currentPart < totalParts) {
            set({
              mode: "shortBreak",
              timeLeft: breakMinutes * 60,
              isRunning: false,
              elapsedWorkSeconds: 0,
            });
            toast.success(
              `Interval ${currentPart} of ${totalParts} complete! Take a ${breakMinutes} min break.`
            );
          } else {
            // All parts complete!
            set({
              isSessionActive: false,
              isRunning: false,
              mode: "work",
              timeLeft: focusMinutes * 60,
              elapsedWorkSeconds: 0,
              completedCycles: completedCycles + 1,
            });
            toast.success(
              activeTaskTitle
                ? `🎉 Completed all parts for: ${activeTaskTitle}!`
                : "🎉 Focus session complete! Fantastic work."
            );
          }
        } else {
          // Break finished -> switch to next work part
          const nextPart = currentPart + 1;
          set({
            mode: "work",
            timeLeft: focusMinutes * 60,
            currentPart: nextPart,
            isRunning: false,
            elapsedWorkSeconds: 0,
          });
          toast.info(`Break finished. Ready for Focus Part ${nextPart} of ${totalParts}!`);
        }
      },
    }),
    {
      name: "taskify-pomodoro-storage",
      partialize: (state) => ({
        isSessionActive: state.isSessionActive,
        mode: state.mode,
        completedCycles: state.completedCycles,
        activeTaskId: state.activeTaskId,
        activeTaskTitle: state.activeTaskTitle,
        focusMinutes: state.focusMinutes,
        breakMinutes: state.breakMinutes,
        totalParts: state.totalParts,
        currentPart: state.currentPart,
        timeLeft: state.timeLeft,
      }),
    }
  )
);
