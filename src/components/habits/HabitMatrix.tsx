"use client";

import { useState, useEffect } from "react";
import { Habit, HabitLogEntry } from "@/types";
import {
  Flame,
  Check,
  CheckSquare,
  Hash,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HabitMatrixProps {
  habits: Habit[];
  logs: Record<string, HabitLogEntry>;
  onToggleDay: (habitId: string, dateStr: string, targetValue?: number) => void;
  onIncrementDayValue: (habitId: string, dateStr: string, delta: number, targetValue?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
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

const STATIC_HABIT_DAYS = ALL_WEEK_DAYS.map((dayName, idx) => ({
  dayName,
  shortName: dayName.slice(0, 3),
  dayNumber: idx + 1,
  dateStr: `day-${idx + 1}`,
  isToday: false,
}));

export function HabitMatrix({
  habits,
  logs,
  onToggleDay,
  onIncrementDayValue,
  onEditHabit,
  onDeleteHabit,
}: HabitMatrixProps) {
  // Compute the 7 days of the current week (Monday to Sunday) on client mount to avoid unstable prerender
  const [weekDays, setWeekDays] = useState(STATIC_HABIT_DAYS);

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const jsDay = now.getDay();
    const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = ALL_WEEK_DAYS.map((dayName, idx) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + idx);
      const dateStr = dayDate.toISOString().split("T")[0];
      const isToday = dateStr === todayStr;

      return {
        dayName,
        shortName: dayName.slice(0, 3),
        dayNumber: dayDate.getDate(),
        dateStr,
        isToday,
      };
    });
    setWeekDays(days);
  }, []);

  const getArchetypeIcon = (type: Habit["type"]) => {
    switch (type) {
      case "quantitative":
        return <Hash className="h-3.5 w-3.5 text-blue-500" />;
      case "timed":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      case "reflection":
        return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="liquid-glass-light rounded-3xl p-4 sm:p-6 border border-white/80 shadow-xs space-y-4 select-none">
      {/* ── Table Header / Days of the Week ───────────────────────── */}
      <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200/60 items-center text-xs font-bold text-slate-500">
        <div className="col-span-5 sm:col-span-4 px-2">
          <span>Habit &amp; Streak</span>
        </div>

        <div className="col-span-7 sm:col-span-8 grid grid-cols-7 gap-1 text-center">
          {weekDays.map((d) => (
            <div
              key={d.dateStr}
              className={cn(
                "py-1.5 px-1 rounded-xl flex flex-col items-center transition-all",
                d.isToday
                  ? "bg-forest text-white font-extrabold shadow-xs"
                  : "text-slate-600"
              )}
            >
              <span className="text-[10px] uppercase tracking-wider leading-none">
                {d.shortName}
              </span>
              <span className="text-xs mt-0.5 leading-none">{d.dayNumber}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Habit Rows ────────────────────────────────────────────── */}
      <div className="divide-y divide-slate-100 space-y-1">
        {habits.map((habit) => {
          // Count completed days for this week
          const completedThisWeek = weekDays.filter((d) => {
            const log = logs[`${habit.id}_${d.dateStr}`];
            return !!log?.done;
          }).length;

          const completionPct = Math.round((completedThisWeek / 7) * 100);

          return (
            <div
              key={habit.id}
              className="grid grid-cols-12 gap-2 py-3 items-center group hover:bg-white/40 rounded-2xl px-2 transition-colors"
            >
              {/* Left Column: Title, Icon, Target, Streak & Actions */}
              <div className="col-span-5 sm:col-span-4 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded-lg bg-white/80 border border-slate-200/80 shadow-2xs shrink-0">
                    {getArchetypeIcon(habit.type)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate" title={habit.title}>
                    {habit.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {/* Streak Flame Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border",
                      habit.streak > 0
                        ? "bg-amber-500/10 text-amber-700 border-amber-300/40"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    )}
                    title={`Current consecutive-day streak: ${habit.streak}`}
                  >
                    <Flame className={cn("h-3 w-3", habit.streak > 0 ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                    <span>{habit.streak}d streak</span>
                  </div>

                  {/* Target Badge */}
                  {habit.targetValue && habit.targetValue > 1 && (
                    <span className="text-[10px] font-medium text-slate-400">
                      {habit.targetValue} {habit.unit || ""}
                    </span>
                  )}

                  {/* Quick Row Actions on Hover */}
                  <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Habit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Habit"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 7 Punch-Card Day Cells */}
              <div className="col-span-7 sm:col-span-8 grid grid-cols-7 gap-1 text-center items-center">
                {weekDays.map((d) => {
                  const key = `${habit.id}_${d.dateStr}`;
                  const log = logs[key];
                  const isDone = !!log?.done;
                  const currentVal = log?.value || 0;
                  const targetVal = habit.targetValue || 1;

                  return (
                    <div key={d.dateStr} className="flex justify-center">
                      {habit.type === "quantitative" && !isDone ? (
                        /* Quantitative Habit In-Progress: Incrementer Button */
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            onIncrementDayValue(habit.id, d.dateStr, 1, targetVal)
                          }
                          className={cn(
                            "h-9 w-9 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer",
                            currentVal > 0
                              ? "bg-blue-50/80 border-blue-200 text-blue-700"
                              : "bg-white/60 hover:bg-white border-slate-200/80 text-slate-400 hover:text-slate-700",
                            d.isToday && "ring-2 ring-forest/20"
                          )}
                          title={`${currentVal}/${targetVal} ${habit.unit || ""}. Click to +1.`}
                        >
                          <span className="text-[10px] font-bold leading-none font-mono">
                            {currentVal > 0 ? currentVal : <Plus className="h-3 w-3" />}
                          </span>
                        </motion.button>
                      ) : (
                        /* Standard Check-off Button */
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onToggleDay(habit.id, d.dateStr, targetVal)}
                          className={cn(
                            "h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
                            isDone
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white/60 hover:bg-white hover:border-slate-300 border-slate-200/80 text-transparent hover:text-slate-300",
                            d.isToday && !isDone && "border-forest/40 ring-1 ring-forest/20"
                          )}
                          title={`${habit.title} on ${d.dayName}: ${isDone ? "Completed" : "Mark as completed"}`}
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
