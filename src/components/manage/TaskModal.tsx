"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  Zap,
  Clock,
  Hash,
  Trash2,
  Plus,
  AlertCircle,
  Calendar,
  ChevronDown,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskArchetype, Priority } from "@/types";
import { useTaskStore } from "@/lib/stores/taskStore";
import { toast } from "@/lib/stores/toastStore";
import { DEFAULT_TASK_CONFIG } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  taskToEdit?: Task | null;
  defaultScheduleToday?: boolean;
  initialScheduledDate?: string;
}

const ARCHETYPES: {
  id: TaskArchetype;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    id: "checklist",
    label: "Checklist",
    badge: "Sub-items",
    icon: Zap,
    desc: "Sequential checklist steps or administrative checklist",
  },
  {
    id: "counter",
    label: "Countable",
    badge: "Increment (+1)",
    icon: Hash,
    desc: "Target repetitions (e.g. 5 glasses of water, 10 pages read)",
  },
  {
    id: "timed",
    label: "Timed Block",
    badge: "Dial / Duration",
    icon: Clock,
    desc: "Dedicated timebox selected with a time dial",
  },
];

const PRIORITIES: { id: Priority; label: string; badgeClass: string; hint: string }[] = [
  {
    id: "P0",
    label: "P0 Urgent",
    badgeClass: "bg-priority-p0-bg text-priority-p0-text border-priority-p0-border",
    hint: "Critical (Max 1–2 per day)",
  },
  {
    id: "P1",
    label: "P1 High",
    badgeClass: "bg-priority-p1-bg text-priority-p1-text border-priority-p1-border",
    hint: "Deep work core goals",
  },
  {
    id: "P2",
    label: "P2 Normal",
    badgeClass: "bg-priority-p2-bg text-priority-p2-text border-priority-p2-border",
    hint: "Routine maintenance",
  },
];

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultScheduleToday,
  initialScheduledDate,
}: TaskModalProps) {
  const { tasks } = useTaskStore();
  const todayTasksCount = tasks.filter((t) => t.status !== "staged").length;
  const isTodayFull = todayTasksCount >= DEFAULT_TASK_CONFIG.slotCapacity && !taskToEdit;

  const titleInputRef = useRef<HTMLInputElement>(null);
  const subItemInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [archetype, setArchetype] = useState<TaskArchetype>(DEFAULT_TASK_CONFIG.defaultArchetype);
  const [priority, setPriority] = useState<Priority>(DEFAULT_TASK_CONFIG.defaultPriority);
  
  // Specific type states:
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_TASK_CONFIG.defaultDurationMinutes);
  const [targetCount, setTargetCount] = useState(DEFAULT_TASK_CONFIG.defaultTargetCount);
  const [unit, setUnit] = useState(DEFAULT_TASK_CONFIG.defaultUnit);
  const [subItemInput, setSubItemInput] = useState("");
  const [subItems, setSubItems] = useState<{ id: string; label: string; done: boolean }[]>([]);
  
  const [isScheduledToday, setIsScheduledToday] = useState(true);
  const [todayStr, setTodayStr] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>(initialScheduledDate || "");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Initialize today's date on client mount to avoid unstable prerender
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayStr(today);
    if (!scheduledDate) {
      setScheduledDate(initialScheduledDate || today);
    }
  }, [initialScheduledDate]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    }
    if (isTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isTypeDropdownOpen]);

  // Sync state on open/edit
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setArchetype(taskToEdit.archetype);
        setPriority(taskToEdit.priority);
        setDurationMinutes(taskToEdit.durationMinutes || DEFAULT_TASK_CONFIG.defaultDurationMinutes);
        setTargetCount(taskToEdit.targetCount || DEFAULT_TASK_CONFIG.defaultTargetCount);
        setUnit(taskToEdit.unit || DEFAULT_TASK_CONFIG.defaultUnit);
        setSubItems(taskToEdit.subItems ? [...taskToEdit.subItems] : []);
        setScheduledDate(taskToEdit.scheduledDate || new Date().toISOString().split("T")[0]);
        setIsScheduledToday(taskToEdit.status !== "staged");
      } else {
        // Defaults for new task: Checklist
        setTitle("");
        setArchetype(DEFAULT_TASK_CONFIG.defaultArchetype);
        setPriority(DEFAULT_TASK_CONFIG.defaultPriority);
        setDurationMinutes(DEFAULT_TASK_CONFIG.defaultDurationMinutes);
        setTargetCount(DEFAULT_TASK_CONFIG.defaultTargetCount);
        setUnit(DEFAULT_TASK_CONFIG.defaultUnit);
        setSubItems([]);
        const targetDate = initialScheduledDate || new Date().toISOString().split("T")[0];
        setScheduledDate(targetDate);
        const shouldSchedule =
          defaultScheduleToday !== undefined ? defaultScheduleToday : !isTodayFull;
        setIsScheduledToday(shouldSchedule);
      }
      setSubItemInput("");
      setIsTypeDropdownOpen(false);

      // Auto-focus title on open
      setTimeout(() => titleInputRef.current?.focus(), 80);
    }
  }, [taskToEdit, isOpen, isTodayFull, initialScheduledDate, defaultScheduleToday]);

  // Sub-items management (Checklist)
  const handleAddSubItem = () => {
    if (!subItemInput.trim()) return;
    setSubItems((prev) => [
      ...prev,
      { id: `sub-${Date.now()}`, label: subItemInput.trim(), done: false },
    ]);
    setSubItemInput("");
    subItemInputRef.current?.focus();
  };

  const handleToggleSubItem = (id: string) => {
    setSubItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemoveSubItem = (id: string) => {
    setSubItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      toast.warning("Please enter a task title");
      titleInputRef.current?.focus();
      return;
    }

    // Auto-include any pending typed checklist item before saving
    let finalSubItems = subItems;
    if (archetype === "checklist" && subItemInput.trim()) {
      finalSubItems = [
        ...subItems,
        { id: `sub-${Date.now()}`, label: subItemInput.trim(), done: false },
      ];
    }

    onSave({
      title: title.trim(),
      archetype,
      priority,
      status: isScheduledToday ? "scheduled" : "staged",
      subItems: archetype === "checklist" ? finalSubItems : undefined,
      targetCount: archetype === "counter" ? Number(targetCount) || 1 : undefined,
      currentCount: archetype === "counter" ? (taskToEdit?.currentCount || 0) : undefined,
      unit: archetype === "counter" ? (unit.trim() || undefined) : undefined,
      durationMinutes: archetype === "timed" ? Number(durationMinutes) || 30 : undefined,
      completedMinutes: archetype === "timed" ? (taskToEdit?.completedMinutes || 0) : undefined,
      scheduledDate: isScheduledToday ? scheduledDate : undefined,
    });

    toast.success(taskToEdit ? "Task updated" : "Task created");
    onClose();
  };

  const currentArchetypeData =
    ARCHETYPES.find((a) => a.id === archetype) || ARCHETYPES[0];
  const ArchetypeIcon = currentArchetypeData.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create Task"}
      icon={<ArchetypeIcon className="h-4 w-4" />}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-black/5 transition-colors focus:outline-hidden"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-modal-form"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-forest hover:bg-forest-light text-white shadow-md transition-all active:scale-95 focus:outline-hidden"
          >
            {taskToEdit ? "Save Changes" : "Create Task"}
          </button>
        </>
      }
    >
      <form
        id="task-modal-form"
        onSubmit={handleSubmit}
        className="space-y-3.5 pr-1"
      >
        {/* Task Title */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            placeholder="e.g. Drink 5 glasses of water, Review PR..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* Task Type Inline Selector (Eliminates clipping & overflow scrollbars) */}
        <div ref={dropdownRef} className="space-y-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Task Type
            </label>
            {/* Info Icon with Tooltip */}
            <div className="group relative flex items-center">
              <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
              <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block z-50 w-56 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-xl text-white text-[10px] leading-tight shadow-xl border border-white/10">
                <strong>Task Types:</strong>
                <ul className="mt-1 space-y-1 list-disc pl-3">
                  <li><strong>Checklist:</strong> Step-by-step checklist</li>
                  <li><strong>Countable:</strong> Repeated actions with [+] button</li>
                  <li><strong>Timed:</strong> Timebox dial (pomodoro optional later)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/90 bg-white/70 overflow-hidden shadow-xs transition-all">
            {/* Header Trigger */}
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 text-left focus:outline-hidden hover:bg-white/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sage text-white shadow-xs">
                  <ArchetypeIcon className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-900 leading-tight">
                  {currentArchetypeData.label}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-black/5 px-2 py-0.5 rounded-full">
                  {currentArchetypeData.badge}
                </span>
              </div>

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
                  isTypeDropdownOpen && "rotate-180 text-slate-700"
                )}
              />
            </button>

            {/* Inline Expanding List (Smooth, no overflow clipping or scrollbar issues!) */}
            <AnimatePresence>
              {isTypeDropdownOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden border-t border-slate-200/60 p-1.5 space-y-1 bg-white/50 backdrop-blur-md"
                >
                  {ARCHETYPES.map((arch) => {
                    const ArchIcon = arch.icon;
                    const isSelected = archetype === arch.id;

                    return (
                      <button
                        type="button"
                        key={arch.id}
                        onClick={() => {
                          setArchetype(arch.id);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all focus:outline-hidden group",
                          isSelected
                            ? "bg-sage/15 text-slate-900 font-bold"
                            : "hover:bg-black/5 text-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                              isSelected
                                ? "bg-sage text-white shadow-xs"
                                : "bg-black/5 text-slate-500"
                            )}
                          >
                            <ArchIcon className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-semibold leading-tight">
                            {arch.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({arch.badge})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-sage stroke-[2.5]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Contextual Form */}
        <AnimatePresence mode="wait">
          {/* ── 1. Checklist Type ───────────────────────────────────── */}
          {archetype === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 bg-white/60 rounded-2xl border border-white/90 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Checklist Steps ({subItems.length})
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  ref={subItemInputRef}
                  type="text"
                  placeholder="Add a step and press Enter..."
                  value={subItemInput}
                  onChange={(e) => setSubItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubItem();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSubItem}
                  className="px-3.5 py-1.5 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>

              {subItems.length > 0 && (
                <div className="space-y-1 pt-0.5 max-h-32 overflow-y-auto pr-1">
                  {subItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs bg-white/90 px-2.5 py-1.5 rounded-xl border border-slate-100 shadow-2xs group"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubItem(item.id)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0"
                      >
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            item.done
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          )}
                        >
                          {item.done && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={cn(
                            "truncate",
                            item.done && "line-through text-slate-400"
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── 2. Countable Type ───────────────────────────────────── */}
          {archetype === "counter" && (
            <motion.div
              key="counter"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 bg-white/60 rounded-2xl border border-white/90 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Target Repetitions
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {targetCount} {unit || "times"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Target Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Unit (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="glasses, pages, reps..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 3. Timed Block (Interactive Time Dial / Slider) ─────── */}
          {archetype === "timed" && (
            <motion.div
              key="timed"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3.5 bg-white/60 rounded-2xl border border-white/90 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Time Dial
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-200">
                  {durationMinutes} Minutes
                </span>
              </div>

              {/* Freeform Slider / Dial */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sage"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
                  <span>5m</span>
                  <span>45m</span>
                  <span>90m</span>
                  <span>180m</span>
                </div>
              </div>

              {/* Quick Preset Dials */}
              <div className="flex gap-1.5 pt-1">
                {[15, 25, 45, 60, 90].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setDurationMinutes(preset)}
                    className={cn(
                      "flex-1 py-1 rounded-lg text-[11px] font-bold border transition-all focus:outline-hidden",
                      durationMinutes === preset
                        ? "bg-forest text-white border-forest shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Priority Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Priority
            </label>
            {/* Info Icon with Tooltip */}
            <div className="group relative flex items-center">
              <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
              <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-48 p-2 rounded-xl bg-slate-900 text-white text-[10px] leading-tight shadow-xl">
                <strong>Priority Guide:</strong>
                <p className="mt-0.5">P0: Urgent / Critical (Max 1–2 per day)</p>
                <p>P1: Deep work core target</p>
                <p>P2: Routine maintenance</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-hidden",
                    p.badgeClass,
                    isSelected
                      ? "ring-2 ring-forest shadow-xs scale-102"
                      : "opacity-75 hover:opacity-100"
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Allocation: Scheduled Date vs Backlog */}
        <div className="p-3 bg-white/60 rounded-2xl border border-white/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-sage" />
              <span>
                {todayStr && scheduledDate === todayStr
                  ? "Schedule for Today"
                  : "Schedule on Horizon"}
              </span>
            </span>
            <input
              type="checkbox"
              checked={isScheduledToday}
              onChange={(e) => setIsScheduledToday(e.target.checked)}
              className="h-4 w-4 rounded-md accent-sage cursor-pointer"
            />
          </div>

          {isScheduledToday && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-600">
                Scheduled Date:
              </span>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-white/90 border border-slate-200/90 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sage shadow-2xs"
              />
            </div>
          )}

          {/* Friendly capacity warning if scheduling for today exceeds 5 slots */}
          {isScheduledToday && isTodayFull && todayStr && scheduledDate === todayStr && (
            <div className="flex items-start gap-1.5 p-2 bg-amber-500/10 border border-amber-300/40 rounded-xl text-amber-800 text-[11px] leading-tight">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Today already has {todayTasksCount} slots booked (exceeds 5-slot limit).
              </span>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
