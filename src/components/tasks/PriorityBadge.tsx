import { Priority } from "@/types";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
}

const PRIORITY_CLASSES: Record<Priority, string> = {
  P0: "bg-priority-p0-bg text-priority-p0-text border-priority-p0-border",
  P1: "bg-priority-p1-bg text-priority-p1-text border-priority-p1-border",
  P2: "bg-priority-p2-bg text-priority-p2-text border-priority-p2-border",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider",
        PRIORITY_CLASSES[priority]
      )}
    >
      {priority}
    </span>
  );
}
