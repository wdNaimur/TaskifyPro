"use client";

import { Calendar, GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";
import { Task } from "@/types";
import { TaskCard } from "@/components/tasks/TaskCard";
import { DEFAULT_TASK_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DailyPlanTabProps {
  tasks: Task[];
  slotCapacity?: number;
  onReorder?: (tasks: Task[]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenCreateModal: () => void;
}

export function DailyPlanTab({
  tasks,
  slotCapacity = DEFAULT_TASK_CONFIG.slotCapacity,
  onReorder,
  onEdit,
  onDelete,
  onOpenCreateModal,
}: DailyPlanTabProps) {
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
              {tasks.length} / {slotCapacity} Slots Allocated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            The rule of 5: Guard today&apos;s allocation to ensure realistic focus. Execution takes place on the Tasks Cockpit.
          </p>
        </div>

        {/* Visual Slot Indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: slotCapacity }).map((_, i) => {
            const isFilled = i < tasks.length;
            return (
              <div
                key={i}
                className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all",
                  isFilled
                    ? "bg-forest text-white border-forest-light shadow-xs"
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

      {/* ── Allocated Slots List (Management Mode) ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Allocated Slots ({tasks.length} of {slotCapacity})
          </h4>
          <span className="text-[11px] text-slate-400">
            {tasks.length > 1 ? "Drag grip handle to reorder slots • " : ""}Edit &amp; prioritize today&apos;s schedule
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tasks allocated for today</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add Task&quot; or promote from your Backlog
            </p>
          </div>
        ) : onReorder ? (
          <Reorder.Group
            axis="y"
            values={tasks}
            onReorder={onReorder}
            className="space-y-3"
          >
            {tasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                className="list-none select-none cursor-grab active:cursor-grabbing focus:outline-hidden"
                whileDrag={{
                  scale: 1.02,
                  zIndex: 40,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ duration: 0.15 }}
              >
                <TaskCard
                  task={task}
                  mode="plan"
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              mode="plan"
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
