"use client";

import { useMemo } from "react";
import { Play, RotateCcw, Coffee, Sparkles, AlertCircle } from "lucide-react";
import { CurvedArcDial } from "@/components/focus/CurvedArcDial";
import { FocusTaskDropdown } from "@/components/focus/FocusTaskDropdown";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

export type VisualizerMode = "float" | "forest";

interface FocusSetupScreenProps {
  tasks: Task[];
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  onSelectTask: (task: Task | null) => void;
  onAddNewTask?: () => void;
  hasTaskError?: boolean;
  focusMinutes: number;
  onFocusMinutesChange: (mins: number) => void;
  breakMinutes: number;
  onBreakMinutesChange: (mins: number) => void;
  visualizerMode: VisualizerMode;
  onVisualizerModeChange: (mode: VisualizerMode) => void;
  onStartFocus: () => void;
  onResetDefaults: () => void;
}

const FOCUS_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [
  { label: "3M", minutes: 3 },
  { label: "5M", minutes: 5 },
  { label: "10M", minutes: 10 },
  { label: "15M", minutes: 15 },
];

const VISUALIZER_OPTIONS: { id: VisualizerMode; label: string; icon: string; desc: string }[] = [
  { id: "float", label: "Float", icon: "🫧", desc: "Minimalist bubble clock" },
  { id: "forest", label: "Forest", icon: "🌲", desc: "Organic living growth" },
];

export function FocusSetupScreen({
  tasks,
  activeTaskId,
  activeTaskTitle,
  onSelectTask,
  onAddNewTask,
  hasTaskError = false,
  focusMinutes,
  onFocusMinutesChange,
  breakMinutes,
  onBreakMinutesChange,
  visualizerMode,
  onVisualizerModeChange,
  onStartFocus,
  onResetDefaults,
}: FocusSetupScreenProps) {
  // Format the giant digital time display: "25 : 00"
  const formattedMinutes = useMemo(() => {
    return `${String(focusMinutes).padStart(2, "0")} : 00`;
  }, [focusMinutes]);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId);
  }, [tasks, activeTaskId]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center select-none py-6 px-4">
      {/* ── 1. Top: Task Choice Dropdown based on Priority ─────────── */}
      <div className="mb-6 sm:mb-8 flex flex-col items-center gap-2">
        <FocusTaskDropdown
          tasks={tasks}
          activeTaskId={activeTaskId}
          activeTaskTitle={activeTaskTitle}
          onSelectTask={(task) => {
            onSelectTask(task);
            if (task?.durationMinutes) {
              onFocusMinutesChange(task.durationMinutes);
            }
          }}
          onAddNewTask={onAddNewTask}
          hasError={hasTaskError}
        />

        {/* Linked Task Context Hint / Validation Alert */}
        {activeTask ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 text-[11px] text-slate-600 font-medium border border-slate-200/80">
            <span>
              {activeTask.archetype === "checklist"
                ? "⚡ Checklist"
                : activeTask.archetype === "counter"
                ? "🔢 Countable"
                : "⏱ Timed Block"}
            </span>
            <span>•</span>
            <span className="font-mono">
              {activeTask.completedMinutes || 0}m logged
              {activeTask.durationMinutes ? ` / ${activeTask.durationMinutes}m est` : ""}
            </span>
          </div>
        ) : hasTaskError ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Select or create a task above to link this session</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 font-medium">
            Link a task to accumulate focused time on it
          </p>
        )}
      </div>

      {/* ── 2. Giant Digital Clock Display ─────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-800 font-sans tabular-nums select-none leading-none">
          {formattedMinutes}
        </h1>
        <p className="text-[11px] font-bold tracking-[0.22em] text-slate-400 uppercase pt-1">
          DRAG DIAL TO SET MINUTES
        </p>
      </div>

      {/* ── 3. Curved Arc Rotary Dial (inspired by the photo) ───────── */}
      <div className="w-full my-3 sm:my-5">
        <CurvedArcDial
          value={focusMinutes}
          onChange={onFocusMinutesChange}
          min={5}
          max={90}
          step={1}
        />
      </div>

      {/* ── 4. Quick Focus Preset Chips ────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {FOCUS_PRESETS.map((mins) => {
          const isSelected = focusMinutes === mins;
          return (
            <button
              key={mins}
              type="button"
              onClick={() => onFocusMinutesChange(mins)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white/80 hover:bg-white text-slate-600 border-slate-200/80 shadow-2xs"
              )}
            >
              {mins}m
            </button>
          );
        })}
      </div>

      {/* ── 5. Bottom: Break Time Selector & Visualizer Choice ──────── */}
      <div className="w-full max-w-md bg-white/70 rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 mb-6">
        {/* Break Duration Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Coffee className="h-3.5 w-3.5 text-amber-600" />
            <span>Break Duration</span>
          </div>

          <div className="flex items-center gap-1">
            {BREAK_PRESETS.map((b) => {
              const isSelected = breakMinutes === b.minutes;
              return (
                <button
                  key={b.minutes}
                  type="button"
                  onClick={() => onBreakMinutesChange(b.minutes)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualizer Mode Selection */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Immersion Screen</span>
          </div>

          <div className="flex items-center gap-1">
            {VISUALIZER_OPTIONS.map((opt) => {
              const isSelected = visualizerMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onVisualizerModeChange(opt.id)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                    isSelected
                      ? "bg-forest text-white border-forest shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                  title={opt.desc}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 6. Primary Action: ▶ START FOCUS ───────────────────────── */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onStartFocus}
            className="flex items-center gap-2 px-9 py-3.5 rounded-full bg-[#1F2430] hover:bg-[#2C3446] text-white text-sm font-bold shadow-xl active:scale-95 transition-all cursor-pointer min-w-[170px] justify-center"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
            <span>START FOCUS</span>
          </button>

          <button
            onClick={onResetDefaults}
            className="h-12 w-12 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            title="Reset timer to 25m focus / 5m break"
          >
            <RotateCcw className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {hasTaskError && !activeTaskId && (
          <p className="text-xs text-red-500 font-semibold mt-1">
            ⚠️ Please link a task above before starting
          </p>
        )}
      </div>
    </div>
  );
}
