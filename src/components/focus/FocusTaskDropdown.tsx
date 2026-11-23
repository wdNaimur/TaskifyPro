"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Task, Priority } from "@/types";
import { ChevronDown, Check, Zap, Hash, Clock, Plus, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FocusTaskDropdownProps {
  tasks: Task[];
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  onSelectTask: (task: Task | null) => void;
  onAddNewTask?: () => void;
  hasError?: boolean;
  disabled?: boolean;
}

const PRIORITY_GROUPS: {
  id: Priority;
  title: string;
  badgeClass: string;
  dotClass: string;
}[] = [
  {
    id: "P0",
    title: "P0 — Urgent & Critical",
    badgeClass: "bg-red-500/10 text-red-700 border-red-300/40",
    dotClass: "bg-red-500",
  },
  {
    id: "P1",
    title: "P1 — High Priority",
    badgeClass: "bg-emerald-500/10 text-emerald-800 border-emerald-300/40",
    dotClass: "bg-emerald-500",
  },
  {
    id: "P2",
    title: "P2 — Normal / Routine",
    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-300/40",
    dotClass: "bg-slate-400",
  },
];

export function FocusTaskDropdown({
  tasks,
  activeTaskId,
  activeTaskTitle,
  onSelectTask,
  onAddNewTask,
  hasError = false,
  disabled = false,
}: FocusTaskDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Open dropdown automatically when hasError is triggered
  useEffect(() => {
    if (hasError) {
      setIsOpen(true);
    }
  }, [hasError]);

  // Only show pending tasks (not done)
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== "done");
  }, [tasks]);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId);
  }, [tasks, activeTaskId]);

  return (
    <div ref={containerRef} className="relative inline-block text-center select-none z-40">
      {/* ── Trigger: Linked Task Capsule ───────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all cursor-pointer border shadow-2xs",
          activeTask
            ? "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm"
            : hasError
            ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400 animate-pulse font-bold"
            : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border-amber-300/60 font-bold",
          disabled && "opacity-60 cursor-default pointer-events-none"
        )}
        title="Select or change the task linked to this Pomodoro"
      >
        {activeTask ? (
          <>
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                activeTask.priority === "P0"
                  ? "bg-red-500"
                  : activeTask.priority === "P1"
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                activeTask.priority === "P0"
                  ? "bg-red-100 text-red-700"
                  : activeTask.priority === "P1"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {activeTask.priority}
            </span>
            <span className="truncate max-w-[200px] sm:max-w-xs font-semibold text-slate-800">
              {activeTask.title}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="tracking-wide">LINK A TASK TO START</span>
          </div>
        )}

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 shrink-0 text-slate-500",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* ── Dropdown Popover ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-3 z-50 text-left max-h-[440px] overflow-y-auto"
          >
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 mb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Link Task to Pomodoro
                </span>
                <span className="text-[10px] text-slate-400">
                  Time focused will accumulate on the selected task
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tasks Grouped by Priority (P0, P1, P2) */}
            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  No active tasks found for today.
                </p>
                {onAddNewTask && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onAddNewTask();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Create a Task</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {PRIORITY_GROUPS.map((group) => {
                  const groupTasks = pendingTasks.filter((t) => t.priority === group.id);
                  if (groupTasks.length === 0) return null;

                  return (
                    <div key={group.id} className="space-y-1">
                      {/* Section Header */}
                      <div className="flex items-center gap-1.5 px-2 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className={cn("h-1.5 w-1.5 rounded-full", group.dotClass)} />
                        <span>{group.title}</span>
                      </div>

                      {/* Task items */}
                      <div className="space-y-1">
                        {groupTasks.map((t) => {
                          const isSelected = t.id === activeTaskId;

                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                onSelectTask(t);
                                setIsOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all text-left cursor-pointer",
                                isSelected
                                  ? "bg-forest text-white font-bold shadow-xs"
                                  : "hover:bg-slate-100 text-slate-800 font-medium"
                              )}
                            >
                              <div className="min-w-0 pr-2 flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md shrink-0",
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : group.id === "P0"
                                      ? "bg-red-100 text-red-700"
                                      : group.id === "P1"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {t.priority}
                                </span>
                                <span className="truncate">{t.title}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {t.durationMinutes ? (
                                  <span
                                    className={cn(
                                      "text-[10px] font-mono",
                                      isSelected ? "text-white/70" : "text-slate-400"
                                    )}
                                  >
                                    {t.durationMinutes}m
                                  </span>
                                ) : null}
                                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Task option at bottom of list */}
                {onAddNewTask && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onAddNewTask();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-forest hover:text-forest-light hover:bg-forest/5 rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Task</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
