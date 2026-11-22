"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Play,
  Pencil,
  Trash2,
  ArrowUpRight,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import { ArchetypeBadge } from "./ArchetypeBadge";
import { PriorityBadge } from "./PriorityBadge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  mode?: "plan" | "execute"; // "plan" for /manage, "execute" for /tasks
  onToggleDone?: (id: string) => void;
  onToggleSubItem?: (taskId: string, subItemId: string) => void;
  onStartPomodoro?: (id: string, title: string) => void;
  onIncrementCounter?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  variant?: "standard" | "backlog";
}

export function TaskCard({
  task,
  mode = "execute",
  onToggleDone,
  onToggleSubItem,
  onStartPomodoro,
  onIncrementCounter,
  onEdit,
  onDelete,
  onMoveToToday,
  variant = "standard",
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isDone = task.status === "done";
  const isCounter = task.archetype === "counter";
  const isTimed = task.archetype === "timed";
  const isChecklist = task.archetype === "checklist";
  const isPlanMode = mode === "plan";

  const doneSubItemsCount = task.subItems?.filter((s) => s.done).length || 0;
  const totalSubItemsCount = task.subItems?.length || 0;

  // Counter progress
  const counterCurrent = task.currentCount || 0;
  const counterTarget = task.targetCount || 1;
  const counterPct = Math.min(100, (counterCurrent / counterTarget) * 100);

  // Timed progress
  const timedCompleted = task.completedMinutes || 0;
  const timedTarget = task.durationMinutes || 1;
  const timedPct = Math.min(100, (timedCompleted / timedTarget) * 100);

  return (
    <motion.div
      layout
      className={cn(
        "liquid-glass-light rounded-2xl p-3.5 border transition-all flex flex-col group",
        isDone && !isPlanMode ? "opacity-60 bg-white/30" : "hover:border-sage/50"
      )}
    >
      {/* ── Main Top Bar: Info & Quick Action ────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Drag handle (Plan) / Checkbox (Execute) + Title + Badges */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Plan mode: Grip handle */}
          {isPlanMode ? (
            <div
              className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors shrink-0"
              title="Reorder slot"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          ) : (
            /* Execution mode: Checkbox */
            onToggleDone && (
              <button
                onClick={() => onToggleDone(task.id)}
                className={cn(
                  "h-5 w-5 rounded-lg border flex items-center justify-center transition-all focus:outline-hidden shrink-0 cursor-pointer",
                  isDone
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-300 hover:border-sage bg-white"
                )}
                aria-label={isDone ? "Mark incomplete" : "Mark complete"}
              >
                {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
            )
          )}

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm font-semibold text-slate-800 truncate leading-snug",
                isDone && !isPlanMode && "line-through text-slate-400"
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <ArchetypeBadge archetype={task.archetype} task={task} />
              <PriorityBadge priority={task.priority} />
            </div>

            {/* ── Fix 4: Counter Progress Bar ─────────────────────────── */}
            {isCounter && !isPlanMode && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${counterPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                  {counterCurrent}/{counterTarget}
                  {task.unit ? ` ${task.unit}` : ""}
                </span>
              </div>
            )}

            {/* ── Fix 5: Timed Progress Bar ───────────────────────────── */}
            {isTimed && !isPlanMode && timedCompleted > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${timedPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                  {timedCompleted}/{timedTarget}m
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Archetype-Specific Quick Action ────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Backlog action */}
          {variant === "backlog" && onMoveToToday && (
            <button
              onClick={() => onMoveToToday(task.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-light transition-all shadow-xs cursor-pointer"
            >
              <span>Move to Today</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* EXECUTION MODE ONLY */}
          {!isPlanMode && !isDone && (
            <>
              {/* 1. Counter Task: ONLY [+] action */}
              {isCounter && onIncrementCounter && (
                <button
                  onClick={() => onIncrementCounter(task.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700/10 hover:bg-emerald-700 text-emerald-800 hover:text-white rounded-xl text-xs font-bold transition-all border border-emerald-300/40 shadow-2xs active:scale-95 cursor-pointer"
                  title="Increment count (+1)"
                  aria-label="Increment count"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+1</span>
                </button>
              )}

              {/* 2. Timed Task: ONLY [Start] (Play) action */}
              {isTimed && onStartPomodoro && (
                <button
                  onClick={() => onStartPomodoro(task.id, task.title)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-forest hover:bg-forest/10 transition-colors cursor-pointer"
                  title="Start timer for this task"
                  aria-label="Start timer"
                >
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </button>
              )}

              {/* 3. Checklist Task: Accordion Chevron Toggle Button */}
              {isChecklist && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-black/5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-slate-200/60"
                  title={expanded ? "Collapse sub-tasks" : "Expand sub-tasks"}
                  aria-label={expanded ? "Collapse sub-tasks" : "Expand sub-tasks"}
                >
                  <span className="text-[11px] font-mono text-slate-400">
                    {doneSubItemsCount}/{totalSubItemsCount}
                  </span>
                  {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </button>
              )}
            </>
          )}

          {/* In Plan Mode: Allow expanding checklist to view subtasks */}
          {isPlanMode && isChecklist && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-lg text-xs transition-colors cursor-pointer"
              title={expanded ? "Collapse sub-tasks" : "Expand sub-tasks"}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Management Actions (Edit & Delete) */}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
              title="Edit task"
              aria-label="Edit task"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Checklist Accordion Content ─────────────────────────────── */}
      <AnimatePresence>
        {isChecklist && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-2 border-t border-slate-200/60 space-y-2.5">
              {/* Sub-items List */}
              {task.subItems && task.subItems.length > 0 ? (
                <div className="space-y-1.5 pl-1">
                  {task.subItems.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onToggleSubItem?.(task.id, sub.id)}
                      className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-black/5 cursor-pointer transition-colors group/sub"
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                          sub.done
                            ? "bg-forest border-forest text-white"
                            : "border-slate-300 group-hover/sub:border-sage bg-white"
                        )}
                      >
                        {sub.done && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={cn(
                          "text-xs text-slate-700 transition-colors leading-tight",
                          sub.done && "line-through text-slate-400"
                        )}
                      >
                        {sub.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic px-1">No sub-tasks listed.</p>
              )}

              {/* Action Buttons inside Accordion: Start Focus & Complete */}
              {!isPlanMode && !isDone && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 gap-2">
                  {onStartPomodoro && (
                    <button
                      type="button"
                      onClick={() => onStartPomodoro(task.id, task.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                      <span>Start Focus</span>
                    </button>
                  )}

                  {onToggleDone && (
                    <button
                      type="button"
                      onClick={() => onToggleDone(task.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ml-auto"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Complete Task</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
