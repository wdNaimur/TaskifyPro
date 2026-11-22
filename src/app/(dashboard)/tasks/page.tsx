"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  Flame,
  Sparkles,
  Plus,
  ArrowUpRight,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/lib/stores/taskStore";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/manage/TaskModal";
import { Task } from "@/types";

export default function TasksPage() {
  const router = useRouter();
  const {
    tasks,
    addTask,
    toggleTaskDone,
    toggleSubItem,
    incrementCounter,
    moveTaskToToday,
  } = useTaskStore();

  const {
    isSessionActive,
    activeTaskId,
    activeTaskTitle,
    timeLeft,
    startSession,
  } = usePomodoroStore();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Filter tasks
  const todayTasks = tasks.filter((t) => t.status !== "staged");
  const pendingTasks = todayTasks.filter((t) => t.status !== "done");
  const completedTasks = todayTasks.filter((t) => t.status === "done");
  const stagedTasks = tasks.filter((t) => t.status === "staged");
  const completedRatio = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  // Check if a timer (timed) task exists for today, or if the active session is a timed task
  const hasTimerTaskToday = todayTasks.some(
    (t) => t.status !== "done" && t.archetype === "timed"
  );
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const shouldShowFocusBanner =
    isSessionActive && (hasTimerTaskToday || activeTask?.archetype === "timed");

  // Format for active banner
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = hours > 0
    ? `${hours}h ${minutes}m`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // 1-Click: Click Play on a task -> immediately starts focus and teleports to /focus
  const handleStartTaskFocus = (id: string, title: string) => {
    const found = tasks.find((t) => t.id === id);
    if (!found || found.status === "done") return;
    startSession({
      taskId: id,
      taskTitle: title,
      focusMinutes: found?.durationMinutes || 25,
    });
    router.push("/focus");
  };

  const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2 };

  // Pull highest priority staged backlog task to today
  const handlePullFromBacklog = () => {
    if (stagedTasks.length > 0) {
      const sorted = [...stagedTasks].sort(
        (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
      );
      moveTaskToToday(sorted[0].id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* ── Modal for creating tasks directly from /tasks ─────────── */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(newTask) => addTask(newTask)}
      />

      {/* ── Active Focus Banner (Clean slim teleport bar) ─────────── */}
      <AnimatePresence>
        {shouldShowFocusBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="liquid-glass-dark text-white rounded-2xl px-4 py-3 shadow-lg border border-white/20 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Flame className="h-4 w-4 text-orange-400 fill-orange-400 animate-pulse shrink-0" />
              <span className="text-xs text-white/70 hidden sm:inline">Currently focusing:</span>
              <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-none">
                {activeTaskTitle || "Focus Session"}
              </span>
              <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md text-white shrink-0">
                {formattedTime}
              </span>
            </div>

            <Link
              href="/focus"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Return to Focus</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header & Progress ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Today&apos;s Focus
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute your 5 daily slots. Straightforward and distraction-free.
          </p>
        </div>

        {/* Right side: Quick Add button + Progress Badge */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {todayTasks.length < 5 ? (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-forest hover:bg-forest-light text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-800 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span>5/5 — Day is full</span>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/80 shadow-xs">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-800">
                  {completedTasks.length} / {todayTasks.length} Done
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {Math.round(completedRatio)}% complete
                </span>
              </div>
              <div className="h-7 w-7 rounded-xl bg-emerald-500/10 border border-emerald-300/40 flex items-center justify-center text-emerald-800 font-bold text-xs">
                {completedTasks.length === todayTasks.length && todayTasks.length > 0 ? (
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  `${Math.round(completedRatio)}%`
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Task Execution Queue ───────────────────────────────── */}
      <div className="space-y-4">
        {todayTasks.length === 0 ? (
          /* Empty State */
          <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80 shadow-xs space-y-3">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No tasks allocated for today
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a new task directly, or pull from your backlog to fill your 5 focus slots.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-forest hover:bg-forest-light text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Task</span>
              </button>

              {stagedTasks.length > 0 && (
                <button
                  onClick={handlePullFromBacklog}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/80 hover:bg-white text-slate-700 rounded-2xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Pull from Backlog ({stagedTasks.length})</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    To-Do ({pendingTasks.length})
                  </h4>
                  {stagedTasks.length > 0 && todayTasks.length < 5 && (
                    <button
                      onClick={handlePullFromBacklog}
                      className="text-[11px] font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      <span>Pull next from Backlog ({stagedTasks.length})</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      mode="execute"
                      onToggleDone={toggleTaskDone}
                      onToggleSubItem={toggleSubItem}
                      onStartPomodoro={(id, title) => handleStartTaskFocus(id, title)}
                      onIncrementCounter={incrementCounter}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Fill Empty Slot Prompt (if fewer than 5 tasks) */}
            {todayTasks.length < 5 && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full py-3 border-2 border-dashed border-slate-300/80 hover:border-forest/60 hover:bg-white/40 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-forest text-xs font-semibold transition-all cursor-pointer group"
              >
                <Plus className="h-4 w-4 text-slate-400 group-hover:text-forest transition-colors" />
                <span>Add task to fill Slot {todayTasks.length + 1} of 5</span>
              </button>
            )}

            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <div className="space-y-2 pt-2">
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
