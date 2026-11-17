"use client";

import { useState, useEffect } from "react";
import { X, Check, Timer, Zap, Clock, Mountain, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskArchetype, Priority } from "@/types";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  taskToEdit?: Task | null;
}

const ARCHETYPES: {
  id: TaskArchetype;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    id: "quick-check",
    label: "Quick Check",
    icon: Zap,
    desc: "≤15 min checklist item",
  },
  {
    id: "short",
    label: "Short Task",
    icon: Clock,
    desc: "15–45 min focused block",
  },
  {
    id: "pomodoro",
    label: "Pomodoro",
    icon: Timer,
    desc: "25 min deep work cycles",
  },
  {
    id: "epic",
    label: "Epic Milestone",
    icon: Mountain,
    desc: "Multi-day breakdown",
  },
];

const PRIORITIES: { id: Priority; label: string; badgeClass: string }[] = [
  { id: "P0", label: "P0 Urgent", badgeClass: "bg-priority-p0-bg text-priority-p0-text border-priority-p0-border" },
  { id: "P1", label: "P1 High", badgeClass: "bg-priority-p1-bg text-priority-p1-text border-priority-p1-border" },
  { id: "P2", label: "P2 Normal", badgeClass: "bg-priority-p2-bg text-priority-p2-text border-priority-p2-border" },
];

export function TaskModal({ isOpen, onClose, onSave, taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [archetype, setArchetype] = useState<TaskArchetype>("pomodoro");
  const [priority, setPriority] = useState<Priority>("P1");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [pomodoroCount, setPomodoroCount] = useState(2);
  const [subItemInput, setSubItemInput] = useState("");
  const [subItems, setSubItems] = useState<{ id: string; label: string; done: boolean }[]>([]);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [isScheduledToday, setIsScheduledToday] = useState(true);

  // Sync state when editing an existing task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setArchetype(taskToEdit.archetype);
      setPriority(taskToEdit.priority);
      setDurationMinutes(taskToEdit.durationMinutes || 30);
      setPomodoroCount(taskToEdit.pomodoroCount || 2);
      setSubItems(taskToEdit.subItems || []);
      setMilestones(taskToEdit.milestones || []);
      setIsScheduledToday(taskToEdit.status !== "staged");
    } else {
      // Defaults for brand new task
      setTitle("");
      setArchetype("pomodoro");
      setPriority("P1");
      setDurationMinutes(30);
      setPomodoroCount(2);
      setSubItems([]);
      setMilestones([]);
      setIsScheduledToday(true);
    }
  }, [taskToEdit, isOpen]);

  const handleAddSubItem = () => {
    if (!subItemInput.trim()) return;
    setSubItems([...subItems, { id: `sub-${Date.now()}`, label: subItemInput.trim(), done: false }]);
    setSubItemInput("");
  };

  const handleRemoveSubItem = (id: string) => {
    setSubItems(subItems.filter((item) => item.id !== id));
  };

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    setMilestones([...milestones, milestoneInput.trim()]);
    setMilestoneInput("");
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      archetype,
      priority,
      status: isScheduledToday ? "scheduled" : "staged",
      durationMinutes: archetype === "short" ? durationMinutes : undefined,
      pomodoroCount: archetype === "pomodoro" ? pomodoroCount : undefined,
      subItems: archetype === "quick-check" ? subItems : undefined,
      milestones: archetype === "epic" ? milestones : undefined,
      scheduledDate: isScheduledToday ? new Date().toISOString().split("T")[0] : undefined,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.25 }}
            className="relative w-full max-w-lg rounded-3xl liquid-glass-light p-6 shadow-2xl border border-white/80 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {taskToEdit ? "Edit Task" : "Create New Task"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure archetype, priority, and allocation.
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              {/* Task Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Architecture Tokens"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/70 border border-white/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sage focus:bg-white shadow-inner transition-all"
                  autoFocus
                />
              </div>

              {/* Archetype Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Task Archetype
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ARCHETYPES.map((arch) => {
                    const Icon = arch.icon;
                    const isSelected = archetype === arch.id;

                    return (
                      <button
                        type="button"
                        key={arch.id}
                        onClick={() => setArchetype(arch.id)}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 rounded-xl text-left border transition-all",
                          isSelected
                            ? "bg-sage/15 border-sage/40 ring-1 ring-sage shadow-xs"
                            : "bg-white/40 border-slate-200/60 hover:bg-white/70 text-slate-600"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
                            isSelected ? "bg-sage text-white" : "bg-black/5 text-slate-600"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-800 leading-tight">
                            {arch.label}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                            {arch.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Archetype-Specific Fields */}
              {archetype === "quick-check" && (
                <div className="p-3 bg-white/50 rounded-2xl border border-white/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Sub-Items Checklist
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add sub-item..."
                      value={subItemInput}
                      onChange={(e) => setSubItemInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubItem();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sage"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubItem}
                      className="px-3 py-1.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-forest-light flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {/* Sub-items list */}
                  {subItems.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {subItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-100"
                        >
                          <span className="text-slate-700">{item.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubItem(item.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {archetype === "short" && (
                <div className="p-3 bg-white/50 rounded-2xl border border-white/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estimated Duration: {durationMinutes} Minutes
                  </label>
                  <div className="flex gap-2">
                    {[15, 30, 45].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDurationMinutes(d)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                          durationMinutes === d
                            ? "bg-forest text-white border-forest"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {archetype === "pomodoro" && (
                <div className="p-3 bg-white/50 rounded-2xl border border-white/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pomodoro Sessions ({pomodoroCount * 25} minutes total)
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setPomodoroCount(count)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                          pomodoroCount === count
                            ? "bg-sage text-white border-sage"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {count} 🍅
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {archetype === "epic" && (
                <div className="p-3 bg-white/50 rounded-2xl border border-white/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Epic Milestones Breakdown
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Design spec, Alpha release..."
                      value={milestoneInput}
                      onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMilestone();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sage"
                    />
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="px-3 py-1.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-forest-light flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {/* Milestones list */}
                  {milestones.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {milestones.map((ms, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-100"
                        >
                          <span className="text-slate-700">{ms}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(index)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Priority Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Priority Level
                </label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                          p.badgeClass,
                          isSelected ? "ring-2 ring-forest shadow-xs scale-102" : "opacity-70 hover:opacity-100"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Today Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-white/80">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Schedule for Today
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Place in today&apos;s 5-slot execution queue
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isScheduledToday}
                  onChange={(e) => setIsScheduledToday(e.target.checked)}
                  className="h-5 w-5 rounded-md accent-sage cursor-pointer"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-forest hover:bg-forest-light text-white shadow-md transition-all active:scale-95"
                >
                  {taskToEdit ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
