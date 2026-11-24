"use client";

import { useState, useEffect } from "react";
import { Plus, FlaskConical } from "lucide-react";
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
    reorderTasks,
    moveTaskToToday,
    loadDevDemoTasks,
  } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string | undefined>(undefined);
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Filter tasks into Today vs Backlog (strictly synchronized with today's scheduled date)
  const todayTasks = tasks.filter((t) => {
    if (t.status === "staged") return false;
    if (!todayStr) return true; // fallback during SSR
    if (t.scheduledDate) {
      return t.scheduledDate === todayStr;
    }
    return true; // legacy/unspecified tasks default to today
  });
  const backlogTasks = tasks.filter((t) => t.status === "staged");

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setSelectedScheduleDate(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setSelectedScheduleDate(undefined);
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

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto flex-wrap">
          {/* Liquid Glass Tab Switcher */}
          <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/80 shadow-xs max-w-full overflow-x-auto shrink-0">
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

          {/* Fill Dev Test Tasks Button */}
          <button
            onClick={loadDevDemoTasks}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300/40 transition-all cursor-pointer"
            title="Fill 5 test tasks across Today & Backlog"
          >
            <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">Fill Test Tasks</span>
          </button>

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
          onReorder={reorderTasks}
          onEdit={handleOpenEditModal}
          onDelete={deleteTask}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}

      {selectedTab === "weekly" && (
        <WeeklyHorizonTab
          tasks={tasks}
          onAddTaskForDate={(dateStr) => {
            setSelectedScheduleDate(dateStr);
            setTaskToEdit(null);
            setIsModalOpen(true);
          }}
          onEditTask={handleOpenEditModal}
          onDeleteTask={deleteTask}
          onMoveTaskDate={(taskId, dateStr) => {
            updateTask(taskId, { scheduledDate: dateStr, status: "scheduled" });
          }}
        />
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedScheduleDate(undefined);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultScheduleToday={selectedTab !== "backlog"}
        initialScheduledDate={selectedScheduleDate || todayStr}
      />
    </div>
  );
}
