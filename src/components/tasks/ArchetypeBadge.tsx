import { Task, TaskArchetype } from "@/types";
import { Zap, Clock, Timer, Mountain } from "lucide-react";

interface ArchetypeBadgeProps {
  archetype: TaskArchetype;
  task?: Task;
}

export function ArchetypeBadge({ archetype, task }: ArchetypeBadgeProps) {
  switch (archetype) {
    case "quick-check":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300/40">
          <Zap className="h-3 w-3" /> Quick Check
        </span>
      );
    case "short":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-300/40">
          <Clock className="h-3 w-3" /> {task?.durationMinutes || 30}m
        </span>
      );
    case "pomodoro":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-300/40">
          <Timer className="h-3 w-3" /> {task?.pomodoroCount || 2} 🍅
        </span>
      );
    case "epic":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-300/40">
          <Mountain className="h-3 w-3" /> Epic
        </span>
      );
  }
}
