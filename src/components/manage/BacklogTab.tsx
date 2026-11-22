"use client";

import { Inbox, Flame, Target, CheckCircle2 } from "lucide-react";
import { Task, Priority } from "@/types";
import { TaskCard } from "@/components/tasks/TaskCard";

interface BacklogTabProps {
  tasks: Task[];
  onMoveToToday: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };

const PRIORITY_GROUPS: {
  id: Priority;
  title: string;
  subtitle: string;
  badgeClass: string;
  icon: typeof Flame;
}[] = [
  {
    id: "P0",
    title: "P0 — Urgent & Critical",
    subtitle: "High leverage & time-sensitive bottlenecks",
    badgeClass: "bg-red-500/10 text-red-700 border-red-300/40",
    icon: Flame,
  },
  {
    id: "P1",
    title: "P1 — High Priority",
    subtitle: "Deep work core goals for upcoming slots",
    badgeClass: "bg-amber-500/10 text-amber-800 border-amber-300/40",
    icon: Target,
  },
  {
    id: "P2",
    title: "P2 — Normal / Maintenance",
    subtitle: "Routine tasks & minor backlog items",
    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-300/40",
    icon: CheckCircle2,
  },
];

export function BacklogTab({
  tasks,
  onMoveToToday,
  onEdit,
  onDelete,
}: BacklogTabProps) {
  // Sort tasks by priority (P0 -> P1 -> P2), then keep stable order
  const sortedTasks = [...tasks].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Staged Backlog Items ({tasks.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Triage &amp; promote tasks into today&apos;s 5 focus slots
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80">
          <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Inbox is empty</p>
          <p className="text-xs text-slate-400 mt-1">
            All tasks are scheduled for execution!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {PRIORITY_GROUPS.map((group) => {
            const groupTasks = sortedTasks.filter((t) => t.priority === group.id);
            if (groupTasks.length === 0) return null;
            const Icon = group.icon;

            return (
              <div key={group.id} className="space-y-2.5">
                {/* Priority Group Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${group.badgeClass}`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{group.title}</span>
                      <span className="opacity-70 font-mono">({groupTasks.length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {group.subtitle}
                    </span>
                  </div>
                </div>

                {/* Group Task Cards */}
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      mode="plan"
                      variant="backlog"
                      onMoveToToday={onMoveToToday}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
