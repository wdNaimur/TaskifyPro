import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCheck,
  ArrowLeft,
  Compass,
  Calendar,
  Sparkles,
  Timer,
  BarChart3,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Taskify",
  description: "The page or destination you are looking for does not exist in Taskify.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#EEF2EF] text-slate-charcoal flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      {/* ── Ambient Background Glow Orbs ───────────────────────────── */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#588176]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1F332D]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <header className="w-full max-w-4xl flex items-center justify-between relative z-10 pt-2">
        <Link
          href="/tasks"
          className="flex items-center gap-3 group focus:outline-hidden"
          title="Return to Taskify"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-md ring-1 ring-white/40 transition-transform group-hover:scale-105">
            <CheckCheck className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-forest leading-none">
              Taskify
            </span>
            <span className="text-[11px] font-medium text-sage leading-tight mt-0.5">
              Personal Productivity Cockpit
            </span>
          </div>
        </Link>

        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest/70 hover:text-forest bg-white/70 hover:bg-white border border-white/80 px-3.5 py-1.5 rounded-full shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </Link>
      </header>

      {/* ── Main Glass Card ───────────────────────────────────────── */}
      <main className="relative z-10 my-auto w-full max-w-lg py-8">
        <div className="liquid-glass-light rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center shadow-xl border border-white/80">
          {/* Compass Icon Emblem with Pulsing Ring */}
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-forest/5 border border-forest/10 flex items-center justify-center text-forest shadow-inner">
              <Compass className="w-10 h-10 text-forest animate-pulse" strokeWidth={1.8} />
            </div>
            <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-forest text-white font-mono text-[11px] font-bold shadow-xs">
              404
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-fredoka text-5xl sm:text-6xl font-bold text-forest tracking-tight mb-2">
            Lost Coordinates
          </h1>

          <p className="text-slate-muted text-sm sm:text-base leading-relaxed max-w-sm mb-8">
            The page or workspace view you requested doesn&apos;t exist, has been archived, or was moved to another location.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-8">
            <Link
              href="/tasks"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-forest text-white font-semibold text-sm shadow-md hover:bg-forest-dark hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Today&apos;s Focus</span>
            </Link>

            <Link
              href="/manage"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/90 hover:bg-white text-forest border border-forest/15 font-semibold text-sm shadow-xs hover:border-forest/30 transition-all active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4 text-sage" />
              <span>Planning Horizon</span>
            </Link>
          </div>

          {/* Quick Shortcuts Matrix */}
          <div className="w-full pt-6 border-t border-forest/10 flex flex-col items-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sage mb-3">
              Direct Quick Links
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/focus"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-charcoal bg-white/60 hover:bg-white border border-forest/5 hover:border-forest/20 shadow-2xs transition-colors"
              >
                <Timer className="w-3.5 h-3.5 text-sage" />
                <span>Deep Focus</span>
              </Link>
              <Link
                href="/habits"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-charcoal bg-white/60 hover:bg-white border border-forest/5 hover:border-forest/20 shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-sage" />
                <span>Habit Matrix</span>
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-charcoal bg-white/60 hover:bg-white border border-forest/5 hover:border-forest/20 shadow-2xs transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-sage" />
                <span>Analytics</span>
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-charcoal bg-white/60 hover:bg-white border border-forest/5 hover:border-forest/20 shadow-2xs transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-sage" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center text-xs text-slate-muted/80 pb-2">
        <p>Taskify Pro • Mindful Productivity System</p>
      </footer>
    </div>
  );
}
