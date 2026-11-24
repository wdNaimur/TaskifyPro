"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, Timer, Coffee, Maximize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { usePomodoroTicker } from "@/lib/hooks/usePomodoroTicker";
import { cn } from "@/lib/utils";

export function FloatingPomodoro() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const {
    isSessionActive,
    mode,
    timeLeft,
    focusMinutes,
    breakMinutes,
    isRunning,
    activeTaskId,
    activeTaskTitle,
    startTimer,
    pauseTimer,
  } = usePomodoroStore();

  // Run global interval ticker
  usePomodoroTicker();

  // ── Visibility Guard: Check if a timer (timed) task exists today ───
  // If there are no timed tasks scheduled for today and no active timed session, do not show widget
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const hasTimerTaskToday = tasks.some(
    (t) =>
      t.status !== "staged" &&
      t.status !== "done" &&
      t.archetype === "timed" &&
      (todayStr && t.scheduledDate ? t.scheduledDate === todayStr : true)
  );
  const isTimedSession = isSessionActive && (activeTask ? activeTask.archetype === "timed" : true);

  if (!hasTimerTaskToday && !isTimedSession) {
    return null;
  }

  // Format time
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = hours > 0
    ? `${hours}h ${minutes}m`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Mini circular SVG progress ratio
  const totalSeconds = (mode === "work" ? focusMinutes : breakMinutes) * 60;
  const progressRatio = totalSeconds > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / totalSeconds)) : 0;

  // SVG Ring specs (36x36px)
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const handleStartIdle = () => {
    router.push("/focus");
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <AnimatePresence mode="wait">
        {!isSessionActive ? (
          /* ── STATE 1: Idle — Sleek Floating Glass Capsule ─────────── */
          <motion.button
            key="idle-capsule"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartIdle}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/85 hover:bg-slate-900/95 text-white backdrop-blur-2xl border border-emerald-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.4),0_0_20px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
            aria-label="Start Focus Session"
            title="Open Focus Mode"
          >
            {/* Ambient Breathing Neon Halo behind pill */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/10 blur-md pointer-events-none group-hover:from-emerald-500/35 transition-all" />

            {/* Glowing Icon with Pulse Beacon */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/30 shrink-0">
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300 ring-2 ring-slate-950" />
            </div>

            <div className="flex flex-col text-left pr-1 relative z-10">
              <span className="font-bold text-xs tracking-tight text-white leading-none flex items-center gap-1.5">
                <span>Start Focus</span>
                <Sparkles className="h-3 w-3 text-emerald-400" />
              </span>
              <span className="text-[10px] font-mono text-emerald-300/80 font-medium mt-0.5">
                Timer Available
              </span>
            </div>
          </motion.button>
        ) : (
          /* ── STATE 2: Active Session — Dynamic Island Capsule ─────── */
          <motion.div
            key="active-capsule"
            layout
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            className={cn(
              "group relative flex items-center gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-slate-950/90 text-white backdrop-blur-2xl border transition-all duration-300",
              isRunning
                ? "border-emerald-500/35 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.25)]"
                : "border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.2)]"
            )}
          >
            {/* Ambient Background Aura */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl blur-lg pointer-events-none transition-opacity duration-500",
                isRunning ? "bg-emerald-500/15 opacity-100" : "bg-amber-500/15 opacity-80"
              )}
            />

            {/* Click to open /focus Fullscreen */}
            <Link
              href="/focus"
              className="flex items-center gap-3 pl-1 pr-1.5 py-0.5 text-left cursor-pointer group/link min-w-0 relative z-10"
              title="Click to open Fullscreen Focus Page"
            >
              {/* Mini SVG Circular Progress Ring */}
              <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  {/* Track Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    strokeWidth="2.5"
                    stroke="rgba(255,255,255,0.15)"
                    fill="transparent"
                  />
                  {/* Active Neon Progress Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    strokeWidth="2.5"
                    stroke={isRunning ? "#10b981" : "#f59e0b"}
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {mode === "work" ? (
                    <Timer
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isRunning ? "text-emerald-400 animate-pulse" : "text-amber-400"
                      )}
                    />
                  ) : (
                    <Coffee className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </div>
              </div>

              {/* Countdown Digits & Title */}
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm tracking-tight text-white leading-none drop-shadow-sm">
                    {formattedTime}
                  </span>
                  <Maximize2 className="h-3 w-3 text-white/40 group-hover/link:text-emerald-400 transition-colors shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      isRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    )}
                  />
                  <p className="text-[10px] font-semibold text-white/60 truncate max-w-[125px]">
                    {activeTaskTitle || (mode === "work" ? "Deep Focus" : "Rest")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Tactile Jewel Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                isRunning ? pauseTimer() : startTimer();
              }}
              className={cn(
                "relative z-10 flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-all active:scale-90 hover:scale-105 cursor-pointer shrink-0 ml-0.5",
                isRunning
                  ? "bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-amber-500/25"
                  : "bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600 shadow-emerald-500/30"
              )}
              aria-label={isRunning ? "Pause timer" : "Resume timer"}
              title={isRunning ? "Pause timer" : "Resume timer"}
            >
              {isRunning ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
