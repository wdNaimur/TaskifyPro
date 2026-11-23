import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_USER_SETTINGS } from "@/lib/constants";
import { toast } from "./toastStore";
import { useTaskStore } from "./taskStore";

export type PomodoroMode = "work" | "shortBreak" | "longBreak";

export interface StartSessionOptions {
  taskId?: string | null;
  taskTitle?: string | null;
  focusMinutes?: number;
  breakMinutes?: number;
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

  // Actions
  startSession: (options?: StartSessionOptions) => void;
  stopSession: () => void;
  setFocusMinutes: (minutes: number) => void;
  setBreakMinutes: (minutes: number) => void;
  setActiveTask: (taskId: string | null, taskTitle: string | null) => void;
  adjustTime: (deltaMinutes: number) => void;
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

      startSession: (options = {}) => {
        const targetTaskId = options.taskId !== undefined ? options.taskId : get().activeTaskId;
        const targetTaskTitle = options.taskTitle !== undefined ? options.taskTitle : get().activeTaskTitle;

        // Enforce linking a task to start the Pomodoro
        if (!targetTaskId) {
          toast.warning("Please link a task to start the Pomodoro session!");
          return;
        }

        // Prevent starting focus for a task that is already completed
        const task = useTaskStore.getState().tasks.find((t) => t.id === targetTaskId);
        if (task && task.status === "done") {
          toast.warning("Cannot start focus: task is already completed!");
          return;
        }

        const focusMinutes = options.focusMinutes || get().focusMinutes || DEFAULT_USER_SETTINGS.pomodoroDuration;
        const breakMinutes = options.breakMinutes || get().breakMinutes || DEFAULT_USER_SETTINGS.shortBreak;

        set({
          isSessionActive: true,
          mode: "work",
          isRunning: true,
          activeTaskId: targetTaskId,
          activeTaskTitle: targetTaskTitle || task?.title || null,
          focusMinutes,
          breakMinutes,
          totalParts: 1,
          currentPart: 1,
          timeLeft: focusMinutes * 60,
          elapsedWorkSeconds: 0,
        });

        toast.success(
          targetTaskTitle || task?.title
            ? `Focused on: ${targetTaskTitle || task?.title}`
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

      setFocusMinutes: (minutes: number) => {
        const safeMinutes = Math.max(1, Math.min(180, minutes));
        const { isRunning, isSessionActive } = get();
        set({
          focusMinutes: safeMinutes,
          // If not actively running a session, sync timeLeft to new duration
          timeLeft: !isRunning ? safeMinutes * 60 : get().timeLeft,
        });
      },

      setBreakMinutes: (minutes: number) => {
        const safeMinutes = Math.max(1, Math.min(60, minutes));
        set({ breakMinutes: safeMinutes });
      },

      setActiveTask: (taskId: string | null, taskTitle: string | null) => {
        set({
          activeTaskId: taskId,
          activeTaskTitle: taskTitle,
        });
      },

      adjustTime: (deltaMinutes: number) => {
        const { timeLeft, focusMinutes, mode } = get();
        const nextTime = Math.max(60, timeLeft + deltaMinutes * 60);
        set({
          timeLeft: nextTime,
          focusMinutes: mode === "work" ? Math.max(1, Math.round(nextTime / 60)) : focusMinutes,
        });
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
        const targetTaskId = taskId !== undefined ? taskId : state.activeTaskId;
        if (state.mode === "work" && !targetTaskId) {
          toast.warning("Please link a task to start the Pomodoro session!");
          return;
        }
        if (targetTaskId) {
          const task = useTaskStore.getState().tasks.find((t) => t.id === targetTaskId);
          if (task && task.status === "done") {
            toast.warning("Cannot start focus: task is already completed!");
            return;
          }
        }

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

        // If actively focusing on a task, check if it became done
        if (mode === "work" && activeTaskId) {
          const task = useTaskStore.getState().tasks.find((t) => t.id === activeTaskId);
          if (task && task.status === "done") {
            get().stopSession();
            toast.info("Task completed! Focus session ended.");
            return;
          }

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
                ? `🎉 Completed focus on: ${activeTaskTitle}!`
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
