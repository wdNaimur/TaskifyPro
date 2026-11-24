"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Maximize2,
  Minimize2,
  StopCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Check,
  Sun,
  RotateCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { toast } from "@/lib/stores/toastStore";
import { usePomodoroTicker } from "@/lib/hooks/usePomodoroTicker";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { soundscapeAudio, SoundscapeType } from "@/lib/audio/soundscapeAudio";
import { triggerConfetti } from "@/lib/utils/confetti";
import { FocusSetupScreen, VisualizerMode } from "@/components/focus/FocusSetupScreen";
import { FloatVisualizer } from "@/components/focus/screens/FloatVisualizer";
import { ForestVisualizer } from "@/components/focus/screens/ForestVisualizer";
import { TaskModal } from "@/components/manage/TaskModal";
import { Task } from "@/types";
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

  // Ambient soundscape preferences & menu
  const { settings, updateSettings } = useSettingsStore();
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);

  // Screen Wake Lock: keeps display awake on mobile during immersion
  const { isActive: isWakeLockActive, request: requestWakeLock, release: releaseWakeLock } = useWakeLock(
    (isSessionActive || isRunning) && settings.keepScreenAwake !== false
  );

  const handleSelectSoundscape = (id: SoundscapeType) => {
    updateSettings({ soundscape: id });
    if (id === "none") {
      soundscapeAudio.stop();
    } else {
      soundscapeAudio.play(id, settings.soundVolume ?? 0.5);
    }
  };

  const handleVolumeChange = (vol: number) => {
    updateSettings({ soundVolume: vol });
    soundscapeAudio.setVolume(vol);
  };

  // Priority ordering map for auto-selection
  const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2 };

  // Task linking validation state & quick create modal
  const [hasTaskError, setHasTaskError] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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

  // Screen Orientation / Desk Clock StandBy rotation mode
  const [isRotated, setIsRotated] = useState(false);

  const toggleScreenRotation = useCallback(async () => {
    try {
      if (typeof screen !== "undefined" && screen.orientation && "lock" in screen.orientation) {
        if (!isRotated) {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
          }
          await (screen.orientation as any).lock("landscape").catch(() => {});
        } else {
          await (screen.orientation as any).unlock?.();
        }
      }
    } catch {
      // Fallback to software CSS rotation
    }

    setIsRotated((prev) => {
      const next = !prev;
      if (next) {
        toast.info("Desk Clock mode active (Landscape)");
      } else {
        toast.info("Standard orientation restored");
      }
      return next;
    });
  }, [isRotated]);

  // Reset software rotation if device is physically rotated to landscape
  useEffect(() => {
    const handleOrientation = () => {
      if (window.innerWidth > window.innerHeight && isRotated) {
        setIsRotated(false);
      }
    };
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, [isRotated]);

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
      {/* ── Top Bar Overlay (Back button, Screen switcher, Controls) ──── */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "z-30 w-full transition-all duration-500 cursor-default",
          isSessionActive
            ? "absolute top-0 inset-x-0 pt-3 sm:pt-5 pb-6 sm:pb-8 px-3 sm:px-8 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none"
            : "relative w-full",
          isSessionActive && !isControlsVisible && isRunning
            ? "opacity-0 -translate-y-3 pointer-events-none"
            : "opacity-100 translate-y-0"
        )}
      >
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 pointer-events-auto flex-wrap sm:flex-nowrap">
          {/* Left: Back to Tasks */}
          <button
            onClick={() => router.push("/tasks")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer shrink-0",
              !isSessionActive
                ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
                : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10 backdrop-blur-md"
            )}
            title="Back to Tasks"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tasks</span>
          </button>

          {/* Center: When session active, display Visualizer switcher */}
          {isSessionActive ? (
            <>
              {/* Mobile Single Toggle Button (Saves ~80px on narrow screens) */}
              <button
                type="button"
                onClick={() => handleModeChange(visualizerMode === "float" ? "forest" : "float")}
                className="sm:hidden px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md shadow-2xs shrink-0"
                title="Tap to switch between Float and Forest modes"
              >
                <span>{visualizerMode === "float" ? "🫧 Float" : "🌲 Forest"}</span>
              </button>

              {/* Tablet/Desktop Dual Pill Switcher */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0">
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
            </>
          ) : (
            <div className="text-center hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Focus Setup &amp; Configuration
              </span>
            </div>
          )}

          {/* Right: In-Session Controls + Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Ambient Soundscape Controller */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSoundMenuOpen((prev) => !prev);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer backdrop-blur-md",
                isSoundMenuOpen
                  ? "bg-white/20 text-white border-white/20"
                  : !isSessionActive
                  ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
                  : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5"
              )}
              title="Ambient Focus Soundscape"
            >
              {settings.soundscape === "none" ? (
                <VolumeX className="h-3.5 w-3.5 opacity-60" />
              ) : (
                <Volume2 className={cn("h-3.5 w-3.5 text-emerald-400", isRunning && "animate-pulse")} />
              )}
              <span className="capitalize">{settings.soundscape === "none" ? "Muted" : settings.soundscape}</span>
            </button>

            {/* Soundscape Dropdown Menu */}
            <AnimatePresence>
              {isSoundMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-52 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl text-white z-50 space-y-3 cursor-default"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Ambient Soundscape
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: "none", label: "Muted (Silent)" },
                      { id: "rain", label: "Rainfall" },
                      { id: "forest", label: "Pine Forest" },
                      { id: "cafe", label: "Cafe Murmur" },
                      { id: "white-noise", label: "White Noise" },
                    ].map((s) => {
                      const isSelected = settings.soundscape === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSoundscape(s.id as SoundscapeType)}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                              : "hover:bg-white/10 text-white/70"
                          )}
                        >
                          <span>{s.label}</span>
                          {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Volume slider */}
                  {settings.soundscape !== "none" && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-white/50 font-bold">
                        <span>Volume</span>
                        <span>{Math.round((settings.soundVolume ?? 0.5) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((settings.soundVolume ?? 0.5) * 100)}
                        onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                triggerConfetti(e.clientX, e.clientY);
                toggleTaskDone(activeTaskId);
                stopSession();
                router.push("/tasks");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Finish</span>
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
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}

          {/* Keep Screen Awake on Mobile Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = !(settings.keepScreenAwake !== false);
              updateSettings({ keepScreenAwake: next });
              if (next) {
                requestWakeLock();
                toast.success("Display will stay awake during focus");
              } else {
                releaseWakeLock();
                toast.info("Display sleep allowed");
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer backdrop-blur-md",
              settings.keepScreenAwake !== false
                ? isWakeLockActive
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : !isSessionActive
                  ? "bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 shadow-2xs"
                  : "bg-white/10 text-white/80 border-white/10"
                : !isSessionActive
                ? "bg-white/40 text-slate-400 border-slate-200/50 hover:text-slate-600"
                : "bg-white/5 text-white/40 border-white/5 hover:text-white/70"
            )}
            title={
              settings.keepScreenAwake !== false
                ? isWakeLockActive
                  ? "Screen Awake is active (screen will not dim or lock on mobile)"
                  : "Screen Awake is enabled"
                : "Screen sleep allowed (click to keep awake)"
            }
          >
            <Sun className={cn("h-3.5 w-3.5", isWakeLockActive ? "text-amber-400 animate-pulse" : "opacity-60")} />
            <span className="hidden sm:inline">
              {settings.keepScreenAwake !== false ? (isWakeLockActive ? "Awake" : "Awake") : "Sleep OK"}
            </span>
          </button>

          {/* Screen Rotation / Desk Clock Mode */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleScreenRotation();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer backdrop-blur-md",
              isRotated
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                : !isSessionActive
                ? "bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 shadow-2xs"
                : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5"
            )}
            title={isRotated ? "Exit Desk Clock mode" : "Rotate to Desk Clock (Landscape)"}
          >
            <RotateCw className={cn("h-3.5 w-3.5 transition-transform duration-300", isRotated ? "rotate-90 text-purple-400" : "opacity-70")} />
            <span className="hidden sm:inline">{isRotated ? "Desk Clock" : "Rotate"}</span>
          </button>

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
        </div>
      </header>

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

      {/* ── Footer ─────────────────────────────────────────────────── */}
      {!isSessionActive && (
        <footer className="relative z-10 h-6 flex items-center justify-center pointer-events-none">
          {/* Distraction-free clean footer */}
        </footer>
      )}
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
