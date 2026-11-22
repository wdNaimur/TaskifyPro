"use client";

import { Settings, Sliders, Volume2, ShieldCheck, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pomodoro interval configuration, capacity throttling, ambient audio, and data export.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-300/40 text-slate-800 text-xs font-bold">
          <Settings className="h-3.5 w-3.5 text-slate-600" />
          <span>Sprint 7 &amp; 8</span>
        </div>
      </div>

      {/* ── Polished Feature Preview Card ───────────────────────────── */}
      <div className="liquid-glass-light rounded-3xl p-8 sm:p-12 border border-white/80 shadow-xs flex flex-col items-center justify-center text-center space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-slate-500/10 border border-slate-300/40 flex items-center justify-center text-slate-600 shadow-inner">
          <Sliders className="h-8 w-8" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Preferences &amp; System Configuration
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure default Pomodoro lengths (work/short/long break), customize daily 5-slot
            thresholds, pick focus soundscapes, and manage your offline IndexedDB backups.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 border border-white/90 text-slate-700 text-xs font-semibold shadow-2xs">
            <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Soundscapes (Rain, Forest, Cafe)</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 border border-white/90 text-slate-700 text-xs font-semibold shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>5-Slot Throttle Guardrails</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 border border-white/90 text-slate-700 text-xs font-semibold shadow-2xs">
            <Database className="h-3.5 w-3.5 text-amber-600" />
            <span>JSON / CSV Data Export</span>
          </span>
        </div>

        {/* Action Link to Tasks */}
        <div className="pt-4">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95"
          >
            <span>Return to Tasks Cockpit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
