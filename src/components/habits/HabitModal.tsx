"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Habit, HabitType } from "@/types";
import { CheckSquare, Hash, Clock, Sparkles, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, "id" | "streak" | "createdAt">) => void;
  habitToEdit?: Habit | null;
}

const HABIT_TYPES: {
  id: HabitType;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: "binary",
    label: "Binary Check-off",
    badge: "Yes / No",
    icon: CheckSquare,
    description: "Simple daily check (e.g. Floss, Make bed, Take vitamins)",
  },
  {
    id: "quantitative",
    label: "Quantitative Target",
    badge: "Count (+1)",
    icon: Hash,
    description: "Repetitions with a unit (e.g. 8 glasses of water, 10 pushups)",
  },
  {
    id: "timed",
    label: "Timed Duration",
    badge: "Timebox",
    icon: Clock,
    description: "Target minutes (e.g. 20 min reading, 30 min workout)",
  },
  {
    id: "reflection",
    label: "Weekly Reflection",
    badge: "Review",
    icon: Sparkles,
    description: "Weekly review routine or journaling check-off",
  },
];

export function HabitModal({
  isOpen,
  onClose,
  onSave,
  habitToEdit,
}: HabitModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HabitType>("binary");
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setType(habitToEdit.type);
      setTargetValue(habitToEdit.targetValue || 1);
      setUnit(habitToEdit.unit || "");
    } else {
      setTitle("");
      setType("binary");
      setTargetValue(1);
      setUnit("");
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a habit title");
      return;
    }

    onSave({
      title: title.trim(),
      type,
      targetValue: type === "binary" || type === "reflection" ? 1 : targetValue,
      unit: type === "quantitative" ? (unit.trim() || "times") : type === "timed" ? "min" : undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? "Edit Habit" : "Create New Habit"}
      description="Design a sustainable daily routine or weekly anchor."
      icon={<Sparkles className="h-5 w-5 text-forest" />}
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4 py-1 select-none">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Habit Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Morning Hydration, 20m Reading, Clear Desk..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            autoFocus
            className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 transition-all font-medium"
          />
        </div>

        {/* Habit Type Archetype Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Habit Archetype
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HABIT_TYPES.map((ht) => {
              const Icon = ht.icon;
              const isSelected = type === ht.id;
              return (
                <button
                  key={ht.id}
                  type="button"
                  onClick={() => {
                    setType(ht.id);
                    if (ht.id === "quantitative" && !unit) setUnit("glasses");
                    if (ht.id === "timed") setTargetValue(20);
                  }}
                  className={cn(
                    "flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "bg-forest text-white border-forest shadow-xs"
                      : "bg-white/70 hover:bg-white text-slate-700 border-slate-200/80"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Icon className={cn("h-4 w-4", isSelected ? "text-emerald-300" : "text-slate-500")} />
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {ht.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold leading-tight">{ht.label}</span>
                  <span
                    className={cn(
                      "text-[10px] mt-0.5 leading-snug line-clamp-1",
                      isSelected ? "text-white/70" : "text-slate-400"
                    )}
                  >
                    {ht.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Contextual Inputs */}
        {type === "quantitative" && (
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target Daily Count
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g. glasses, reps, pages"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40"
              />
            </div>
          </div>
        )}

        {type === "timed" && (
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Daily Duration
              </label>
              <span className="text-xs font-bold text-forest">{targetValue} Minutes</span>
            </div>
            <div className="flex gap-1.5">
              {[10, 15, 20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTargetValue(mins)}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    targetValue === mins
                      ? "bg-forest text-white border-forest shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{habitToEdit ? "Save Changes" : "Create Habit"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
