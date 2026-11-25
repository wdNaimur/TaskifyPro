"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { FocusTimerSettings } from "@/components/settings/FocusTimerSettings";
import { CalendarSettings } from "@/components/settings/CalendarSettings";
import { SoundscapeSettings } from "@/components/settings/SoundscapeSettings";
import { DataBackupSettings } from "@/components/settings/DataBackupSettings";
import { DangerZoneSettings } from "@/components/settings/DangerZoneSettings";

export default function SettingsPage() {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure focus intervals, daily capacity guardrails, soundscapes, and data backups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-600 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* ── Section 1: Focus & Pomodoro Timing ──────────────────────── */}
      <FocusTimerSettings />

      {/* ── Section 2: Capacity Guardrail & Schedule ────────────────── */}
      <CalendarSettings />

      {/* ── Section 3: Ambient Soundscapes ──────────────────────────── */}
      <SoundscapeSettings />

      {/* ── Section 4: Data Management & Backups ────────────────────── */}
      <DataBackupSettings onOpenClearAllModal={() => setIsClearAllConfirmOpen(true)} />

      {/* ── Danger Zone & Reset Confirmation Modals ─────────────────── */}
      <DangerZoneSettings
        isResetConfirmOpen={isResetConfirmOpen}
        onCloseResetConfirm={() => setIsResetConfirmOpen(false)}
        isClearAllConfirmOpen={isClearAllConfirmOpen}
        onCloseClearAllConfirm={() => setIsClearAllConfirmOpen(false)}
      />
    </div>
  );
}
