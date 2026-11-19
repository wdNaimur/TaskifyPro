"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, Timer, Coffee, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { usePomodoroTicker } from "@/lib/hooks/usePomodoroTicker";
import { cn } from "@/lib/utils";

export function FloatingPomodoro() {
  const router = useRouter();
  const {
    isSessionActive,
    mode,
    timeLeft,
    isRunning,
    activeTaskTitle,
    startSession,
    startTimer,
    pauseTimer,
  } = usePomodoroStore();

  // Run global interval ticker
  usePomodoroTicker();

  // Format for floating pill
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = hours > 0
    ? `${hours}h ${minutes}m`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleStartIdle = () => {
    startSession();
    router.push("/focus");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      <AnimatePresence mode="wait">
        {!isSessionActive ? (
          /* ── STATE 1: Idle — Clean 1-Click "Start Focus" Button ── */
          <motion.button
            key="idle-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartIdle}
            className="liquid-glass-light hover:liquid-glass-active rounded-2xl px-3.5 py-2.5 shadow-xl border border-white/80 flex items-center gap-2.5 text-slate-800 transition-all font-semibold text-xs group cursor-pointer"
            aria-label="Start Focus Session"
            title="Start a 25m Focus Session"
          >
            <div className="h-6 w-6 rounded-xl bg-forest text-white flex items-center justify-center group-hover:bg-forest-light transition-colors shadow-xs">
              <Play className="h-3 w-3 fill-current ml-0.5" />
            </div>
            <span className="font-bold tracking-tight">Start Focus</span>
          </motion.button>
        ) : (
          /* ── STATE 2: Focus Active — 1-Click to Open /focus ─────── */
          <motion.div
            key="active-widget"
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="liquid-glass-light hover:liquid-glass-active rounded-2xl shadow-xl border border-white/80 p-1.5 sm:p-2 flex items-center gap-2 transition-all group"
          >
            {/* Click to open /focus */}
            <Link
              href="/focus"
              className="flex items-center gap-2.5 px-1 py-0.5 text-left cursor-pointer group/link min-w-0"
              title="Click to open Fullscreen Focus Page"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all shadow-inner",
                  mode === "work" ? "bg-forest text-white" : "bg-amber-500 text-white"
                )}
              >
                {mode === "work" ? (
                  <Timer className={cn("h-4 w-4", isRunning && "animate-pulse")} />
                ) : (
                  <Coffee className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm tracking-tight text-slate-800 leading-none">
                    {formattedTime}
                  </span>
                  <Maximize2 className="h-3 w-3 text-slate-400 group-hover/link:text-forest transition-colors shrink-0" />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 truncate max-w-[120px] mt-0.5">
                  {activeTaskTitle || (mode === "work" ? "Deep Focus" : "Rest")}
                </p>
              </div>
            </Link>

            {/* Quick Inline Play / Pause Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                isRunning ? pauseTimer() : startTimer();
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs transition-transform active:scale-95 focus:outline-hidden cursor-pointer shrink-0 ml-1",
                isRunning
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-forest hover:bg-forest-light"
              )}
              aria-label={isRunning ? "Pause timer" : "Start timer"}
              title={isRunning ? "Pause timer" : "Resume timer"}
            >
              {isRunning ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
