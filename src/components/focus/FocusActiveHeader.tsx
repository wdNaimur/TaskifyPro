"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Maximize2,
  Minimize2,
  StopCircle,
  RotateCcw,
  Sun,
  RotateCw,
} from "lucide-react";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { toast } from "@/lib/stores/toastStore";
import { triggerConfetti } from "@/lib/utils/confetti";
import { FocusSoundMenu } from "@/components/focus/FocusSoundMenu";
import { VisualizerMode } from "@/components/focus/FocusSetupScreen";
import { cn } from "@/lib/utils";

interface FocusActiveHeaderProps {
  visualizerMode: VisualizerMode;
  onVisualizerModeChange: (mode: VisualizerMode) => void;
  isControlsVisible: boolean;
  isRotated: boolean;
  onToggleRotation: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isWakeLockActive: boolean;
  onRequestWakeLock: () => void;
  onReleaseWakeLock: () => void;
}

export function FocusActiveHeader({
  visualizerMode,
  onVisualizerModeChange,
  isControlsVisible,
  isRotated,
  onToggleRotation,
  isFullscreen,
  onToggleFullscreen,
  isWakeLockActive,
  onRequestWakeLock,
  onReleaseWakeLock,
}: FocusActiveHeaderProps) {
  const router = useRouter();
  const { isSessionActive, isRunning, activeTaskId, resetTimer, stopSession } = usePomodoroStore();
  const { toggleTaskDone } = useTaskStore();
  const { settings, updateSettings } = useSettingsStore();

  return (
    <header
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "z-30 w-full transition-all duration-500 cursor-default",
        isSessionActive
          ? "absolute top-0 inset-x-0 pt-3 sm:pt-5 pb-6 sm:pb-8 px-3 sm:px-8 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none"
          : "relative w-full",
        isSessionActive && !isControlsVisible && isRunning
          ? "opacity-0 -translate-y-3 pointer-events-none"
          : "opacity-100 translate-y-0"
      )}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 pointer-events-auto flex-wrap sm:flex-nowrap">
        {/* Left: Back to Tasks */}
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer shrink-0",
            !isSessionActive
              ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
              : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10 backdrop-blur-md"
          )}
          title="Back to Tasks"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tasks</span>
        </button>

        {/* Center: In session, display Visualizer switcher; else title */}
        {isSessionActive ? (
          <>
            {/* Mobile Single Toggle Button */}
            <button
              type="button"
              onClick={() => onVisualizerModeChange(visualizerMode === "float" ? "forest" : "float")}
              className="sm:hidden px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md shadow-2xs shrink-0"
              title="Tap to switch between Float and Forest modes"
            >
              <span>{visualizerMode === "float" ? "🫧 Float" : "🌲 Forest"}</span>
            </button>

            {/* Tablet/Desktop Dual Pill Switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0">
              <button
                type="button"
                onClick={() => onVisualizerModeChange("float")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  visualizerMode === "float"
                    ? "bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <span>🫧</span>
                <span>Float</span>
              </button>

              <button
                type="button"
                onClick={() => onVisualizerModeChange("forest")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  visualizerMode === "forest"
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <span>🌲</span>
                <span>Forest</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center hidden sm:block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Focus Setup &amp; Configuration
            </span>
          </div>
        )}

        {/* Right: In-Session Action Controls & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Ambient Soundscape Controller */}
          <FocusSoundMenu isSessionActive={isSessionActive} />

          {/* Reset timer back to full duration */}
          {isSessionActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetTimer();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5 cursor-pointer backdrop-blur-md"
              title="Reset timer to full duration"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Finish task */}
          {isSessionActive && activeTaskId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerConfetti(e.clientX, e.clientY);
                toggleTaskDone(activeTaskId);
                stopSession();
                router.push("/tasks");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Finish</span>
            </button>
          )}

          {/* Stop session & return to setup dialer */}
          {isSessionActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                stopSession();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
              title="Stop session and return to setup"
            >
              <StopCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}

          {/* Keep Screen Awake on Mobile Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = !(settings.keepScreenAwake !== false);
              updateSettings({ keepScreenAwake: next });
              if (next) {
                onRequestWakeLock();
                toast.success("Display will stay awake during focus");
              } else {
                onReleaseWakeLock();
                toast.info("Display sleep allowed");
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer backdrop-blur-md",
              settings.keepScreenAwake !== false
                ? isWakeLockActive
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : !isSessionActive
                  ? "bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 shadow-2xs"
                  : "bg-white/10 text-white/80 border-white/10"
                : !isSessionActive
                ? "bg-white/40 text-slate-400 border-slate-200/50 hover:text-slate-600"
                : "bg-white/5 text-white/40 border-white/5 hover:text-white/70"
            )}
            title={
              settings.keepScreenAwake !== false
                ? isWakeLockActive
                  ? "Screen Awake is active (screen will not dim or lock on mobile)"
                  : "Screen Awake is enabled"
                : "Screen sleep allowed (click to keep awake)"
            }
          >
            <Sun className={cn("h-3.5 w-3.5", isWakeLockActive ? "text-amber-400 animate-pulse" : "opacity-60")} />
            <span className="hidden sm:inline">
              {settings.keepScreenAwake !== false ? (isWakeLockActive ? "Awake" : "Awake") : "Sleep OK"}
            </span>
          </button>

          {/* Screen Rotation / Desk Clock Mode */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleRotation();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer backdrop-blur-md",
              isRotated
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                : !isSessionActive
                ? "bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 shadow-2xs"
                : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5"
            )}
            title={isRotated ? "Exit Desk Clock mode" : "Rotate to Desk Clock (Landscape)"}
          >
            <RotateCw className={cn("h-3.5 w-3.5 transition-transform duration-300", isRotated ? "rotate-90 text-purple-400" : "opacity-70")} />
            <span className="hidden sm:inline">{isRotated ? "Desk Clock" : "Rotate"}</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullscreen();
            }}
            className={cn(
              "p-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
              !isSessionActive
                ? "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs"
                : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/5 backdrop-blur-md"
            )}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
