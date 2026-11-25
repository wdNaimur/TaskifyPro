"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Zap, Hash, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskArchetype } from "@/types";
import { cn } from "@/lib/utils";

export const ARCHETYPES: {
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

interface ArchetypeSelectorProps {
  archetype: TaskArchetype;
  onSelectArchetype: (archetype: TaskArchetype) => void;
}

export function ArchetypeSelector({ archetype, onSelectArchetype }: ArchetypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const currentArchetypeData = ARCHETYPES.find((a) => a.id === archetype) || ARCHETYPES[0];
  const ArchetypeIcon = currentArchetypeData.icon;

  return (
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
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 text-left focus:outline-hidden hover:bg-white/80 transition-colors cursor-pointer"
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
              isOpen && "rotate-180 text-slate-700"
            )}
          />
        </button>

        {/* Inline Expanding List */}
        <AnimatePresence>
          {isOpen && (
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
                      onSelectArchetype(arch.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all focus:outline-hidden group cursor-pointer",
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
  );
}
