"use client";

import { useState, useRef, useEffect } from "react";
import { Sliders, Calendar, ChevronDown, Check } from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { DayOfWeek } from "@/types";
import { ALL_DAYS_OF_WEEK } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

export function CalendarSettings() {
  const { settings, updateSettings } = useSettingsStore();

  const [isStartOfWeekOpen, setIsStartOfWeekOpen] = useState(false);
  const [isWeekendDaysOpen, setIsWeekendDaysOpen] = useState(false);
  const startOfWeekRef = useRef<HTMLDivElement>(null);
  const weekendDaysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startOfWeekRef.current && !startOfWeekRef.current.contains(event.target as Node)) {
        setIsStartOfWeekOpen(false);
      }
      if (weekendDaysRef.current && !weekendDaysRef.current.contains(event.target as Node)) {
        setIsWeekendDaysOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentWeekendDays = settings.weekendDays || ["saturday", "sunday"];

  const handleToggleWeekendDay = (dayId: DayOfWeek) => {
    const exists = currentWeekendDays.includes(dayId);
    let next: DayOfWeek[];
    if (exists) {
      next = currentWeekendDays.filter((d) => d !== dayId);
    } else {
      next = [...currentWeekendDays, dayId];
    }
    updateSettings({ weekendDays: next });
  };

  return (
    <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
        <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600">
          <Sliders className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Capacity Guardrails &amp; Schedule
          </h2>
          <p className="text-xs text-slate-500">
            The Rule of 5: Prevent over-commitment and burnout with hard daily slot ceilings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Slot Limit */}
        <div className="bg-white/70 p-4 rounded-2xl border border-white/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Daily Slot Limit</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-forest text-white">
              {settings.dailyCapacity} Slots Max
            </span>
          </div>
          <div className="flex gap-1.5 pt-1">
            {[3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateSettings({ dailyCapacity: num })}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  settings.dailyCapacity === num
                    ? "bg-forest text-white border-forest shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 pt-0.5">
            5 is scientifically proven to maximize deep work while minimizing cognitive fatigue.
          </p>
        </div>

        {/* Start of Week Dropdown */}
        <div className="bg-white/70 p-4 rounded-2xl border border-white/90 space-y-2 relative" ref={startOfWeekRef}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Start of Week</span>
            <span className="text-[11px] font-mono font-bold text-slate-400 capitalize">
              {ALL_DAYS_OF_WEEK.find((d) => d.id === settings.startOfWeek)?.name || "Monday"}
            </span>
          </div>

          {/* Dropdown Trigger */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setIsStartOfWeekOpen((prev) => !prev);
                setIsWeekendDaysOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-forest" />
                <span className="capitalize">
                  {ALL_DAYS_OF_WEEK.find((d) => d.id === settings.startOfWeek)?.name || "Monday"}
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isStartOfWeekOpen && "rotate-180")} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {isStartOfWeekOpen && (
            <div className="absolute left-4 right-4 mt-1 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select First Day of Week
              </div>
              {ALL_DAYS_OF_WEEK.map((day) => {
                const isSelected = settings.startOfWeek === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      updateSettings({ startOfWeek: day.id });
                      setIsStartOfWeekOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                      isSelected
                        ? "bg-forest/10 text-forest font-bold"
                        : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    <span>{day.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-forest" />}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[10px] text-slate-400 pt-0.5">
            Controls the starting day across your Weekly Horizon and Habit Matrix.
          </p>
        </div>

        {/* Weekend Settings Multiple Select Dropdown */}
        <div className="bg-white/70 p-4 rounded-2xl border border-white/90 space-y-2 relative" ref={weekendDaysRef}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Weekend Days</span>
            <span className="text-[11px] font-mono font-bold text-amber-700">
              {currentWeekendDays.length} {currentWeekendDays.length === 1 ? "day" : "days"}
            </span>
          </div>

          {/* Dropdown Trigger */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setIsWeekendDaysOpen((prev) => !prev);
                setIsStartOfWeekOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 transition-all cursor-pointer min-h-[40px]"
            >
              <div className="flex flex-wrap items-center gap-1 max-w-[85%]">
                {currentWeekendDays.length === 0 ? (
                  <span className="text-xs text-slate-400">No weekend days set</span>
                ) : (
                  currentWeekendDays.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-300/50 text-amber-900 font-bold text-[11px] capitalize"
                    >
                      {d.slice(0, 3)}
                    </span>
                  ))
                )}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200", isWeekendDaysOpen && "rotate-180")} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {isWeekendDaysOpen && (
            <div className="absolute left-4 right-4 mt-1 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl z-50 p-2 space-y-1">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Designate Weekends
                </span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => updateSettings({ weekendDays: ["saturday", "sunday"] })}
                    className="text-forest hover:underline font-semibold cursor-pointer"
                  >
                    Sat/Sun
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => updateSettings({ weekendDays: ["friday", "saturday"] })}
                    className="text-forest hover:underline font-semibold cursor-pointer"
                  >
                    Fri/Sat
                  </button>
                </div>
              </div>

              <div className="space-y-0.5 pt-1">
                {ALL_DAYS_OF_WEEK.map((day) => {
                  const isChecked = currentWeekendDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleToggleWeekendDay(day.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                        isChecked
                          ? "bg-amber-500/10 text-amber-900 font-bold"
                          : "hover:bg-slate-100 text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by button onClick
                          className="h-3.5 w-3.5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 pointer-events-none"
                        />
                        <span>{day.name}</span>
                      </div>
                      {isChecked && (
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          Weekend
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-400 pt-0.5">
            Days marked as weekends receive distinct amber badges and rest tints in Weekly Horizon.
          </p>
        </div>
      </div>
    </div>
  );
}
