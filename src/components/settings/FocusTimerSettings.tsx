"use client";

import { Timer, Sparkles } from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { soundscapeAudio } from "@/lib/audio/soundscapeAudio";
import { cn } from "@/lib/utils";

export function FocusTimerSettings() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
        <div className="p-1.5 rounded-xl bg-forest/10 text-forest">
          <Timer className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Focus &amp; Pomodoro Timers
          </h2>
          <p className="text-xs text-slate-500">
            Customize session length and interval rhythms for deep work.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Work Duration */}
        <div className="space-y-1.5 bg-white/70 p-3.5 rounded-2xl border border-white/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Focus Session</span>
            <span className="text-xs font-bold font-mono text-forest">
              {settings.pomodoroDuration}m
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => updateSettings({ pomodoroDuration: mins })}
                className={cn(
                  "py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                  settings.pomodoroDuration === mins
                    ? "bg-forest text-white border-forest shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Short Break */}
        <div className="space-y-1.5 bg-white/70 p-3.5 rounded-2xl border border-white/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Short Break</span>
            <span className="text-xs font-bold font-mono text-emerald-700">
              {settings.shortBreak}m
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[3, 5, 8, 10].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => updateSettings({ shortBreak: mins })}
                className={cn(
                  "py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                  settings.shortBreak === mins
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Long Break */}
        <div className="space-y-1.5 bg-white/70 p-3.5 rounded-2xl border border-white/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Long Break</span>
            <span className="text-xs font-bold font-mono text-purple-700">
              {settings.longBreak}m
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => updateSettings({ longBreak: mins })}
                className={cn(
                  "py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                  settings.longBreak === mins
                    ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Automation & Audio Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <label className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/90 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Auto-start Breaks
            </span>
            <span className="text-[11px] text-slate-400">
              Automatically start countdown when focus period ends
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.autoStartBreaks}
            onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
            className="h-4 w-4 rounded text-forest focus:ring-sage accent-forest cursor-pointer"
          />
        </label>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/90">
          <label className="flex items-center gap-3 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
              className="h-4 w-4 rounded text-forest focus:ring-sage accent-forest cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Sound Chimes
              </span>
              <span className="text-[11px] text-slate-400">
                Play soothing singing bowl chime when a cycle finishes
              </span>
            </div>
          </label>
          <button
            type="button"
            onClick={() => soundscapeAudio.playChime()}
            className="ml-2 px-2.5 py-1.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold border border-forest/20 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            title="Test completion chime"
          >
            <Sparkles className="h-3 w-3" />
            <span>Test Chime</span>
          </button>
        </div>

        {/* Keep Screen Awake on Mobile */}
        <label className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/90 cursor-pointer sm:col-span-2">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Keep Screen Awake on Mobile
            </span>
            <span className="text-[11px] text-slate-400">
              Prevents phone display from sleeping or auto-locking during active focus sessions and countdowns
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.keepScreenAwake !== false}
            onChange={(e) => updateSettings({ keepScreenAwake: e.target.checked })}
            className="h-4 w-4 rounded text-forest focus:ring-sage accent-forest cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
