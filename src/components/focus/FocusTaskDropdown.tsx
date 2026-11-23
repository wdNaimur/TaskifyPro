"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Task, Priority } from "@/types";
import { ChevronDown, Check, Zap, Hash, Clock, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FocusTaskDropdownProps {
  tasks: Task[];
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  onSelectTask: (task: Task | null) => void;
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

  // Only show pending tasks (not completed)
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== "done");
  }, [tasks]);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId);
  }, [tasks, activeTaskId]);

  return (
    <div ref={containerRef} className="relative inline-block text-center select-none z-40">
      {/* ── Trigger: Exact Minimalist Uppercase Dropdown (like the photo) ─ */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.16em] uppercase transition-all cursor-pointer",
          activeTask
            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 shadow-2xs"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/80",
          disabled && "opacity-60 cursor-default pointer-events-none"
        )}
        title="Select task to focus on"
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
            <span className="truncate max-w-[200px] sm:max-w-xs normal-case font-semibold">
              {activeTask.title}
            </span>
          </>
        ) : (
          <span>DEEP WORK</span>
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 shrink-0",
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
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-2.5 z-50 text-left max-h-[420px] overflow-y-auto"
          >
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Focus Target
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Option 1: Free Deep Work (No Task Binding) */}
            <button
              onClick={() => {
                onSelectTask(null);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer mb-2",
                !activeTaskId
                  ? "bg-forest text-white shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className={cn(
                    "h-4 w-4",
                    !activeTaskId ? "text-emerald-300" : "text-slate-400"
                  )}
                />
                <span>Free Focus (No task linked)</span>
              </div>
              {!activeTaskId && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </button>

            {/* Tasks Grouped by Priority (P0, P1, P2) */}
            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active tasks available.
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
                                      : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {t.priority}
                                </span>
                                <span className="truncate">{t.title}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {t.durationMinutes && (
                                  <span
                                    className={cn(
                                      "text-[10px] font-mono",
                                      isSelected ? "text-white/70" : "text-slate-400"
                                    )}
                                  >
                                    {t.durationMinutes}m
                                  </span>
                                )}
                                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
