"use client";

import { CheckCircle2, Play, Pencil, Trash2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Task } from "@/types";
import { ArchetypeBadge } from "./ArchetypeBadge";
import { PriorityBadge } from "./PriorityBadge";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggleDone?: (id: string) => void;
  onStartPomodoro?: (id: string, title: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  variant?: "standard" | "backlog";
}

export function TaskCard({
  task,
  onToggleDone,
  onStartPomodoro,
  onEdit,
  onDelete,
  onMoveToToday,
  variant = "standard",
}: TaskCardProps) {
  const isDone = task.status === "done";

  return (
    <motion.div
      layout
      className={cn(
        "liquid-glass-light rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 group",
        isDone ? "opacity-60 bg-white/30" : "hover:border-sage/50"
      )}
    >
      {/* ── Left side: Checkbox + Title + Metadata Badges ────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleDone && (
          <button
            onClick={() => onToggleDone(task.id)}
            className={cn(
              "h-5 w-5 rounded-lg border flex items-center justify-center transition-all focus:outline-hidden shrink-0",
              isDone
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-slate-300 hover:border-sage bg-white"
            )}
            aria-label={isDone ? "Mark incomplete" : "Mark complete"}
          >
            {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
        )}

        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-semibold text-slate-800 truncate leading-snug",
              isDone && "line-through text-slate-400"
            )}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <ArchetypeBadge archetype={task.archetype} task={task} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
      </div>

      {/* ── Right side: Quick Action Triggers ─────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Backlog action: Move to Today */}
        {variant === "backlog" && onMoveToToday && (
          <button
            onClick={() => onMoveToToday(task.id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-light transition-all shadow-xs"
          >
            <span>Move to Today</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Start Focus in Pomodoro */}
        {onStartPomodoro && (
          <button
            onClick={() => onStartPomodoro(task.id, task.title)}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Focus in Pomodoro timer"
            aria-label="Focus in Pomodoro timer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        )}

        {/* Edit Task */}
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors"
            title="Edit task"
            aria-label="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete Task */}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
