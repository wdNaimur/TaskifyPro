"use client";

import { Task } from "@/types";

interface WeeklyHorizonTabProps {
  todayTasks: Task[];
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function WeeklyHorizonTab({ todayTasks }: WeeklyHorizonTabProps) {
  // Current day index (1 = Tuesday in standard demo setup)
  const currentDayIndex = 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {WEEK_DAYS.map((day, idx) => {
          const isToday = idx === currentDayIndex;

          return (
            <div
              key={day}
              className="liquid-glass-light rounded-2xl p-3.5 border border-white/80 min-h-[220px] flex flex-col"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
                <span className="text-xs font-bold text-slate-800">{day}</span>
                {isToday && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300/40">
                    Today
                  </span>
                )}
              </div>

              {/* Day Tasks List */}
              <div className="flex-1 space-y-2">
                {isToday ? (
                  todayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="text-xs font-semibold p-2 rounded-xl bg-white/70 border border-white/90 truncate text-slate-700 shadow-xs"
                    >
                      {t.title}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                    Open capacity
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
