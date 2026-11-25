"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  AlertCircle,
  Calendar,
  Info,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Task, TaskArchetype, Priority } from "@/types";
import { useTaskStore } from "@/lib/stores/taskStore";
import { toast } from "@/lib/stores/toastStore";
import { DEFAULT_TASK_CONFIG } from "@/lib/constants";
import { formatLocalDate } from "@/lib/utils/date";
import { Modal } from "@/components/ui/Modal";
import { ArchetypeSelector, ARCHETYPES } from "@/components/manage/task-modal/ArchetypeSelector";
import { ChecklistSection } from "@/components/manage/task-modal/ChecklistSection";
import { CounterSection } from "@/components/manage/task-modal/CounterSection";
import { TimedSection } from "@/components/manage/task-modal/TimedSection";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  taskToEdit?: Task | null;
  defaultScheduleToday?: boolean;
  initialScheduledDate?: string;
}

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
  const [todayStr, setTodayStr] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>(initialScheduledDate || "");

  // Initialize today's date on client mount to avoid unstable prerender
  useEffect(() => {
    const today = formatLocalDate();
    setTodayStr(today);
    if (!scheduledDate) {
      setScheduledDate(initialScheduledDate || today);
    }
  }, [initialScheduledDate, scheduledDate]);

  const targetDate = scheduledDate || todayStr;
  const targetDateTasksCount = tasks.filter((t) => {
    if (t.status === "staged") return false;
    if (t.scheduledDate && targetDate) {
      return t.scheduledDate === targetDate;
    }
    return targetDate === todayStr;
  }).length;
  const isTargetDateFull = targetDateTasksCount >= DEFAULT_TASK_CONFIG.slotCapacity && !taskToEdit;

  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [archetype, setArchetype] = useState<TaskArchetype>(DEFAULT_TASK_CONFIG.defaultArchetype);
  const [priority, setPriority] = useState<Priority>(DEFAULT_TASK_CONFIG.defaultPriority);

  // Archetype-specific form states
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_TASK_CONFIG.defaultDurationMinutes);
  const [targetCount, setTargetCount] = useState(DEFAULT_TASK_CONFIG.defaultTargetCount);
  const [unit, setUnit] = useState(DEFAULT_TASK_CONFIG.defaultUnit);
  const [subItemInput, setSubItemInput] = useState("");
  const [subItems, setSubItems] = useState<{ id: string; label: string; done: boolean }[]>([]);

  const [isScheduledToday, setIsScheduledToday] = useState(true);

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
        setScheduledDate(taskToEdit.scheduledDate || formatLocalDate());
        setIsScheduledToday(taskToEdit.status !== "staged");
      } else {
        setTitle("");
        setArchetype(DEFAULT_TASK_CONFIG.defaultArchetype);
        setPriority(DEFAULT_TASK_CONFIG.defaultPriority);
        setDurationMinutes(DEFAULT_TASK_CONFIG.defaultDurationMinutes);
        setTargetCount(DEFAULT_TASK_CONFIG.defaultTargetCount);
        setUnit(DEFAULT_TASK_CONFIG.defaultUnit);
        setSubItems([]);
        const target = initialScheduledDate || formatLocalDate();
        setScheduledDate(target);
        const shouldSchedule =
          defaultScheduleToday !== undefined ? defaultScheduleToday : !isTargetDateFull;
        setIsScheduledToday(shouldSchedule);
      }
      setSubItemInput("");

      // Auto-focus title on open
      setTimeout(() => titleInputRef.current?.focus(), 80);
    }
  }, [taskToEdit, isOpen, isTargetDateFull, initialScheduledDate, defaultScheduleToday]);

  // Sub-items management (Checklist)
  const handleAddSubItem = () => {
    if (!subItemInput.trim()) return;
    setSubItems((prev) => [
      ...prev,
      { id: `sub-${Date.now()}`, label: subItemInput.trim(), done: false },
    ]);
    setSubItemInput("");
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
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-black/5 transition-colors focus:outline-hidden cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-modal-form"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-forest hover:bg-forest-light text-white shadow-md transition-all active:scale-95 focus:outline-hidden cursor-pointer"
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

        {/* Task Type Inline Selector (Extracted Component) */}
        <ArchetypeSelector archetype={archetype} onSelectArchetype={setArchetype} />

        {/* Dynamic Contextual Form for Selected Archetype */}
        <AnimatePresence mode="wait">
          {archetype === "checklist" && (
            <ChecklistSection
              subItems={subItems}
              subItemInput={subItemInput}
              onSubItemInputChange={setSubItemInput}
              onAddSubItem={handleAddSubItem}
              onToggleSubItem={handleToggleSubItem}
              onRemoveSubItem={handleRemoveSubItem}
            />
          )}

          {archetype === "counter" && (
            <CounterSection
              targetCount={targetCount}
              unit={unit}
              onTargetCountChange={setTargetCount}
              onUnitChange={setUnit}
            />
          )}

          {archetype === "timed" && (
            <TimedSection
              durationMinutes={durationMinutes}
              onDurationChange={setDurationMinutes}
            />
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
                    "py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-hidden cursor-pointer",
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

          {/* Capacity warning if scheduling exceeds 5 slots */}
          {isScheduledToday && isTargetDateFull && targetDate && (
            <div className="flex items-start gap-1.5 p-2 bg-amber-500/10 border border-amber-300/40 rounded-xl text-amber-800 text-[11px] leading-tight">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>
                {targetDate === todayStr ? "Today" : targetDate} already has {targetDateTasksCount} slots booked (exceeds 5-slot limit).
              </span>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
