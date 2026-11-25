"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimedSectionProps {
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
}

const PRESET_DURATIONS = [15, 25, 45, 60, 90];

export function TimedSection({ durationMinutes, onDurationChange }: TimedSectionProps) {
  return (
    <motion.div
      key="timed"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="p-3.5 bg-white/60 rounded-2xl border border-white/90 space-y-3 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">
          Time Dial
        </span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-200">
          {durationMinutes} Minutes
        </span>
      </div>

      {/* Freeform Slider / Dial */}
      <div className="space-y-1">
        <input
          type="range"
          min="5"
          max="180"
          step="5"
          value={durationMinutes}
          onChange={(e) => onDurationChange(parseInt(e.target.value) || 30)}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sage"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
          <span>5m</span>
          <span>45m</span>
          <span>90m</span>
          <span>180m</span>
        </div>
      </div>

      {/* Quick Preset Dials */}
      <div className="flex gap-1.5 pt-1">
        {PRESET_DURATIONS.map((preset) => (
          <button
            type="button"
            key={preset}
            onClick={() => onDurationChange(preset)}
            className={cn(
              "flex-1 py-1 rounded-lg text-[11px] font-bold border transition-all focus:outline-hidden cursor-pointer",
              durationMinutes === preset
                ? "bg-forest text-white border-forest shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            {preset}m
          </button>
        ))}
      </div>
    </motion.div>
  );
}
