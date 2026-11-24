"use client";

import { useState, useEffect } from "react";
import { Plus, Lock, Calendar, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { ArchetypeBadge } from "@/components/tasks/ArchetypeBadge";
import { cn } from "@/lib/utils";

interface WeeklyHorizonTabProps {
  tasks: Task[];
  onAddTaskForDate: (dateStr: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
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

// Helper to compute dates for the full 7-day week (Monday to Sunday)
function getWeekDaysData() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // day: 0=Sun, 1=Mon, ..., 6=Sat
  const jsDay = now.getDay();
  // Monday-first offset:
  // If Sunday (0), distance to Monday is -6 days
  // Otherwise distance to Monday is 1 - jsDay
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return ALL_WEEK_DAYS.map((dayName, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);

    const dateStr = dayDate.toISOString().split("T")[0];
    const dayNum = dayDate.getDate();
    const monthName = dayDate.toLocaleDateString("en-US", { month: "short" });
    const isToday = dateStr === todayStr;
    const isWeekend = dayName === "Saturday" || dayName === "Sunday";

    return {
      dayName,
      dateStr,
      dayNum,
      monthName,
      isToday,
      isWeekend,
    };
  });
}

const STATIC_WEEK_DAYS = ALL_WEEK_DAYS.map((dayName, idx) => ({
  dayName,
  dateStr: `day-${idx + 1}`,
  dayNum: idx + 1,
  monthName: "",
  isToday: false,
  isWeekend: dayName === "Saturday" || dayName === "Sunday",
}));

export function WeeklyHorizonTab({
  tasks,
  onAddTaskForDate,
  onEditTask,
  onDeleteTask,
}: WeeklyHorizonTabProps) {
  const [weekDays, setWeekDays] = useState(STATIC_WEEK_DAYS);
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setWeekDays(getWeekDaysData());
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

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
          <p className="text-xs text-slate-500 mt-1">
            Plan and pace tasks across all 7 days (including weekends) up to 5 focus slots per day.
          </p>
        </div>

        {/* Progress bar across 35 weekly slots */}
        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
            <span>Weekly Load</span>
            <span>{totalWeekTasks}/35 slots</span>
          </div>
          <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalWeekTasks / maxTotalSlots) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 7-Day Grid: Mon, Tue, Wed, Thu, Fri, Sat, Sun ───────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          // Tasks scheduled for this day
          const dayTasks = tasks.filter((t) => {
            if (t.status === "staged") return false;
            if (t.scheduledDate) {
              return t.scheduledDate === day.dateStr;
            }
            // Fallback for tasks created without explicit date that default to today
            return day.isToday;
          });

          const isFull = dayTasks.length >= 5;
          const slotsRemaining = Math.max(0, 5 - dayTasks.length);

          return (
            <div
              key={day.dateStr}
              className={cn(
                "liquid-glass-light rounded-2xl p-3 sm:p-3.5 border min-h-[300px] flex flex-col justify-between transition-all",
                day.isToday
                  ? "border-emerald-400/60 shadow-[0_0_0_1.5px_rgba(16,185,129,0.3)] bg-emerald-500/[0.03]"
                  : day.isWeekend
                  ? "border-amber-200/50 bg-amber-500/[0.015]"
                  : "border-white/80"
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
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="group/card p-2 rounded-xl bg-white/80 hover:bg-white border border-white/90 shadow-2xs transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span
                          className={cn(
                            "text-xs font-semibold text-slate-800 truncate leading-snug flex-1",
                            t.status === "done" && "line-through text-slate-400"
                          )}
                          title={t.title}
                        >
                          {t.title}
                        </span>

                        {/* Inline Edit/Delete on Hover */}
                        <div className="opacity-0 group-hover/card:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                          {onEditTask && (
                            <button
                              onClick={() => onEditTask(t)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                              title="Edit task"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                          )}
                          {onDeleteTask && (
                            <button
                              onClick={() => onDeleteTask(t.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                              title="Delete task"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
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
