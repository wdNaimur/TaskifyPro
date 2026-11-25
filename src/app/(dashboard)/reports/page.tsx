"use client";

import { useState, useEffect, useMemo } from "react";
import { useTaskStore } from "@/lib/stores/taskStore";
import { useHabitStore } from "@/lib/stores/habitStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { computeWeekDays, formatLocalDate } from "@/lib/utils/date";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Hash,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Priority } from "@/types";
import { cn } from "@/lib/utils";

const ALL_WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATIC_WEEK_VELOCITY = ALL_WEEK_DAYS.map((dayName, idx) => ({
  dayName,
  shortName: dayName.slice(0, 3),
  dayNumber: idx + 1,
  dateStr: `day-${idx + 1}`,
  isToday: false,
  isWeekend: false,
  tasksDone: 0,
  habitsDone: 0,
  score: 0,
}));

export default function ReportsPage() {
  const { tasks } = useTaskStore();
  const { habits, logs } = useHabitStore();
  const { settings } = useSettingsStore();

  const startOfWeek = settings?.startOfWeek || "monday";
  const weekendDays = settings?.weekendDays || ["saturday", "sunday"];

  // ── Metrics Calculation ──────────────────────────────────────────
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "done"), [tasks]);
  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== "staged"), [tasks]);

  const completionRate = useMemo(() => {
    if (activeTasks.length === 0) return 0;
    return Math.round((completedTasks.length / activeTasks.length) * 100);
  }, [activeTasks, completedTasks]);

  // Total Focus Minutes logged
  const totalFocusMinutes = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.completedMinutes || 0), 0);
  }, [tasks]);

  const focusHours = Math.floor(totalFocusMinutes / 60);
  const remainingFocusMins = totalFocusMinutes % 60;

  // Archetype distribution
  const archetypeCounts = useMemo(() => {
    const counts = { checklist: 0, counter: 0, timed: 0 };
    tasks.forEach((t) => {
      if (t.archetype in counts) {
        counts[t.archetype as keyof typeof counts]++;
      }
    });
    return counts;
  }, [tasks]);

  // Priority breakdown of completed tasks
  const priorityCounts = useMemo(() => {
    const counts: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };
    counts.P0 = completedTasks.filter((t) => t.priority === "P0").length;
    counts.P1 = completedTasks.filter((t) => t.priority === "P1").length;
    counts.P2 = completedTasks.filter((t) => t.priority === "P2").length;
    return counts;
  }, [completedTasks]);

  // 7-day velocity chart data - computed client-side to avoid unstable prerender
  const [weekVelocity, setWeekVelocity] = useState(STATIC_WEEK_VELOCITY);

  useEffect(() => {
    const weekDays = computeWeekDays(startOfWeek, weekendDays);

    const computed = weekDays.map((day) => {
      // Completed tasks for this day (based on scheduledDate or updatedAt)
      const dayCompleted = completedTasks.filter((t) => {
        const rawDate = t.updatedAt || t.createdAt;
        const d = rawDate ? formatLocalDate(new Date(rawDate)) : "";
        return d === day.dateStr || t.scheduledDate === day.dateStr;
      }).length;

      // Habit checks on this day
      const habitDoneCount = habits.filter((h) => {
        return !!logs[`${h.id}_${day.dateStr}`]?.done;
      }).length;

      return {
        dayName: day.dayName,
        shortName: day.shortName,
        dayNumber: day.dayNum,
        dateStr: day.dateStr,
        isToday: day.isToday,
        isWeekend: day.isWeekend,
        tasksDone: dayCompleted,
        habitsDone: habitDoneCount,
        score: dayCompleted * 20 + habitDoneCount * 15,
      };
    });
    setWeekVelocity(computed);
  }, [completedTasks, habits, logs, startOfWeek, weekendDays]);

  const maxVelocityScore = useMemo(() => {
    return Math.max(100, ...weekVelocity.map((w) => w.score));
  }, [weekVelocity]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep work velocity, focus duration metrics, and archetype distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/manage"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all"
          >
            <span>Plan Ahead</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Summary Cards Metric Bar ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Focus Time */}
        <div className="liquid-glass-light rounded-2xl p-4 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Focus Time
            </span>
            <span className="text-base font-bold text-slate-800">
              {focusHours > 0 ? `${focusHours}h ${remainingFocusMins}m` : `${remainingFocusMins}m`}
            </span>
          </div>
        </div>

        {/* Task Completion Velocity */}
        <div className="liquid-glass-light rounded-2xl p-4 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Velocity
            </span>
            <span className="text-base font-bold text-slate-800">
              {completionRate}% Complete
            </span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="liquid-glass-light rounded-2xl p-4 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tasks Conquered
            </span>
            <span className="text-base font-bold text-slate-800">
              {completedTasks.length} Finished
            </span>
          </div>
        </div>

        {/* High-Leverage P0/P1 */}
        <div className="liquid-glass-light rounded-2xl p-4 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              High Leverage
            </span>
            <span className="text-base font-bold text-slate-800">
              {priorityCounts.P0 + priorityCounts.P1} P0/P1
            </span>
          </div>
        </div>
      </div>

      {/* ── 7-Day Velocity Heatmap / Bar Chart ──────────────────────── */}
      <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Weekly Execution Velocity
            </h2>
            <p className="text-xs text-slate-500">
              Activity density across tasks conquered and habit rhythms.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Current Week</span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-6 pb-2 min-h-[180px]">
          {weekVelocity.map((w) => {
            const heightPct = Math.max(12, Math.round((w.score / maxVelocityScore) * 100));

            return (
              <div key={w.dateStr} className="flex flex-col items-center gap-2 group">
                {/* Tooltip on hover */}
                <span className="text-[10px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.tasksDone}T / {w.habitsDone}H
                </span>

                {/* Animated Bar Column */}
                <div className="w-full max-w-[48px] h-32 bg-slate-100 rounded-2xl p-1 flex items-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={cn(
                      "w-full rounded-xl transition-all duration-500 shadow-2xs",
                      w.isToday
                        ? "bg-forest shadow-md"
                        : w.score > 0
                        ? "bg-emerald-600/80 group-hover:bg-emerald-600"
                        : "bg-slate-200/80"
                    )}
                  />
                </div>

                {/* Date Label */}
                <div className="text-center">
                  <span
                    className={cn(
                      "block text-[10px] uppercase font-bold leading-none",
                      w.isToday
                        ? "text-forest"
                        : w.isWeekend
                        ? "text-amber-600/80 font-extrabold"
                        : "text-slate-400"
                    )}
                  >
                    {w.shortName}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold mt-0.5 block leading-none",
                      w.isToday ? "text-forest" : "text-slate-700"
                    )}
                  >
                    {w.dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Archetype & Priority Distribution Grid ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Archetype Distribution */}
        <div className="liquid-glass-light rounded-3xl p-5 border border-white/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Task Archetypes
            </h3>
            <span className="text-[11px] text-slate-400">{tasks.length} Total</span>
          </div>

          <div className="space-y-3">
            {/* Checklist */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Checklists</span>
                </span>
                <span className="font-mono text-slate-500">{archetypeCounts.checklist}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${tasks.length > 0 ? (archetypeCounts.checklist / tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Timed Blocks */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Timed Focus Blocks</span>
                </span>
                <span className="font-mono text-slate-500">{archetypeCounts.timed}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${tasks.length > 0 ? (archetypeCounts.timed / tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Counters */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Quantitative Counters</span>
                </span>
                <span className="font-mono text-slate-500">{archetypeCounts.counter}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${tasks.length > 0 ? (archetypeCounts.counter / tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Priority Leverage */}
        <div className="liquid-glass-light rounded-3xl p-5 border border-white/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Priority Focus Leverage
            </h3>
            <span className="text-[11px] text-slate-400">{completedTasks.length} Completed</span>
          </div>

          <div className="space-y-3">
            {/* P0 Urgent */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-red-500/10 border border-red-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-red-900">P0 Urgent Bottlenecks</span>
              </div>
              <span className="text-xs font-mono font-bold text-red-800">
                {priorityCounts.P0} completed
              </span>
            </div>

            {/* P1 High */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-900">P1 Core Deep Work</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {priorityCounts.P1} completed
              </span>
            </div>

            {/* P2 Normal */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-xs font-bold text-slate-700">P2 Routine Maintenance</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {priorityCounts.P2} completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Completed Tasks Ledger ─────────────────────────────────── */}
      <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Completed Execution Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Historical record of tasks conquered.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {completedTasks.length} Tasks
          </span>
        </div>

        {completedTasks.length === 0 ? (
          <div className="py-8 text-center space-y-1.5">
            <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No completed tasks recorded yet</p>
            <p className="text-[11px] text-slate-400">
              Head to the Tasks cockpit and check off your focus slots to populate analytics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-1">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="py-2.5 px-2 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate line-through opacity-75">
                    {t.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                      t.priority === "P0"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : t.priority === "P1"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}
                  >
                    {t.priority}
                  </span>

                  {t.completedMinutes && t.completedMinutes > 0 ? (
                    <span className="text-[10px] font-mono text-slate-400">
                      {t.completedMinutes}m focus
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
