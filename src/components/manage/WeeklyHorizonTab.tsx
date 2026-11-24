"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Lock,
  Calendar,
  Pencil,
  Trash2,
  CalendarDays,
  Columns4,
  Columns3,
  Square,
  GripVertical,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { Task } from "@/types";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { ArchetypeBadge } from "@/components/tasks/ArchetypeBadge";
import { useTaskStore } from "@/lib/stores/taskStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useToastStore } from "@/lib/stores/toastStore";
import { computeWeekDays } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

interface WeeklyHorizonTabProps {
  tasks: Task[];
  onAddTaskForDate: (dateStr: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onMoveTaskDate?: (taskId: string, targetDateStr: string) => void;
}

const ALL_WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATIC_WEEK_DAYS = ALL_WEEK_DAYS.map((dayName, idx) => ({
  dayName,
  dateStr: `day-${idx + 1}`,
  dayNum: idx + 1,
  monthName: "",
  isToday: false,
  isWeekend: dayName === "Saturday" || dayName === "Sunday",
}));

export type GridColumnsMode = 7 | 4 | 3 | 1;

interface GridOption {
  cols: GridColumnsMode;
  label: string;
  icon: LucideIcon;
  title: string;
}

const GRID_OPTIONS: GridOption[] = [
  { cols: 7, label: "All 7", icon: CalendarDays, title: "7 Columns — Full Week View" },
  { cols: 4, label: "4", icon: Columns4, title: "4 Columns View" },
  { cols: 3, label: "3", icon: Columns3, title: "3 Columns View" },
  { cols: 1, label: "1", icon: Square, title: "Single Column View" },
];

const GRID_CONTAINER_CLASSES: Record<GridColumnsMode, string> = {
  7: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3",
  4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5",
  3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  1: "grid grid-cols-1 gap-3.5 max-w-3xl mx-auto",
};

export function WeeklyHorizonTab({
  tasks,
  onAddTaskForDate,
  onEditTask,
  onDeleteTask,
  onMoveTaskDate,
}: WeeklyHorizonTabProps) {
  const { settings } = useSettingsStore();
  const startOfWeek = settings.startOfWeek || "monday";
  const weekendDays = settings.weekendDays || ["saturday", "sunday"];

  const [weekDays, setWeekDays] = useState(() => {
    // Static initial state for SSR
    return STATIC_WEEK_DAYS;
  });
  const [todayStr, setTodayStr] = useState<string>("");
  const [gridCols, setGridCols] = useState<GridColumnsMode>(7);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDateStr, setDragOverDateStr] = useState<string | null>(null);

