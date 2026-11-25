"use client";

import { motion } from "framer-motion";

interface CounterSectionProps {
  targetCount: number;
  unit: string;
  onTargetCountChange: (count: number) => void;
  onUnitChange: (unit: string) => void;
}

export function CounterSection({
  targetCount,
  unit,
  onTargetCountChange,
  onUnitChange,
}: CounterSectionProps) {
  return (
    <motion.div
      key="counter"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="p-3 bg-white/60 rounded-2xl border border-white/90 space-y-2.5 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">
          Target Repetitions
        </span>
        <span className="text-xs font-semibold text-emerald-800">
          {targetCount} {unit || "times"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
            Target Count
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={targetCount}
            onChange={(e) => onTargetCountChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
            Unit (Optional)
          </label>
          <input
            type="text"
            placeholder="glasses, pages, reps..."
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40"
          />
        </div>
      </div>
    </motion.div>
  );
}
