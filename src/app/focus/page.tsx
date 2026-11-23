"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle2, Maximize2, Minimize2, StopCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { usePomodoroTicker } from "@/lib/hooks/usePomodoroTicker";
import { FocusSetupScreen, VisualizerMode } from "@/components/focus/FocusSetupScreen";
import { FloatVisualizer } from "@/components/focus/screens/FloatVisualizer";
import { ForestVisualizer } from "@/components/focus/screens/ForestVisualizer";
import { cn } from "@/lib/utils";

export default function FocusPage() {
  const router = useRouter();

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
    resetTimer,
    setFocusMinutes,
    setBreakMinutes,
    setActiveTask,
  } = usePomodoroStore();

  const { tasks, toggleTaskDone } = useTaskStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Preferred visualizer mode ("float" | "forest")
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("float");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Restore user's preferred visualizer mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taskify_focus_screen_mode");
      if (saved === "float" || saved === "forest") {
        setVisualizerMode(saved as VisualizerMode);
      }
    } catch {
      // LocalStorage access fallback
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

  // Prevent focus on a completed task: if the active task becomes done, stop session cleanly
  useEffect(() => {
    if (isSessionActive && activeTaskId) {
      const current = tasks.find((t) => t.id === activeTaskId);
      if (current && current.status === "done") {
        stopSession();
      }
    }
  }, [isSessionActive, activeTaskId, tasks, stopSession]);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Inactivity auto-hide timer (2.5 seconds) - hides header during active session
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  useEffect(() => {
    if (!isRunning || !isSessionActive) {
      setIsControlsVisible(true);
      return;
    }

    let timer: NodeJS.Timeout;

    const handleActivity = () => {
      setIsControlsVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    };

    handleActivity();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [isRunning, isSessionActive]);

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

  // Break down timeLeft into hours, minutes, and seconds for visualizers
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Progress ratio calculation
  const totalSeconds = (mode === "work" ? focusMinutes : breakMinutes) * 60;
  const progressRatio = totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / totalSeconds)) : 0;

  return (
    <div
      onClick={() => {
        // Clicking canvas during active immersion pauses / resumes timer
        if (isSessionActive) {
          isRunning ? pauseTimer() : startTimer();
        }
      }}
      className={cn(
        "relative h-screen w-screen flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden transition-colors duration-700",
        !isSessionActive ? "bg-[#F5F6F8] text-slate-800" : "bg-black text-white cursor-pointer",
        !isControlsVisible && isRunning && "cursor-none"
      )}
    >
      {/* ── Top Bar (Back button, Screen switcher, Fullscreen) ──────── */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-30 flex items-center justify-between w-full transition-opacity duration-500 cursor-default",
          !isControlsVisible && isRunning ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {/* Left: Back to Tasks */}
        <button
          onClick={() => router.push("/tasks")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
            !isSessionActive
              ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
              : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5 backdrop-blur-md"
          )}
          title="Back to Tasks"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Tasks</span>
        </button>

        {/* Center: When session active, display Task Title & Visualizer switcher */}
        {isSessionActive ? (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => handleModeChange("float")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                visualizerMode === "float"
                  ? "bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <span>🫧</span>
              <span>Float</span>
            </button>

            <button
              onClick={() => handleModeChange("forest")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                visualizerMode === "forest"
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <span>🌲</span>
              <span>Forest</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Focus Setup &amp; Configuration
            </span>
          </div>
        )}

        {/* Right: In-Session Controls + Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Reset timer back to full duration */}
          {isSessionActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetTimer();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5 cursor-pointer backdrop-blur-md"
              title="Reset timer to full duration"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Finish task */}
          {isSessionActive && activeTaskId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskDone(activeTaskId);
                stopSession();
                router.push("/tasks");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Finish Task</span>
            </button>
          )}

          {/* Stop session & return to setup dialer */}
          {isSessionActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopSession();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
              title="Stop session and return to setup"
            >
              <StopCircle className="h-3.5 w-3.5" />
              <span>Stop</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className={cn(
              "p-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
              !isSessionActive
                ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
                : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/5 backdrop-blur-md"
            )}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* ── Main Canvas ────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto w-full">
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
                onSelectTask={(task) => {
                  setActiveTask(task ? task.id : null, task ? task.title : null);
                }}
                focusMinutes={focusMinutes}
                onFocusMinutesChange={(mins) => setFocusMinutes(mins)}
                breakMinutes={breakMinutes}
                onBreakMinutesChange={(mins) => setBreakMinutes(mins)}
                visualizerMode={visualizerMode}
                onVisualizerModeChange={handleModeChange}
                onStartFocus={() => {
                  startSession({
                    taskId: activeTaskId,
                    taskTitle: activeTaskTitle,
                    focusMinutes,
                    breakMinutes,
                  });
                }}
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
              className="flex flex-col items-center justify-center w-full"
            >
              {/* Task Title Banner */}
              <div className="mb-4 sm:mb-8 text-center max-w-lg px-4">
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/50 truncate">
                  {activeTask?.title || activeTaskTitle || "Deep Focus"}
                </p>
              </div>

              {/* Chosen Visualizer */}
              {visualizerMode === "float" && (
                <FloatVisualizer timeLeft={timeLeft} isRunning={isRunning} />
              )}

              {visualizerMode === "forest" && (
                <ForestVisualizer
                  formattedTime={formattedTime}
                  progressRatio={progressRatio}
                  mode={mode}
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

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 h-6 flex items-center justify-center pointer-events-none">
        {/* Distraction-free clean footer */}
      </footer>
    </div>
  );
}
