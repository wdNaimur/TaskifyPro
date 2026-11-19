"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandByVisualizerProps {
  timeLeft: number;
  progressRatio: number;
  mode: "work" | "shortBreak" | "longBreak";
  isRunning: boolean;
  activeTaskTitle: string | null;
}

export function StandByVisualizer({
  timeLeft,
  progressRatio,
  mode,
  isRunning,
  activeTaskTitle,
}: StandByVisualizerProps) {
  // StandBy Theme: "solar" (classic MagSafe neon green + orange) | "nightstand" (deep red shift) | "mono" (minimal white)
  const [standByTheme, setStandByTheme] = useState<"solar" | "nightstand" | "mono">("solar");

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isHoursMode = hours > 0;

  const primaryStr = isHoursMode
    ? String(hours).padStart(2, "0")
    : String(minutes).padStart(2, "0");

  const secondaryStr = isHoursMode
    ? String(minutes).padStart(2, "0")
    : String(seconds).padStart(2, "0");

  const themes = {
    solar: {
      primaryDigits: "text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]",
      secondaryDigits: "text-orange-500 drop-shadow-[0_0_35px_rgba(249,115,22,0.35)]",
      colon: "text-emerald-400",
      accentGlow: "bg-emerald-500/20",
      ringColor: "#10b981",
      badgeColor: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
    },
    nightstand: {
      primaryDigits: "text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.4)]",
      secondaryDigits: "text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.35)]",
      colon: "text-red-400",
      accentGlow: "bg-red-600/15",
      ringColor: "#ef4444",
      badgeColor: "bg-red-500/15 border-red-500/30 text-red-300",
    },
    mono: {
      primaryDigits: "text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]",
      secondaryDigits: "text-slate-300 drop-shadow-[0_0_30px_rgba(203,213,225,0.2)]",
      colon: "text-white/60",
      accentGlow: "bg-white/10",
      ringColor: "#ffffff",
      badgeColor: "bg-white/10 border-white/20 text-white/80",
    },
  };

  const currentTheme = themes[standByTheme];

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center select-none py-2">
      {/* ── MagSafe Wireless Charging Snap-On Halo Animation ───────── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Animated breathing magnetic ring */}
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.06, 1] : 1,
            opacity: isRunning ? [0.2, 0.4, 0.2] : 0.15,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={cn("h-[480px] w-[480px] rounded-full blur-3xl", currentTheme.accentGlow)}
        />
      </div>

      {/* ── StandBy Screen Main Body ────────────────────────────────── */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-12 px-4">
        {/* LEFT / CENTER: Giant Iconic StandBy Digital Clock */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center font-mono font-black tracking-tighter leading-none">
            {/* Primary (Hours or Minutes) */}
            <div className={cn("text-7xl sm:text-8xl md:text-9xl transition-colors duration-500", currentTheme.primaryDigits)}>
              {primaryStr}
            </div>

            {/* Pulsing Colon (iOS Style) */}
            <motion.div
              animate={{ opacity: isRunning ? [1, 0.2, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className={cn("text-6xl sm:text-7xl md:text-8xl px-1 sm:px-2 pb-2 sm:pb-4", currentTheme.colon)}
            >
              :
            </motion.div>

            {/* Secondary (Minutes or Seconds) */}
            <div className={cn("text-7xl sm:text-8xl md:text-9xl transition-colors duration-500", currentTheme.secondaryDigits)}>
              {secondaryStr}
            </div>
          </div>

          {/* Unit Legend */}
          <div className="flex items-center gap-16 text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase mt-2">
            <span>{isHoursMode ? "HRS" : "MIN"}</span>
            <span>{isHoursMode ? "MIN" : "SEC"}</span>
          </div>
        </div>

        {/* RIGHT / SUB: StandBy Widget Squircle Panel */}
        <div className="flex flex-col items-center lg:items-start gap-3 bg-white/5 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl min-w-[260px] sm:min-w-[280px]">
          {/* Wireless Charging / MagSafe Status Header */}
          <div className="flex items-center justify-between w-full">
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", currentTheme.badgeColor)}>
              <Zap className="h-3 w-3 fill-current animate-pulse" />
              <span>{mode === "work" ? "Deep Focus" : "Break Mode"}</span>
            </div>

            {/* Quick StandBy Palette Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStandByTheme("solar")}
                className={cn(
                  "h-4 w-4 rounded-full border border-white/30 transition-transform active:scale-90 cursor-pointer",
                  standByTheme === "solar" ? "bg-orange-500 ring-2 ring-white/50" : "bg-orange-950"
                )}
                title="Solar Colorway"
                aria-label="Solar Colorway"
              />
              <button
                type="button"
                onClick={() => setStandByTheme("nightstand")}
                className={cn(
                  "h-4 w-4 rounded-full border border-white/30 transition-transform active:scale-90 cursor-pointer",
                  standByTheme === "nightstand" ? "bg-red-500 ring-2 ring-white/50" : "bg-red-950"
                )}
                title="Nightstand Red Shift"
                aria-label="Nightstand Red Shift"
              />
              <button
                type="button"
                onClick={() => setStandByTheme("mono")}
                className={cn(
                  "h-4 w-4 rounded-full border border-white/30 transition-transform active:scale-90 cursor-pointer",
                  standByTheme === "mono" ? "bg-white ring-2 ring-white/50" : "bg-neutral-800"
                )}
                title="Monochrome"
                aria-label="Monochrome"
              />
            </div>
          </div>

          {/* Active Task Name */}
          <div className="mt-1 w-full text-center lg:text-left">
            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              Focus Lock
            </p>
            <h3 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-sm mt-0.5 max-w-[240px]">
              {activeTaskTitle || "General Focus"}
            </h3>
          </div>

          {/* StandBy Horizontal Progress Gauge */}
          <div className="w-full mt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-1.5">
              <span>
                {isHoursMode
                  ? `${hours}h ${minutes}m left`
                  : `${minutes}m ${String(seconds).padStart(2, "0")}s left`}
              </span>
              <span className="font-bold text-white">{Math.round(progressRatio * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round(progressRatio * 100)}%`,
                  backgroundColor: currentTheme.ringColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
