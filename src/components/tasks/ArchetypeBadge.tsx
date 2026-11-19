import { Task, TaskArchetype } from "@/types";
import { CheckSquare, Hash, Clock } from "lucide-react";

interface ArchetypeBadgeProps {
  archetype: TaskArchetype;
  task?: Task;
}

export function ArchetypeBadge({ archetype, task }: ArchetypeBadgeProps) {
  switch (archetype) {
    case "checklist": {
      const doneCount = task?.subItems?.filter((s) => s.done).length || 0;
      const totalCount = task?.subItems?.length || 0;
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300/40">
          <CheckSquare className="h-3 w-3" />
          <span>{totalCount > 0 ? `${doneCount}/${totalCount}` : "Checklist"}</span>
        </span>
      );
    }
    case "counter": {
      const current = task?.currentCount || 0;
      const target = task?.targetCount || 1;
      const unit = task?.unit ? ` ${task.unit}` : "";
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-300/40">
          <Hash className="h-3 w-3" />
          <span>{current}/{target}{unit}</span>
        </span>
      );
    }
    case "timed": {
      const completed = task?.completedMinutes || 0;
      const target = task?.durationMinutes || 30;
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-300/40">
          <Clock className="h-3 w-3" />
          <span>{completed}/{target}m</span>
        </span>
      );
    }
  }
}
