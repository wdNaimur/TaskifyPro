"use client";

import { useRef } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface ChecklistSectionProps {
  subItems: ChecklistItem[];
  subItemInput: string;
  onSubItemInputChange: (val: string) => void;
  onAddSubItem: () => void;
  onToggleSubItem: (id: string) => void;
  onRemoveSubItem: (id: string) => void;
}

export function ChecklistSection({
  subItems,
  subItemInput,
  onSubItemInputChange,
  onAddSubItem,
  onToggleSubItem,
  onRemoveSubItem,
}: ChecklistSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
          ref={inputRef}
          type="text"
          placeholder="Add a step and press Enter..."
          value={subItemInput}
          onChange={(e) => onSubItemInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddSubItem();
              inputRef.current?.focus();
            }
          }}
          className="flex-1 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sage focus:ring-2 focus:ring-sage/40 transition-all"
        />
        <button
          type="button"
          onClick={() => {
            onAddSubItem();
            inputRef.current?.focus();
          }}
          className="px-3.5 py-1.5 bg-forest hover:bg-forest-light text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
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
                onClick={() => onToggleSubItem(item.id)}
                className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
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
                onClick={() => onRemoveSubItem(item.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Remove item"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
