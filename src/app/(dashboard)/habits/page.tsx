"use client";

import { useState, useMemo } from "react";
import { useHabitStore } from "@/lib/stores/habitStore";
import { HabitMatrix } from "@/components/habits/HabitMatrix";
import { WeeklyReflectionLedger } from "@/components/habits/WeeklyReflectionLedger";
import { HabitModal } from "@/components/habits/HabitModal";
import { Habit } from "@/types";
import {
  Sparkles,
  Plus,
  Flame,
  CheckCircle2,
  CalendarCheck,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Compute current ISO week string, e.g. "2026-W47"
function getCurrentWeekKey(): string {
  const d = new Date();
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export default function HabitsPage() {
  const {
    habits,
    logs,
    reflections,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    incrementHabitDayValue,
    saveReflection,
  } = useHabitStore();

  const [activeTab, setActiveTab] = useState<"matrix" | "reflection">("matrix");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const currentWeekKey = useMemo(() => getCurrentWeekKey(), []);

  // Compute key stats for header overview
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayCompletedCount = useMemo(() => {
    return habits.filter((h) => !!logs[`${h.id}_${todayStr}`]?.done).length;
  }, [habits, logs, todayStr]);

  const maxStreak = useMemo(() => {
    return habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;
  }, [habits]);

  const handleOpenCreateModal = () => {
    setHabitToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  const handleSaveHabit = (habitData: Omit<Habit, "id" | "streak" | "createdAt">) => {
    if (habitToEdit) {
      updateHabit(habitToEdit.id, habitData);
    } else {
      addHabit(habitData);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* ── Page Header: Title + Stats + "+ New Habit" ─────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Habit Matrix &amp; Streaks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Build consistency, track daily streaks, and complete weekly reflection check-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Tab Switcher */}
          <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/80 shadow-xs">
            <button
              onClick={() => setActiveTab("matrix")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "matrix"
                  ? "text-slate-900 shadow-xs bg-white"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Weekly Matrix
            </button>
            <button
              onClick={() => setActiveTab("reflection")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "reflection"
                  ? "text-slate-900 shadow-xs bg-white"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Reflection Ledger
            </button>
          </div>

          {/* "+ New Habit" CTA */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-forest hover:bg-forest-light text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* ── Stats Metric Bar ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="liquid-glass-light rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today&apos;s Rhythm
            </span>
            <span className="text-base font-bold text-slate-800">
              {todayCompletedCount} / {habits.length} Done
            </span>
          </div>
        </div>

        <div className="liquid-glass-light rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 fill-amber-500" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Top Streak
            </span>
            <span className="text-base font-bold text-slate-800">
              {maxStreak} Days
            </span>
          </div>
        </div>

        <div className="liquid-glass-light rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Habits
            </span>
            <span className="text-base font-bold text-slate-800">
              {habits.length} Routines
            </span>
          </div>
        </div>

        <div className="liquid-glass-light rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cycle
            </span>
            <span className="text-base font-bold text-slate-800 font-mono">
              {currentWeekKey}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main View Content ───────────────────────────────────────── */}
      {habits.length === 0 ? (
        /* Empty State */
        <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80 shadow-xs space-y-3">
          <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No habits configured yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Build consistency with small, sustainable routines. Track daily check-offs or weekly reflections.
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-forest hover:bg-forest-light text-white rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Habit</span>
            </button>
          </div>
        </div>
      ) : activeTab === "matrix" ? (
        <HabitMatrix
          habits={habits}
          logs={logs}
          onToggleDay={toggleHabitDay}
          onIncrementDayValue={incrementHabitDayValue}
          onEditHabit={handleOpenEditModal}
          onDeleteHabit={deleteHabit}
        />
      ) : (
        <WeeklyReflectionLedger
          currentWeekKey={currentWeekKey}
          reflection={reflections[currentWeekKey]}
          onSaveReflection={saveReflection}
        />
      )}

      {/* ── Habit Creation / Edit Modal ─────────────────────────────── */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
      />
    </div>
  );
}
