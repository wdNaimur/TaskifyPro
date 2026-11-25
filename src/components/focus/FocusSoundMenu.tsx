"use client";

import { useState } from "react";
import { Volume2, VolumeX, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { soundscapeAudio, SoundscapeType } from "@/lib/audio/soundscapeAudio";
import { cn } from "@/lib/utils";

const SOUNDSCAPE_OPTIONS = [
  { id: "none", label: "Muted (Silent)" },
  { id: "rain", label: "Rainfall" },
  { id: "forest", label: "Pine Forest" },
  { id: "cafe", label: "Cafe Murmur" },
  { id: "white-noise", label: "White Noise" },
] as const;

interface FocusSoundMenuProps {
  isSessionActive: boolean;
}

export function FocusSoundMenu({ isSessionActive }: FocusSoundMenuProps) {
  const { settings, updateSettings } = useSettingsStore();
  const { isRunning } = usePomodoroStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectSoundscape = (id: SoundscapeType) => {
    updateSettings({ soundscape: id });
    if (id === "none") {
      soundscapeAudio.stop();
    } else {
      soundscapeAudio.play(id, settings.soundVolume ?? 0.5);
    }
  };

  const handleVolumeChange = (vol: number) => {
    updateSettings({ soundVolume: vol });
    soundscapeAudio.setVolume(vol);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer backdrop-blur-md",
          isOpen
            ? "bg-white/20 text-white border-white/20"
            : !isSessionActive
            ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
            : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5"
        )}
        title="Ambient Focus Soundscape"
      >
        {settings.soundscape === "none" ? (
          <VolumeX className="h-3.5 w-3.5 opacity-60" />
        ) : (
          <Volume2 className={cn("h-3.5 w-3.5 text-emerald-400", isRunning && "animate-pulse")} />
        )}
        <span className="capitalize">{settings.soundscape === "none" ? "Muted" : settings.soundscape}</span>
      </button>

      {/* Soundscape Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-52 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl text-white z-50 space-y-3 cursor-default"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Ambient Soundscape
            </div>
            <div className="grid grid-cols-1 gap-1">
              {SOUNDSCAPE_OPTIONS.map((s) => {
                const isSelected = settings.soundscape === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSoundscape(s.id as SoundscapeType)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                        : "hover:bg-white/10 text-white/70"
                    )}
                  >
                    <span>{s.label}</span>
                    {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            {settings.soundscape !== "none" && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-white/50 font-bold">
                  <span>Volume</span>
                  <span>{Math.round((settings.soundVolume ?? 0.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((settings.soundVolume ?? 0.5) * 100)}
                  onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
