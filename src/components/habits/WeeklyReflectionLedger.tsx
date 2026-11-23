"use client";

import { useState, useEffect } from "react";
import { WeeklyReflection } from "@/lib/stores/habitStore";
import { Sparkles, Check, Bookmark, ArrowRight, ShieldCheck } from "lucide-react";

interface WeeklyReflectionLedgerProps {
  currentWeekKey: string;
  reflection?: WeeklyReflection;
  onSaveReflection: (weekKey: string, updates: Partial<WeeklyReflection>) => void;
}

export function WeeklyReflectionLedger({
  currentWeekKey,
  reflection,
  onSaveReflection,
}: WeeklyReflectionLedgerProps) {
  const [wins, setWins] = useState(reflection?.wins || "");
  const [friction, setFriction] = useState(reflection?.friction || "");
  const [nextFocus, setNextFocus] = useState(reflection?.nextFocus || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setWins(reflection?.wins || "");
    setFriction(reflection?.friction || "");
    setNextFocus(reflection?.nextFocus || "");
  }, [reflection]);

  const handleSave = () => {
    onSaveReflection(currentWeekKey, {
      wins,
      friction,
      nextFocus,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-6 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800">
              Weekly Reflection &amp; Ledger
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              {currentWeekKey}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Step back and reflect on friction, momentum, and system refinements.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ml-auto sm:ml-0"
        >
          {isSaved ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          <span>{isSaved ? "Saved!" : "Save Reflection"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Wins & Momentum */}
        <div className="bg-white/70 rounded-2xl p-4 border border-white/90 shadow-2xs space-y-2 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Wins &amp; Momentum</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Which habits felt effortless? What progress was made?
          </p>
          <textarea
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            placeholder="e.g. Consistent morning walks, maintained zero inbox 4 days straight..."
            rows={5}
            className="w-full flex-1 mt-1 bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 transition-all resize-none font-medium"
          />
        </div>

        {/* Card 2: Friction & Obstacles */}
        <div className="bg-white/70 rounded-2xl p-4 border border-white/90 shadow-2xs space-y-2 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <Bookmark className="h-4 w-4 text-amber-600" />
            <span>Friction &amp; Obstacles</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Where did resistance occur? What triggered missed days?
          </p>
          <textarea
            value={friction}
            onChange={(e) => setFriction(e.target.value)}
            placeholder="e.g. Late meetings disrupted hydration, skipped reading when tired..."
            rows={5}
            className="w-full flex-1 mt-1 bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 transition-all resize-none font-medium"
          />
        </div>

        {/* Card 3: Next Week's Anchor */}
        <div className="bg-white/70 rounded-2xl p-4 border border-white/90 shadow-2xs space-y-2 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-forest">
            <ArrowRight className="h-4 w-4 text-forest" />
            <span>Next Week&apos;s Anchor</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            What is the single most important routine to protect?
          </p>
          <textarea
            value={nextFocus}
            onChange={(e) => setNextFocus(e.target.value)}
            placeholder="e.g. Protect 8am slot for deep work, prepare gym gear night before..."
            rows={5}
            className="w-full flex-1 mt-1 bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 transition-all resize-none font-medium"
          />
        </div>
      </div>
    </div>
  );
}
