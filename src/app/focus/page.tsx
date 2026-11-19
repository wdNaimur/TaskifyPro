"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle2, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { usePomodoroTicker } from "@/lib/hooks/usePomodoroTicker";
import { FloatVisualizer } from "@/components/focus/screens/FloatVisualizer";
import { ForestVisualizer } from "@/components/focus/screens/ForestVisualizer";
import { StandByVisualizer } from "@/components/focus/screens/StandByVisualizer";
import { cn } from "@/lib/utils";

type FocusScreenMode = "float" | "forest" | "standby";

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
  } = usePomodoroStore();

  const { tasks, toggleTaskDone } = useTaskStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const pendingTodayTasks = tasks.filter((t) => t.status !== "staged" && t.status !== "done");

  // Screen Visualizer Mode ("float" | "forest" | "standby")
  const [screenMode, setScreenMode] = useState<FocusScreenMode>("float");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Restore user's preferred visualizer mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taskify_focus_screen_mode");
      if (saved === "float" || saved === "forest" || saved === "standby") {
        setScreenMode(saved);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const handleModeChange = (newMode: FocusScreenMode) => {
    setScreenMode(newMode);
    try {
      localStorage.setItem("taskify_focus_screen_mode", newMode);
    } catch {
      // Ignore
    }
  };

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

  // Inactivity auto-hide timer (2.5 seconds)
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  useEffect(() => {
    if (!isRunning) {
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
  }, [isRunning]);

  // Spacebar to pause/resume
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

  // Break down timeLeft into hours, minutes, and seconds
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
        if (isSessionActive) {
          isRunning ? pauseTimer() : startTimer();
        }
      }}
      className={cn(
        "relative h-screen w-screen flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden transition-all duration-700 bg-black cursor-pointer",
        !isControlsVisible && isRunning && "cursor-none"
      )}
    >
      {/* ── Top Bar: Discreet Navigation & Screen Switcher (Auto-hides) ─── */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-30 flex items-center justify-between w-full transition-opacity duration-500 cursor-default",
          !isControlsVisible && isRunning ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {/* Left: Back to Tasks */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push("/tasks");
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition-all border border-white/5 cursor-pointer backdrop-blur-md"
          title="Back to Tasks"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Tasks</span>
        </button>

        {/* Center: Clean Screen Mode Switcher (Float / Forest / StandBy) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => handleModeChange("float")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              screenMode === "float"
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
              screenMode === "forest"
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <span>🌲</span>
            <span>Forest</span>
          </button>

          <button
            onClick={() => handleModeChange("standby")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              screenMode === "standby"
                ? "bg-orange-500/25 text-orange-300 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <span>⚡</span>
            <span>StandBy</span>
          </button>
        </div>

        {/* Right: Early Finish & Fullscreen Toggle */}
        <div className="flex items-center gap-2">
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all border border-white/5 cursor-pointer backdrop-blur-md"
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

      {/* ── Center: Visualizer Canvas ───────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto w-full">
        {!isSessionActive ? (
          /* ── Idle State: 1-Click Launch ───────────────────────────── */
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-center max-w-sm px-4 space-y-4 cursor-default"
          >
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Ready to Focus
            </h2>
            <p className="text-xs text-white/50">
              Select a task to enter full immersion mode.
            </p>

            {pendingTodayTasks.length > 0 ? (
              <div className="space-y-2 text-left pt-2">
                {pendingTodayTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      startSession({
                        taskId: t.id,
                        taskTitle: t.title,
                        focusMinutes: t.durationMinutes || 25,
                      })
                    }
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <span className="text-xs font-semibold truncate pr-2">
                      {t.title}
                    </span>
                    <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="pt-2">
              <button
                onClick={() => startSession({ focusMinutes: 25 })}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Start 25m Focus
              </button>
            </div>
          </div>
        ) : (
          /* ── Active State: Chosen Visualizer ──────────────────────── */
          <div className="flex flex-col items-center justify-center w-full">
            {/* Minimalist Task Title (Whisper at top) */}
            <div className="mb-4 sm:mb-8 text-center max-w-lg px-4">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/50 truncate">
                {activeTask?.title || activeTaskTitle || "Deep Focus"}
              </p>
            </div>

            {/* Screen 1: Float Bubble Clock */}
            {screenMode === "float" && (
              <FloatVisualizer
                timeLeft={timeLeft}
                isRunning={isRunning}
              />
            )}

            {/* Screen 2: Forest Living Tree */}
            {screenMode === "forest" && (
              <ForestVisualizer
                formattedTime={formattedTime}
                progressRatio={progressRatio}
                mode={mode}
              />
            )}

            {/* Screen 3: StandBy MagSafe Dual Digital Clock */}
            {screenMode === "standby" && (
              <StandByVisualizer
                timeLeft={timeLeft}
                progressRatio={progressRatio}
                mode={mode}
                isRunning={isRunning}
                activeTaskTitle={activeTask?.title || activeTaskTitle}
              />
            )}

            {/* Paused Indicator (Only visible when paused) */}
            <AnimatePresence>
              {!isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-semibold backdrop-blur-md"
                >
                  PAUSED • Tap anywhere to resume
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ── Footer: Empty / Pure Clean ──────────────────────────────── */}
      <footer className="relative z-10 h-6 flex items-center justify-center pointer-events-none">
        {/* Completely clean and distraction-free */}
      </footer>
    </div>
  );
}
