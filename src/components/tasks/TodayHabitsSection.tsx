"use client";

import Link from "next/link";
import {
  Flame,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Hash,
  Clock,
  Droplets,
  Footprints,
  BookOpen,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { Habit } from "@/types";
import { useHabitStore } from "@/lib/stores/habitStore";
import { formatLocalDate } from "@/lib/utils/date";
import { triggerConfetti } from "@/lib/utils/confetti";
import { cn } from "@/lib/utils";

interface TodayHabitsSectionProps {
  todayStr?: string;
}

function getHabitIcon(habit: Habit): { icon: LucideIcon; colorClass: string; bgClass: string } {
  const title = habit.title.toLowerCase();

  if (title.includes("water") || title.includes("hydrat") || title.includes("drink")) {
    return { icon: Droplets, colorClass: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-200/50" };
  }
  if (title.includes("walk") || title.includes("run") || title.includes("step") || title.includes("workout") || title.includes("gym")) {
    return { icon: Footprints, colorClass: "text-emerald-600", bgClass: "bg-emerald-500/10 border-emerald-200/50" };
  }
  if (title.includes("read") || title.includes("book") || title.includes("learn") || title.includes("page")) {
    return { icon: BookOpen, colorClass: "text-purple-600", bgClass: "bg-purple-500/10 border-purple-200/50" };
  }
  if (title.includes("inbox") || title.includes("desk") || title.includes("clean") || title.includes("mail")) {
    return { icon: Inbox, colorClass: "text-amber-600", bgClass: "bg-amber-500/10 border-amber-200/50" };
  }

  // Fallback to archetype type icons
  switch (habit.type) {
    case "quantitative":
      return { icon: Hash, colorClass: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-200/50" };
    case "timed":
      return { icon: Clock, colorClass: "text-amber-500", bgClass: "bg-amber-500/10 border-amber-200/50" };
    case "reflection":
      return { icon: Sparkles, colorClass: "text-purple-500", bgClass: "bg-purple-500/10 border-purple-200/50" };
    default:
      return { icon: CheckSquare, colorClass: "text-forest", bgClass: "bg-forest/10 border-forest/20" };
  }
}

export function TodayHabitsSection({ todayStr: propTodayStr }: TodayHabitsSectionProps) {
  const { habits, logs, toggleHabitDay, incrementHabitDayValue } = useHabitStore();
  const todayStr = propTodayStr || formatLocalDate();

  if (habits.length === 0) {
    return null;
  }

  // Calculate completed count for today
  const completedCount = habits.filter((h) => {
    const key = `${h.id}_${todayStr}`;
    return !!logs[key]?.done;
  }).length;

  const totalHabits = habits.length;
  const isAllDone = totalHabits > 0 && completedCount === totalHabits;
  const completionRatio = Math.round((completedCount / totalHabits) * 100);

  const handleToggle = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    const key = `${habit.id}_${todayStr}`;
    const wasDone = !!logs[key]?.done;

    if (!wasDone) {
      triggerConfetti(e.clientX, e.clientY);
    }
    toggleHabitDay(habit.id, todayStr, habit.targetValue || 1);
  };

  const handleIncrement = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    const key = `${habit.id}_${todayStr}`;
    const currentVal = logs[key]?.value || 0;
    const targetVal = habit.targetValue || 1;

    if (currentVal + 1 >= targetVal) {
      triggerConfetti(e.clientX, e.clientY);
    }
    incrementHabitDayValue(habit.id, todayStr, 1, targetVal);
  };

  return (
    <section className="space-y-3 pt-2">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>Daily Habits &amp; Routines</span>
          </h4>
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all",
              isAllDone
                ? "bg-emerald-500/10 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {isAllDone ? (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>All {totalHabits} Done!</span>
              </span>
            ) : (
              `${completedCount}/${totalHabits} Done (${completionRatio}%)`
            )}
          </span>
        </div>

        <Link
          href="/habits"
          className="text-[11px] font-semibold text-slate-400 hover:text-forest transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Habit Matrix</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* ── Habits Shelf Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {habits.map((habit) => {
          const key = `${habit.id}_${todayStr}`;
          const log = logs[key];
          const isDone = !!log?.done;
          const currentValue = log?.value || 0;
          const targetValue = habit.targetValue || 1;
          const isQuantitative = habit.type === "quantitative";
          const { icon: Icon, colorClass, bgClass } = getHabitIcon(habit);

          // Quantitative progress pct
          const progressPct = Math.min(100, Math.round((currentValue / targetValue) * 100));

          return (
            <div
              key={habit.id}
              className={cn(
                "liquid-glass-light rounded-2xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between gap-3 shadow-2xs relative group select-none",
                isDone
                  ? "border-emerald-300/60 bg-emerald-500/[0.04] shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                  : "border-white/80 hover:border-slate-200/90 hover:bg-white/90"
              )}
            >
              {/* Top Row: Icon + Title + Streak Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "p-1.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      bgClass
                    )}
                  >
                    <Icon className={cn("h-4 w-4", colorClass)} />
                  </div>
                  <div className="min-w-0">
                    <h5
                      className={cn(
                        "text-xs font-bold text-slate-800 truncate transition-colors",
                        isDone && "line-through text-slate-400"
                      )}
                      title={habit.title}
                    >
                      {habit.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {isQuantitative
                        ? `${currentValue}/${targetValue} ${habit.unit || "times"}`
                        : habit.type === "timed"
                        ? `${habit.targetValue || 20} min target`
                        : "Daily routine"}
                    </span>
                  </div>
                </div>

                {/* Streak Badge */}
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-lg border flex items-center gap-0.5 shrink-0",
                    habit.streak > 0
                      ? "bg-amber-500/10 text-amber-800 border-amber-300/40"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  )}
                  title={`${habit.streak} day streak`}
                >
                  <Flame className={cn("h-3 w-3", habit.streak > 0 ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
                  <span>{habit.streak}d</span>
                </span>
              </div>

              {/* Progress bar for Quantitative Habits */}
              {isQuantitative && (
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isDone ? "bg-emerald-500" : "bg-forest"
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {isQuantitative ? (
                  <>
                    {/* +1 Button */}
                    <button
                      type="button"
                      onClick={(e) => handleIncrement(e, habit)}
                      disabled={isDone}
                      className={cn(
                        "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs",
                        isDone
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-300/50 cursor-default"
                          : "bg-forest hover:bg-forest-light text-white shadow-xs"
                      )}
                    >
                      {isDone ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Complete</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          <span>+1 {habit.unit || ""}</span>
                        </>
                      )}
                    </button>

                    {/* Checkbox toggle / reset */}
                    <button
                      type="button"
                      onClick={(e) => handleToggle(e, habit)}
                      className={cn(
                        "h-7 w-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90",
                        isDone
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                          : "bg-white/80 hover:bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                      )}
                      title={isDone ? "Mark incomplete" : "Mark fully completed"}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </button>
                  </>
                ) : (
                  /* Binary / Timed / Reflection Full Width Button */
                  <button
                    type="button"
                    onClick={(e) => handleToggle(e, habit)}
                    className={cn(
                      "w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs border",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-300/60 text-emerald-800"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90"
                    )}
                  >
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-full flex items-center justify-center transition-all",
                        isDone ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                      )}
                    >
                      {isDone && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span>{isDone ? "Done for Today" : "Mark Done"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
