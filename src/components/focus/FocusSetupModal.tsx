"use client";

import { useState, useEffect } from "react";
import { Timer, Play, Coffee, Layers, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useTaskStore } from "@/lib/stores/taskStore";
import { cn } from "@/lib/utils";

const FOCUS_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];
const PART_OPTIONS = [1, 2, 3, 4];

export function FocusSetupModal() {
  const {
    isLauncherOpen,
    launcherInitialData,
    closeLauncher,
    startSession,
  } = usePomodoroStore();

  const { tasks } = useTaskStore();
  const pendingTasks = tasks.filter((t) => t.status !== "staged" && t.status !== "done");

  // Form State
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>("");
  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [totalParts, setTotalParts] = useState<number>(1);

  // Sync state whenever launcher opens with initial data
  useEffect(() => {
    if (isLauncherOpen) {
      if (launcherInitialData?.taskId) {
        setSelectedTaskId(launcherInitialData.taskId);
        setSelectedTaskTitle(launcherInitialData.taskTitle || "");
        const found = tasks.find((t) => t.id === launcherInitialData.taskId);
        if (found && found.archetype === "timed") {
          const remaining = Math.max(0, (found.durationMinutes || 30) - (found.completedMinutes || 0));
          setFocusMinutes(remaining > 0 ? remaining : found.durationMinutes || 25);
        } else if (launcherInitialData.durationMinutes) {
          setFocusMinutes(launcherInitialData.durationMinutes);
        } else {
          setFocusMinutes(25);
        }
      } else {
        setSelectedTaskId("");
        setSelectedTaskTitle("");
        setFocusMinutes(25);
      }
      setBreakMinutes(5);
      setTotalParts(1);
    }
  }, [isLauncherOpen, launcherInitialData, tasks]);

  // Handle task dropdown change
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (!taskId) {
      setSelectedTaskTitle("");
      return;
    }
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      setSelectedTaskTitle(found.title);
      if (found.archetype === "timed") {
        const remaining = Math.max(0, (found.durationMinutes || 30) - (found.completedMinutes || 0));
        setFocusMinutes(remaining > 0 ? remaining : found.durationMinutes || 25);
      } else if (found.durationMinutes) {
        setFocusMinutes(found.durationMinutes);
      }
    }
  };

  const handleStart = () => {
    startSession({
      taskId: selectedTaskId || null,
      taskTitle: selectedTaskTitle || (selectedTaskId ? "Focus Task" : "General Focus"),
      focusMinutes,
      breakMinutes,
      totalParts,
    });
  };

  // Calculate total focus time block
  const totalDurationMinutes =
    totalParts === 1
      ? focusMinutes
      : totalParts * focusMinutes + (totalParts - 1) * breakMinutes;

  return (
    <Modal
      isOpen={isLauncherOpen}
      onClose={closeLauncher}
      title="Start Focus Session"
      description="Configure your focus block, duration, and breaks"
      icon={<Timer className="h-5 w-5" />}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={closeLauncher}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-forest hover:bg-forest-light text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            <span>Start Session ({focusMinutes}m)</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ── 1. Select Task ─────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            1. Which task are you doing?
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => handleSelectTask(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-white/70 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all cursor-pointer"
          >
            <option value="">⚡ General Focus (No linked task)</option>
            {pendingTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} {task.durationMinutes ? `(${task.durationMinutes}m)` : ""}
              </option>
            ))}
          </select>
          {selectedTaskId && (
            <div className="flex items-center justify-between gap-2 mt-2 px-1 text-[11px] bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-sage-dark font-semibold min-w-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage shrink-0" />
                <span className="truncate">Linked: {selectedTaskTitle}</span>
              </div>
              {(() => {
                const found = tasks.find((t) => t.id === selectedTaskId);
                if (found && found.archetype === "timed") {
                  const completed = found.completedMinutes || 0;
                  const target = found.durationMinutes || 30;
                  return (
                    <span className="font-mono text-slate-500 font-semibold shrink-0 text-[10px] bg-white px-2 py-0.5 rounded-lg border border-slate-200/60">
                      {completed}/{target}m done
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        {/* ── 2. Focus Duration ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-sage" />
              <span>2. Focus Duration</span>
            </label>
            <span className="text-sm font-bold font-mono text-forest bg-sage/10 px-2 py-0.5 rounded-lg border border-sage/20">
              {focusMinutes} min
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setFocusMinutes(preset)}
                className={cn(
                  "py-1.5 rounded-xl text-xs font-bold transition-all border",
                  focusMinutes === preset
                    ? "bg-forest text-white border-forest shadow-xs"
                    : "bg-white/60 text-slate-600 border-slate-200/60 hover:bg-white"
                )}
              >
                {preset}m
              </button>
            ))}
          </div>

          {/* Slider for custom minutes */}
          <div className="px-1">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-full accent-forest cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5m</span>
              <span>30m</span>
              <span>60m</span>
              <span>90m</span>
              <span>120m</span>
            </div>
          </div>
        </div>

        {/* ── 3. Number of Parts (Intervals) ─────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sage" />
              <span>3. How many parts / intervals?</span>
            </label>
            <span className="text-xs font-bold text-slate-600">
              {totalParts} {totalParts === 1 ? "Sprint" : "Parts"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PART_OPTIONS.map((parts) => (
              <button
                key={parts}
                type="button"
                onClick={() => setTotalParts(parts)}
                className={cn(
                  "py-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5",
                  totalParts === parts
                    ? "bg-forest text-white border-forest shadow-xs"
                    : "bg-white/60 text-slate-600 border-slate-200/60 hover:bg-white"
                )}
              >
                <span>{parts} {parts === 1 ? "Part" : "Parts"}</span>
                <span
                  className={cn(
                    "text-[9px] font-normal",
                    totalParts === parts ? "text-white/80" : "text-slate-400"
                  )}
                >
                  {parts === 1 ? "Single" : `${parts} cycles`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Break Duration (Only if multiple parts) ──────────────── */}
        {totalParts > 1 && (
          <div className="pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Coffee className="h-3.5 w-3.5 text-amber-600" />
              <span>4. Break Duration</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BREAK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBreakMinutes(preset)}
                  className={cn(
                    "py-1.5 rounded-xl text-xs font-bold transition-all border",
                    breakMinutes === preset
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-white/60 text-slate-600 border-slate-200/60 hover:bg-white"
                  )}
                >
                  {preset}m {preset === 5 ? "(Quick)" : preset === 10 ? "(Standard)" : "(Long)"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Session Summary Pill ───────────────────────────────────── */}
        <div className="bg-sage/10 border border-sage/20 rounded-2xl p-3 text-xs text-slate-700">
          <p className="font-semibold flex items-center justify-between">
            <span>Session Plan:</span>
            <span className="font-mono font-bold text-forest">{totalDurationMinutes} min total</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            {totalParts === 1 ? (
              `1 single focus block of ${focusMinutes} minutes without scheduled breaks.`
            ) : (
              `${totalParts} focus blocks of ${focusMinutes}m each, separated by ${totalParts - 1} break${
                totalParts - 1 > 1 ? "s" : ""
              } of ${breakMinutes}m.`
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
}
