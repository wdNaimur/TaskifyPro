"use client";

import { Calendar } from "lucide-react";
import { Task } from "@/types";
import { TaskCard } from "@/components/tasks/TaskCard";
import { cn } from "@/lib/utils";

interface DailyPlanTabProps {
  tasks: Task[];
  slotCapacity?: number;
  onToggleDone: (id: string) => void;
  onStartPomodoro: (id: string, title: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
}

export function DailyPlanTab({
  tasks,
  slotCapacity = 5,
  onToggleDone,
  onStartPomodoro,
  onEdit,
  onDelete,
  onOpenCreateModal,
}: DailyPlanTabProps) {
  const completedTodayCount = tasks.filter((t) => t.status === "done").length;
  const isFull = tasks.length >= slotCapacity;

  return (
    <div className="space-y-6">
      {/* ── Capacity Throttle Guardrail (5 Slots) ─────────────────── */}
      <div className="liquid-glass-light rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">
              Today&apos;s Capacity Throttle
            </h3>
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                isFull
                  ? "bg-red-500/10 text-red-700 border-red-300"
                  : "bg-emerald-500/10 text-emerald-800 border-emerald-300"
              )}
            >
              {tasks.length} / {slotCapacity} Slots Used
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            The rule of 5: Deep focus requires strictly guarding daily slots against cognitive overload.
          </p>
        </div>

        {/* Visual Slot Indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: slotCapacity }).map((_, i) => {
            const isFilled = i < tasks.length;
            const isDone = i < completedTodayCount;
            return (
              <div
                key={i}
                className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all",
                  isDone
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : isFilled
                    ? "bg-forest text-white border-forest-light"
                    : "bg-white/40 text-slate-400 border-slate-200/60"
                )}
                title={`Slot ${i + 1}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Today's Execution Queue ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Execution Queue ({tasks.length})
          </h4>
          <span className="text-xs text-slate-400">
            {completedTodayCount} Completed
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tasks scheduled for today</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add Task&quot; or promote from your Backlog
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleDone={onToggleDone}
              onStartPomodoro={onStartPomodoro}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
