"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { soundscapeAudio } from "@/lib/audio/soundscapeAudio";
import { Modal } from "@/components/ui/Modal";
import {
  Sliders,
  Timer,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Check,
  ShieldAlert,
  Calendar,
  Sparkles,
  CloudRain,
  Trees,
  Coffee,
  Waves,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SOUNDSCAPES = [
  { id: "none", label: "None", icon: VolumeX, desc: "Silent focus" },
  { id: "rain", label: "Rain", icon: CloudRain, desc: "Gentle rainfall" },
  { id: "forest", label: "Forest", icon: Trees, desc: "Pine woods & birds" },
  { id: "cafe", label: "Cafe", icon: Coffee, desc: "Subtle murmur" },
  { id: "white-noise", label: "White Noise", icon: Waves, desc: "Static hum" },
] as const;

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetSettings,
    exportAllData,
    importAllData,
    clearAllAppData,
  } = useSettingsStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [previewingSoundscape, setPreviewingSoundscape] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTogglePreview = (id: typeof SOUNDSCAPES[number]["id"]) => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }

    if (previewingSoundscape === id || id === "none") {
      soundscapeAudio.stop();
      setPreviewingSoundscape(null);
    } else {
      soundscapeAudio.play(id, settings.soundVolume ?? 0.5);
      setPreviewingSoundscape(id);
      previewTimeoutRef.current = setTimeout(() => {
        soundscapeAudio.stop();
        setPreviewingSoundscape(null);
      }, 6000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importAllData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

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
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-600 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* ── Section 1: Focus & Pomodoro Timing ──────────────────────── */}
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

        {/* Automation Toggles */}
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
        </div>
      </div>

      {/* ── Section 2: Capacity Guardrail & Planning ────────────────── */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* First Day of Week */}
          <div className="bg-white/70 p-4 rounded-2xl border border-white/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Start of Week</span>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                {settings.startOfWeek}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(["monday", "sunday"] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => updateSettings({ startOfWeek: day })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border capitalize transition-all cursor-pointer",
                    settings.startOfWeek === day
                      ? "bg-forest text-white border-forest shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              Adjusts the start of the Weekly Horizon and Habit punch-card views.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Ambient Soundscapes ──────────────────────────── */}
      <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Ambient Focus Soundscape
              </h2>
              <p className="text-xs text-slate-500">
                Procedural Web Audio acoustic generator for immersive focus (100% offline).
              </p>
            </div>
          </div>

          {previewingSoundscape && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold border border-blue-500/20 animate-pulse">
              <Waves className="h-3.5 w-3.5" />
              <span>Previewing {previewingSoundscape}...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SOUNDSCAPES.map((s) => {
            const Icon = s.icon;
            const isSelected = settings.soundscape === s.id;
            const isPreviewing = previewingSoundscape === s.id;

            return (
              <div
                key={s.id}
                onClick={() => {
                  updateSettings({ soundscape: s.id });
                  if (s.id !== "none") {
                    handleTogglePreview(s.id);
                  } else {
                    soundscapeAudio.stop();
                    setPreviewingSoundscape(null);
                  }
                }}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer relative group",
                  isSelected
                    ? "bg-forest text-white border-forest shadow-xs"
                    : "bg-white/70 hover:bg-white text-slate-700 border-slate-200/80"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={cn("h-4 w-4", isSelected ? "text-emerald-300" : "text-slate-500")} />
                    {isPreviewing && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-xs font-bold block">{s.label}</span>
                  <span className={cn("text-[10px] leading-snug line-clamp-1", isSelected ? "text-white/70" : "text-slate-400")}>
                    {s.desc}
                  </span>
                </div>

                {s.id !== "none" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePreview(s.id);
                    }}
                    className={cn(
                      "mt-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 w-full",
                      isPreviewing
                        ? "bg-white text-forest border-white shadow-xs"
                        : isSelected
                        ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                    )}
                  >
                    <span>{isPreviewing ? "Stop" : "Preview"}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Volume Slider */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 border border-white/90">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Soundscape Volume</span>
              <span className="text-[10px] text-slate-400">Controls acoustic generator level</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((settings.soundVolume ?? 0.5) * 100)}
              onChange={(e) => {
                const vol = Number(e.target.value) / 100;
                updateSettings({ soundVolume: vol });
                soundscapeAudio.setVolume(vol);
              }}
              className="w-36 accent-forest cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-600 w-10 text-right">
              {Math.round((settings.soundVolume ?? 0.5) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 4: Data Management & Backups (Sprint 7.10) ──────── */}
      <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
          <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Data Management &amp; Backups
            </h2>
            <p className="text-xs text-slate-500">
              Your data is completely private and stored locally. Export or restore backups anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            onClick={exportAllData}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4 text-forest" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="h-4 w-4 text-blue-600" />
            <span>Restore Backup (JSON)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Clear Data Danger Zone */}
          <button
            onClick={() => setIsClearAllConfirmOpen(true)}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-50/80 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* ── Confirmation Modals ────────────────────────────────────── */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset All Preferences?"
        description="This will restore all timer durations, soundscapes, and capacity settings to factory defaults."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            onClick={() => setIsResetConfirmOpen(false)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              resetSettings();
              setIsResetConfirmOpen(false);
            }}
            className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-light cursor-pointer shadow-xs"
          >
            Reset Preferences
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isClearAllConfirmOpen}
        onClose={() => setIsClearAllConfirmOpen(false)}
        title="Permanently Clear All App Data?"
        description="Warning: This will permanently delete all tasks, backlog items, habit logs, and reflections stored on this device. This action cannot be undone."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            onClick={() => setIsClearAllConfirmOpen(false)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearAllAppData();
              setIsClearAllConfirmOpen(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs"
          >
            Yes, Clear Everything
          </button>
        </div>
      </Modal>
    </div>
  );
}
