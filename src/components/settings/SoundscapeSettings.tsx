"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX, CloudRain, Trees, Coffee, Waves } from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { soundscapeAudio } from "@/lib/audio/soundscapeAudio";
import { cn } from "@/lib/utils";

export const SOUNDSCAPES = [
  { id: "none", label: "None", icon: VolumeX, desc: "Silent focus" },
  { id: "rain", label: "Rain", icon: CloudRain, desc: "Gentle rainfall" },
  { id: "forest", label: "Forest", icon: Trees, desc: "Pine woods & birds" },
  { id: "cafe", label: "Cafe", icon: Coffee, desc: "Subtle murmur" },
  { id: "white-noise", label: "White Noise", icon: Waves, desc: "Static hum" },
] as const;

export function SoundscapeSettings() {
  const { settings, updateSettings } = useSettingsStore();
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

  return (
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
                    "mt-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 w-full cursor-pointer",
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
  );
}
