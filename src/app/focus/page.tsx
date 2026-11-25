"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { toast } from "@/lib/stores/toastStore";
import { usePomodoroTicker } from "@/lib/hooks/usePomodoroTicker";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { useInactivityFade } from "@/lib/hooks/useInactivityFade";
import { useDeskClockMode } from "@/lib/hooks/useDeskClockMode";
import { FocusSetupScreen, VisualizerMode } from "@/components/focus/FocusSetupScreen";
import { FloatVisualizer } from "@/components/focus/screens/FloatVisualizer";
import { ForestVisualizer } from "@/components/focus/screens/ForestVisualizer";
import { FocusActiveHeader } from "@/components/focus/FocusActiveHeader";
import { TaskModal } from "@/components/manage/TaskModal";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2 };

export default function FocusPage() {
  // Run global timer ticker
  usePomodoroTicker();

  const {
    isSessionActive,
    mode,
    timeLeft,
    focusMinutes,
    breakMinutes,
    isRunning,
    activeTaskId,
    activeTaskTitle,
    startSession,
    startTimer,
    pauseTimer,
    stopSession,
    setFocusMinutes,
    setBreakMinutes,
    setActiveTask,
  } = usePomodoroStore();

  const { tasks } = useTaskStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const { settings } = useSettingsStore();

  // Visualizer preference ("float" | "forest")
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("float");
  const [hasTaskError, setHasTaskError] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Custom Hooks
  const { isFullscreen, isRotated, toggleFullscreen, toggleScreenRotation } = useDeskClockMode();
  const isControlsVisible = useInactivityFade(isSessionActive && isRunning, 2500);

  // Screen Wake Lock: keeps display awake on mobile during immersion
  const { isActive: isWakeLockActive, request: requestWakeLock, release: releaseWakeLock } = useWakeLock(
    (isSessionActive || isRunning) && settings.keepScreenAwake !== false
  );

  // Auto-select highest-priority pending task if none selected or if active task was completed
  useEffect(() => {
    const isCurrentActiveValid = activeTaskId && tasks.some((t) => t.id === activeTaskId && t.status !== "done");
    if (!isCurrentActiveValid && tasks.length > 0) {
      const pendingTasks = tasks.filter((t) => t.status !== "done");
      if (pendingTasks.length > 0) {
        const sorted = [...pendingTasks].sort(
          (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
        );
        const bestTask = sorted[0];
        setActiveTask(bestTask.id, bestTask.title);
        if (bestTask.durationMinutes && !isSessionActive) {
          setFocusMinutes(bestTask.durationMinutes);
        }
      }
    }
  }, [activeTaskId, tasks, isSessionActive, setActiveTask, setFocusMinutes]);

  // Restore user's preferred visualizer mode from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taskify_focus_screen_mode");
      if (saved === "float" || saved === "forest") {
        setVisualizerMode(saved as VisualizerMode);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleModeChange = (newMode: VisualizerMode) => {
    setVisualizerMode(newMode);
    try {
      localStorage.setItem("taskify_focus_screen_mode", newMode);
    } catch {
      // Ignore
    }
  };

  // Prevent focus on a completed task: stop session cleanly if task becomes done
  useEffect(() => {
    if (isSessionActive && activeTaskId) {
      const current = tasks.find((t) => t.id === activeTaskId);
      if (current && current.status === "done") {
        stopSession();
      }
    }
  }, [isSessionActive, activeTaskId, tasks, stopSession]);

  // Spacebar to pause/resume during active session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && isSessionActive) {
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSessionActive, isRunning, pauseTimer, startTimer]);

  const handleStartFocus = () => {
    if (!activeTaskId) {
      setHasTaskError(true);
      toast.warning("Please link a task before starting your Pomodoro session!");
      return;
    }
    setHasTaskError(false);
    startSession({
      taskId: activeTaskId,
      taskTitle: activeTaskTitle,
      focusMinutes,
      breakMinutes,
    });
  };

  // Quick task creation directly from Focus setup
  const handleCreateTaskFromFocus = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    useTaskStore.setState((state) => ({ tasks: [newTask, ...state.tasks] }));
    setActiveTask(newTask.id, newTask.title);
    if (newTask.durationMinutes) {
      setFocusMinutes(newTask.durationMinutes);
    }
    setIsTaskModalOpen(false);
    setHasTaskError(false);
    toast.success(`Created & linked: ${newTask.title}`);
  };

  // Break down timeLeft for visualizers
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalSeconds = (mode === "work" ? focusMinutes : breakMinutes) * 60;
  const progressRatio = totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / totalSeconds)) : 0;

  return (
    <div
      onClick={() => {
        // Clicking canvas during active immersion pauses / resumes timer
        if (isSessionActive) {
          if (isRunning) {
            pauseTimer();
          } else {
            startTimer();
          }
        }
      }}
      style={
        isRotated
          ? {
              transform: "rotate(90deg)",
              transformOrigin: "center center",
              width: "100vh",
              height: "100vw",
              position: "fixed",
              top: "50%",
              left: "50%",
              marginTop: "-50vw",
              marginLeft: "-50vh",
              zIndex: 50,
            }
          : undefined
      }
      className={cn(
        "relative h-screen w-screen flex flex-col justify-between select-none overflow-hidden transition-all duration-500",
        !isSessionActive
          ? "bg-[#F5F6F8] text-slate-800 p-6 sm:p-10"
          : "bg-black text-white cursor-pointer p-0",
        !isControlsVisible && isRunning && "cursor-none"
      )}
    >
      {/* ── Top Bar Overlay (Extracted Modular Header) ───────────────── */}
      <FocusActiveHeader
        visualizerMode={visualizerMode}
        onVisualizerModeChange={handleModeChange}
        isControlsVisible={isControlsVisible}
        isRotated={isRotated}
        onToggleRotation={toggleScreenRotation}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isWakeLockActive={isWakeLockActive}
        onRequestWakeLock={requestWakeLock}
        onReleaseWakeLock={releaseWakeLock}
      />

      {/* ── Main Canvas ────────────────────────────────────────────── */}
      <main
        className={cn(
          "relative z-10 flex flex-col items-center justify-center my-auto w-full",
          isSessionActive ? "h-screen p-4 sm:p-8" : "w-full"
        )}
      >
        <AnimatePresence mode="wait">
          {!isSessionActive ? (
            /* ── STAGE 1: Setup Screen (Dialer, Priority Dropdown, Break Selector) ── */
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center"
            >
              <FocusSetupScreen
                tasks={tasks}
                activeTaskId={activeTaskId}
                activeTaskTitle={activeTaskTitle}
                hasTaskError={hasTaskError}
                onSelectTask={(task) => {
                  setActiveTask(task ? task.id : null, task ? task.title : null);
                  setHasTaskError(false);
                }}
                onAddNewTask={() => setIsTaskModalOpen(true)}
                focusMinutes={focusMinutes}
                onFocusMinutesChange={(mins) => setFocusMinutes(mins)}
                breakMinutes={breakMinutes}
                onBreakMinutesChange={(mins) => setBreakMinutes(mins)}
                visualizerMode={visualizerMode}
                onVisualizerModeChange={handleModeChange}
                onStartFocus={handleStartFocus}
                onResetDefaults={() => {
                  setFocusMinutes(25);
                  setBreakMinutes(5);
                }}
              />
            </motion.div>
          ) : (
            /* ── STAGE 2: Active Focus Immersion Screen (Float / Forest / Standby) ── */
            <motion.div
              key="immersion-screen"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              {/* Task Title Banner (Auto-hides with controls) */}
              <div
                className={cn(
                  "absolute top-14 sm:top-20 inset-x-0 text-center max-w-lg mx-auto px-4 pointer-events-none transition-all duration-500",
                  !isControlsVisible && isRunning ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/50 truncate">
                  {activeTask?.title || activeTaskTitle || "Deep Focus"}
                </p>
              </div>

              {/* Chosen Visualizer */}
              {visualizerMode === "float" && (
                <FloatVisualizer
                  timeLeft={timeLeft}
                  isRunning={isRunning}
                  isControlsVisible={isControlsVisible}
                  isRotated={isRotated}
                />
              )}

              {visualizerMode === "forest" && (
                <ForestVisualizer
                  formattedTime={formattedTime}
                  progressRatio={progressRatio}
                  mode={mode}
                  isRotated={isRotated}
                />
              )}

              {/* Paused Indicator Overlay */}
              <AnimatePresence>
                {!isRunning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-semibold backdrop-blur-md"
                  >
                    PAUSED • Tap anywhere or press Space to resume
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Quick Create Task Modal ──────────────────────────────────── */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTaskFromFocus}
        defaultScheduleToday
      />
    </div>
  );
}
