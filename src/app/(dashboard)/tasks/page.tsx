"use client";

import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Play,
  Pause,
  Square,
  ArrowRight,
  Flame,
  Sparkles,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/lib/stores/taskStore";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { TaskCard } from "@/components/tasks/TaskCard";

export default function TasksPage() {
  const { tasks, toggleTaskDone, toggleSubItem, incrementCounter } = useTaskStore();
  const {
    isSessionActive,
    isRunning,
    mode,
    activeTaskTitle,
    timeLeft,
    currentPart,
    totalParts,
    openLauncher,
    startTimer,
    pauseTimer,
    stopSession,
  } = usePomodoroStore();

  // Filter today's tasks (non-staged)
  const todayTasks = tasks.filter((t) => t.status !== "staged");
  const pendingTasks = todayTasks.filter((t) => t.status !== "done");
  const completedTasks = todayTasks.filter((t) => t.status === "done");
  const completedRatio = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  // Format mm:ss for active focus banner
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* ── Page Header & Daily Progress ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Today&apos;s Execution Cockpit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Focus solely on executing today&apos;s scheduled work. No backlog distractions.
          </p>
        </div>

        {/* Progress Metric Badge */}
        {todayTasks.length > 0 && (
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-xs">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-800">
                {completedTasks.length} of {todayTasks.length} Completed
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                {Math.round(completedRatio)}% daily progress
              </span>
            </div>
            {/* Circular or pill progress indicator */}
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-300/40 flex items-center justify-center text-emerald-800 font-bold text-xs">
              {completedTasks.length === todayTasks.length && todayTasks.length > 0 ? (
                <Sparkles className="h-4 w-4 text-emerald-600" />
              ) : (
                `${Math.round(completedRatio)}%`
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Active Focus Banner (ONLY rendered when a focus session has started) ── */}
      <AnimatePresence>
        {isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="liquid-glass-dark text-white rounded-3xl p-5 shadow-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                {mode === "work" ? (
                  <Flame className="h-5 w-5 text-orange-400 fill-orange-400 animate-pulse" />
                ) : (
                  <Timer className="h-5 w-5 text-amber-300" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sage-light uppercase tracking-wider block">
                    {mode === "work" ? "Active Focus Session" : "Break Time"}
                  </span>
                  {totalParts > 1 && (
                    <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.2 rounded-md">
                      Part {currentPart} of {totalParts}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white truncate drop-shadow-xs mt-0.5">
                  {activeTaskTitle || "General Focus"}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="font-mono text-2xl font-bold tracking-tight text-white/90">
                {formattedTime}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => (isRunning ? pauseTimer() : startTimer())}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sage hover:bg-sage-dark text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  onClick={stopSession}
                  className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  title="End focus session"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Today's Execution Queue ─────────────────────────────────── */}
      <div className="space-y-4">
        {todayTasks.length === 0 ? (
          /* Empty State: Prompt to allocate in Manage */
          <div className="liquid-glass-light rounded-3xl p-12 text-center border border-white/80 shadow-xs space-y-3">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No tasks allocated for today
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Head over to the Manage page to schedule your 5 focus slots from your backlog or create new tasks.
            </p>
            <div className="pt-2">
              <Link
                href="/manage"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest hover:bg-forest-light text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <span>Go to Manage &amp; Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Pending Execution Queue */}
            {pendingTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    To-Do ({pendingTasks.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Click checkbox to complete, or Play to start focus session
                  </span>
                </div>

                <div className="space-y-2.5">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      mode="execute"
                      onToggleDone={toggleTaskDone}
                      onToggleSubItem={toggleSubItem}
                      onStartPomodoro={(id, title) =>
                        openLauncher({
                          taskId: id,
                          taskTitle: title,
                          durationMinutes: task.durationMinutes,
                        })
                      }
                      onIncrementCounter={incrementCounter}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Completed Today ({completedTasks.length})</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      mode="execute"
                      onToggleDone={toggleTaskDone}
                      onToggleSubItem={toggleSubItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
