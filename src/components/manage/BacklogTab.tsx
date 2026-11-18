"use client";

import { Inbox } from "lucide-react";
import { Task } from "@/types";
import { TaskCard } from "@/components/tasks/TaskCard";

interface BacklogTabProps {
  tasks: Task[];
  onMoveToToday: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function BacklogTab({
  tasks,
  onMoveToToday,
  onEdit,
  onDelete,
}: BacklogTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Staged Backlog Items ({tasks.length})
        </h4>
      </div>

      {tasks.length === 0 ? (
        <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80">
          <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Inbox is empty</p>
          <p className="text-xs text-slate-400 mt-1">All tasks are scheduled for execution!</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            variant="backlog"
            onMoveToToday={onMoveToToday}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
