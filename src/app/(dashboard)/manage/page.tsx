"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTaskStore } from "@/lib/stores/taskStore";
import { DailyPlanTab } from "@/components/manage/DailyPlanTab";
import { WeeklyHorizonTab } from "@/components/manage/WeeklyHorizonTab";
import { BacklogTab } from "@/components/manage/BacklogTab";
import { TaskModal } from "@/components/manage/TaskModal";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

export default function ManagePage() {
  const {
    tasks,
    selectedTab,
    setSelectedTab,
    addTask,
    updateTask,
    deleteTask,
    moveTaskToToday,
  } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filter tasks into Today vs Backlog
  const todayTasks = tasks.filter((t) => t.status !== "staged");
  const backlogTasks = tasks.filter((t) => t.status === "staged");

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 select-none">
      {/* ── Page Header: Title + Tab bar + "+ Add Task" Button ─────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Planning &amp; Manage Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize daily slots, weekly horizon, and prioritize your backlog.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Liquid Glass Tab Switcher */}
          <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/80 shadow-xs">
            <button
              onClick={() => setSelectedTab("daily")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedTab === "daily"
                  ? "text-slate-900 shadow-xs bg-white"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Daily Plan
            </button>
            <button
              onClick={() => setSelectedTab("weekly")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedTab === "weekly"
                  ? "text-slate-900 shadow-xs bg-white"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Weekly Horizon
            </button>
            <button
              onClick={() => setSelectedTab("backlog")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedTab === "backlog"
                  ? "text-slate-900 shadow-xs bg-white"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Backlog ({backlogTasks.length})
            </button>
          </div>

          {/* "+ Add Task" Button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-forest hover:bg-forest-light text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* ── Active Tab View ────────────────────────────────────────── */}
      {selectedTab === "daily" && (
        <DailyPlanTab
          tasks={todayTasks}
          onEdit={handleOpenEditModal}
          onDelete={deleteTask}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}

      {selectedTab === "weekly" && (
        <WeeklyHorizonTab todayTasks={todayTasks} />
      )}

      {selectedTab === "backlog" && (
        <BacklogTab
          tasks={backlogTasks}
          onMoveToToday={moveTaskToToday}
          onEdit={handleOpenEditModal}
          onDelete={deleteTask}
        />
      )}

      {/* ── Task Creation / Edit Modal ─────────────────────────────── */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
