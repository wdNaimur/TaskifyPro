"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Timer, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore, PomodoroMode } from "@/lib/stores/pomodoroStore";
import { cn } from "@/lib/utils";

export function FloatingPomodoro() {
  const {
    mode,
    timeLeft,
    isRunning,
    activeTaskTitle,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
  } = usePomodoroStore();

  const [expanded, setExpanded] = useState(false);

  // Interval ticker when running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const modeLabels: Record<PomodoroMode, string> = {
    work: "Focus",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      <motion.div
        layout
        className="liquid-glass-light rounded-2xl overflow-hidden shadow-2xl border border-white/60 p-2 sm:p-2.5 transition-all"
        style={{ minWidth: "180px" }}
      >
        {/* ── Main Bar (Always Visible) ────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-1">
          {/* Mode Icon & Timer Display */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-left group focus:outline-hidden"
            title={expanded ? "Collapse widget" : "Expand widget"}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all shadow-inner",
                mode === "work"
                  ? "bg-sage text-white"
                  : "bg-orange-500/20 text-orange-600"
              )}
            >
              {mode === "work" ? (
                <Timer className={cn("h-4 w-4", isRunning && "animate-pulse")} />
              ) : (
                <Coffee className="h-4 w-4" />
              )}
            </div>

            <div>
              <div className="font-mono font-bold text-sm tracking-tight text-slate-800 leading-none">
                {formattedTime}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                {modeLabels[mode]}
              </div>
            </div>
          </button>

          {/* Quick Play/Pause & Expand Chevrons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => (isRunning ? pauseTimer() : startTimer())}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm transition-transform active:scale-95 focus:outline-hidden",
                isRunning
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-forest hover:bg-forest-light"
              )}
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex h-8 w-6 items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 transition-colors focus:outline-hidden"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* ── Expanded Drawer ──────────────────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-2 border-t border-slate-200/60 space-y-2.5 px-1">
                {/* Active Task (if any) */}
                {activeTaskTitle ? (
                  <div className="bg-white/60 rounded-xl p-2 border border-white/80">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Working on
                    </p>
                    <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                      {activeTaskTitle}
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic px-1">
                    No task actively linked
                  </div>
                )}

                {/* Mode Selector Buttons */}
                <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                  {(["work", "shortBreak", "longBreak"] as PomodoroMode[]).map(
                    (m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all focus:outline-hidden",
                          mode === m
                            ? "bg-white text-slate-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {m === "work" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
                      </button>
                    )
                  )}
                </div>

                {/* Reset Action Button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={resetTimer}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