  useEffect(() => {
    setWeekDays(computeWeekDays(startOfWeek, weekendDays));
    setTodayStr(new Date().toISOString().split("T")[0]);

    try {
      const saved = localStorage.getItem("taskify_weekly_grid_cols");
      if (saved && ["7", "4", "3", "1"].includes(saved)) {
        setGridCols(Number(saved) as GridColumnsMode);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [startOfWeek, weekendDays]);

  const handleGridChange = (cols: GridColumnsMode) => {
    setGridCols(cols);
    try {
      localStorage.setItem("taskify_weekly_grid_cols", String(cols));
    } catch {
      // Ignore
    }
  };

  const handleDropOnDay = (e: React.DragEvent, targetDay: (typeof weekDays)[0]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDraggedTaskId(null);
    setDragOverDateStr(null);

    if (!taskId) return;

    const targetDayTasks = tasks.filter((t) => {
      if (t.status === "staged") return false;
      if (t.scheduledDate) return t.scheduledDate === targetDay.dateStr;
      return targetDay.isToday;
    });

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isSameDay = task.scheduledDate === targetDay.dateStr || (!task.scheduledDate && targetDay.isToday);
    if (isSameDay) return;

    if (targetDayTasks.length >= 5) {
      useToastStore.getState().addToast(`${targetDay.dayName} has reached the 5-slot daily limit`, "warning");
      return;
    }

    if (onMoveTaskDate) {
      onMoveTaskDate(taskId, targetDay.dateStr);
    } else {
      useTaskStore.getState().updateTask(taskId, {
        scheduledDate: targetDay.dateStr,
        status: "scheduled",
      });
    }

    useToastStore.getState().addToast(`Rescheduled to ${targetDay.dayName}`, "success");
  };

  // Total tasks scheduled in the 7-day window
  const weekDatesSet = new Set(weekDays.map((d) => d.dateStr));
  const totalWeekTasks = tasks.filter(
    (t) =>
      t.status !== "staged" &&
      (t.scheduledDate ? weekDatesSet.has(t.scheduledDate) : t.scheduledDate === todayStr)
  ).length;

  const maxTotalSlots = 7 * 5; // 35 slots across 7 days
  const capacityPct = Math.round((totalWeekTasks / maxTotalSlots) * 100);

  return (
    <div className="space-y-6">
      {/* ── Weekly Capacity Gauge Header ────────────────────────────── */}
      <div className="liquid-glass-light rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-forest" />
              <span>Full Week Horizon ({weekDays[0].monthName} {weekDays[0].dayNum} – {weekDays[6].monthName} {weekDays[6].dayNum})</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-800 border-emerald-300">
              {totalWeekTasks} / {maxTotalSlots} Slots Booked ({capacityPct}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Plan and pace tasks across all 7 days up to 5 focus slots per day.</span>
            <span className="text-slate-400 hidden lg:inline">• Drag tasks between days with open slots</span>
          </p>
        </div>

        {/* ── Grid Switch System (All 7, 4, 3, 1) ────────────────────── */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Layout:
          </span>
          <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
            {GRID_OPTIONS.map(({ cols, label, icon: Icon, title }) => {
              const isSelected = gridCols === cols;
              return (
                <button
                  key={cols}
                  onClick={() => handleGridChange(cols)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-forest text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
                  )}
                  title={title}
                  aria-label={title}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Week Days Grid ─────────────────────────────────────────── */}
      <div className={GRID_CONTAINER_CLASSES[gridCols]}>
        {weekDays.map((day) => {
          // Tasks scheduled for this day
          const dayTasks = tasks.filter((t) => {
            if (t.status === "staged") return false;
            if (t.scheduledDate) {
              return t.scheduledDate === day.dateStr;
            }
            return day.isToday;
          });

          const isFull = dayTasks.length >= 5;
          const slotsRemaining = Math.max(0, 5 - dayTasks.length);

          const isDragOver = dragOverDateStr === day.dateStr;
          const draggedTask = draggedTaskId ? tasks.find((t) => t.id === draggedTaskId) : null;
          const isDraggedFromHere = draggedTask
            ? (draggedTask.scheduledDate === day.dateStr || (!draggedTask.scheduledDate && day.isToday))
            : false;
          const canDrop = Boolean(draggedTaskId && (isDraggedFromHere || slotsRemaining > 0));

          return (
            <div
              key={day.dateStr}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = canDrop ? "move" : "none";
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                if (draggedTaskId) {
                  setDragOverDateStr(day.dateStr);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  if (dragOverDateStr === day.dateStr) {
                    setDragOverDateStr(null);
                  }
                }
              }}
              onDrop={(e) => handleDropOnDay(e, day)}
              className={cn(
                "liquid-glass-light rounded-2xl p-3 sm:p-3.5 border min-h-[300px] flex flex-col justify-between transition-all",
                isDragOver && canDrop && "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10 shadow-lg scale-[1.01]",
                isDragOver && !canDrop && "ring-2 ring-red-400 border-red-400 bg-red-500/10",
                !isDragOver && day.isToday && "border-emerald-400/60 shadow-[0_0_0_1.5px_rgba(16,185,129,0.3)] bg-emerald-500/[0.03]",
                !isDragOver && !day.isToday && day.isWeekend && "border-amber-200/50 bg-amber-500/[0.015]",
                !isDragOver && !day.isToday && !day.isWeekend && "border-white/80"
              )}
            >
              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-xs font-bold leading-tight",
                          day.isToday ? "text-emerald-700" : "text-slate-800"
                        )}
                      >
                        {day.dayName.slice(0, 3)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {day.monthName} {day.dayNum}
                      </span>
                    </div>

                    {day.isWeekend && !day.isToday && (
                      <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                        Weekend
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {day.isToday && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300/40">
                        Today
                      </span>
                    )}

                    {/* Quick + Button in day header */}
                    {!isFull && (
                      <button
                        onClick={() => onAddTaskForDate(day.dateStr)}
                        className="h-6 w-6 rounded-lg bg-forest/10 hover:bg-forest text-forest hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title={`Add task for ${day.dayName}`}
                        aria-label={`Add task for ${day.dayName}`}
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Slot Ratio indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                  <span>{dayTasks.length} of 5 slots</span>
                  <span className={cn(isFull ? "text-red-600 font-bold" : "text-emerald-600 font-medium")}>
                    {isFull ? "Full" : `${slotsRemaining} open`}
                  </span>
                </div>

                {/* Scheduled Tasks in this Day */}
                <div className="space-y-1.5">
                  {/* Drop feedback indicator when dragging over with open slots */}
                  {isDragOver && canDrop && !isDraggedFromHere && (
                    <div className="py-2 px-2.5 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-500/15 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-pulse my-1.5">
                      <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Drop to reschedule here</span>
                    </div>
                  )}

                  {isDragOver && !canDrop && (
                    <div className="py-2 px-2.5 rounded-xl border-2 border-dashed border-red-400 bg-red-50 text-red-600 text-[11px] font-bold flex items-center justify-center gap-1.5 my-1.5">
                      <Lock className="h-3 w-3 text-red-500" />
                      <span>5/5 Slots Full</span>
                    </div>
                  )}

                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", t.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedTaskId(t.id);
                      }}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverDateStr(null);
                      }}
                      className={cn(
                        "group/card p-2 rounded-xl bg-white/80 hover:bg-white border border-white/90 shadow-2xs transition-all space-y-1.5 cursor-grab active:cursor-grabbing",
                        draggedTaskId === t.id && "opacity-40 ring-2 ring-forest scale-95"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <GripVertical className="h-3 w-3 text-slate-300 group-hover/card:text-slate-500 shrink-0 opacity-60 group-hover/card:opacity-100 transition-opacity" />
                          <span
                            className={cn(
                              "text-xs font-semibold text-slate-800 truncate leading-snug flex-1",
                              t.status === "done" && "line-through text-slate-400"
                            )}
                            title={t.title}
                          >
                            {t.title}
                          </span>
                        </div>

                        {/* Inline Edit/Delete on Hover */}
                        <div className="opacity-0 group-hover/card:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                          {onEditTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(t);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                              title="Edit task"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                          )}
                          {onDeleteTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(t.id);
                              }}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pl-4">
                        <ArchetypeBadge archetype={t.archetype} task={t} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Bottom Slot Filler Action Button ──────────────────── */}
              <div className="pt-2 mt-auto">
                {!isFull ? (
                  <button
                    onClick={() => onAddTaskForDate(day.dateStr)}
                    className="w-full py-2 px-2 border-2 border-dashed border-slate-300/80 hover:border-forest/60 hover:bg-white/60 rounded-xl flex items-center justify-center gap-1.5 text-slate-500 hover:text-forest text-[11px] font-semibold transition-all cursor-pointer group"
                  >
                    <Plus className="h-3 w-3 text-slate-400 group-hover:text-forest transition-colors" />
                    <span>Fill Slot {dayTasks.length + 1} of 5</span>
                  </button>
                ) : (
                  <div className="py-1.5 px-2 rounded-xl bg-amber-500/10 border border-amber-300/40 text-amber-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>5/5 Slots Filled</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
