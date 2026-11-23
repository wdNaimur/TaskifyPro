"use client";

import { Modal } from "@/components/ui/Modal";
import { Keyboard, Command, Navigation, Zap, Timer } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: "Quick Navigation",
    icon: Navigation,
    shortcuts: [
      { keys: ["1"], description: "Jump to Focus Timer" },
      { keys: ["2"], description: "Jump to Tasks Cockpit" },
      { keys: ["3"], description: "Jump to Planning Engine" },
      { keys: ["4"], description: "Jump to Habits" },
      { keys: ["5"], description: "Jump to Reports" },
    ],
  },
  {
    title: "Global Actions",
    icon: Zap,
    shortcuts: [
      { keys: ["N"], description: "Create a new task modal" },
      { keys: ["?"], description: "Open keyboard shortcuts help" },
      { keys: ["Esc"], description: "Close modal / cancel editing" },
    ],
  },
  {
    title: "Focus & Execution",
    icon: Timer,
    shortcuts: [
      { keys: ["Space"], description: "Start / Pause focus countdown" },
      { keys: ["Click"], description: "Toggle task completion / subtask check" },
    ],
  },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Navigate Taskify with speed using these keyboard shortcuts."
      icon={<Keyboard className="h-5 w-5 text-forest" />}
      maxWidth="md"
    >
      <div className="space-y-4 py-1 select-none">
        {SHORTCUT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                <span>{section.title}</span>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-2 border border-slate-100 divide-y divide-slate-100">
                {section.shortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-2 text-xs"
                  >
                    <span className="text-slate-700 font-medium">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-1 text-[11px] font-mono font-bold bg-white text-slate-800 border border-slate-200 rounded-lg shadow-2xs min-w-[24px] text-center"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
