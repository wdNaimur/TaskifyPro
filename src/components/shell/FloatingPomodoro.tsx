"use client";

import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Timer,
  Coffee,
  Square,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { FocusSetupModal } from "@/components/focus/FocusSetupModal";
import { cn } from "@/lib/utils";

export function FloatingPomodoro() {
  const {
    isSessionActive,
    mode,
    timeLeft,
    isRunning,
    activeTaskTitle,
    totalParts,
    currentPart,
    openLauncher,
    startTimer,
    pauseTimer,
    resetTimer,
    stopSession,
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

  return (
    <>
      {/* ── Global Focus Setup Modal ─────────────────────────────── */}
      <FocusSetupModal />

      {/* ── Bottom Right Corner Anchor ───────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-40 select-none">
        <AnimatePresence mode="wait">
          {!isSessionActive ? (
            /* ── STATE 1: Idle — Simple "Start Focus" Button ──────── */
            <motion.button
              key="idle-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openLauncher()}
              className="liquid-glass-light hover:liquid-glass-active rounded-2xl px-3.5 py-2.5 shadow-xl border border-white/80 flex items-center gap-2.5 text-slate-800 transition-all font-semibold text-xs group cursor-pointer"
              aria-label="Start Focus Session"
            >
              <div className="h-6 w-6 rounded-xl bg-forest text-white flex items-center justify-center group-hover:bg-forest-light transition-colors shadow-xs">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </div>
              <span className="font-bold tracking-tight">Start Focus</span>
            </motion.button>
          ) : (
            /* ── STATE 2: Active Session — Timer Widget ───────────── */
            <motion.div
              key="active-widget"
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="liquid-glass-light rounded-2xl overflow-hidden shadow-2xl border border-white/70 p-2 sm:p-2.5 transition-all"
              style={{ minWidth: "190px" }}
            >
              {/* Main Bar */}
              <div className="flex items-center justify-between gap-3 px-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-left group focus:outline-hidden cursor-pointer"
                  title={expanded ? "Collapse widget" : "Expand widget"}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all shadow-inner",
                      mode === "work"
                        ? "bg-forest text-white"
                        : "bg-amber-500 text-white"
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
                      {mode === "work"
                        ? totalParts > 1
                          ? `Part ${currentPart}/${totalParts}`
                          : "Focus"
                        : "Break"}
                    </div>
                  </div>
                </button>

                {/* Quick Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => (isRunning ? pauseTimer() : startTimer())}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs transition-transform active:scale-95 focus:outline-hidden cursor-pointer",
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
                    className="flex h-8 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 transition-colors focus:outline-hidden cursor-pointer"
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

              {/* Expanded Drawer */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2.5 mt-2 border-t border-slate-200/60 space-y-2 px-1">
                      {/* Active Task (if linked) */}
                      {activeTaskTitle ? (
                        <div className="bg-white/70 rounded-xl p-2 border border-white/80">
                          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                            Focusing On
                          </p>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                            {activeTaskTitle}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic px-0.5">
                          General focus session
                        </div>
                      )}

                      {/* Part Progress Summary */}
                      {totalParts > 1 && (
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-0.5">
                          <span>Part Progress:</span>
                          <span className="font-mono text-forest">
                            {currentPart} of {totalParts} ({Math.round((currentPart / totalParts) * 100)}%)
                          </span>
                        </div>
                      )}

                      {/* Action Buttons: Reset & End Session */}
                      <div className="flex items-center justify-between pt-1 gap-1">
                        <button
                          onClick={resetTimer}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset</span>
                        </button>

                        <button
                          onClick={stopSession}
                          className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Square className="h-3 w-3 fill-current" />
                          <span>End Session</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
