"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Pencil,
  Trash2,
  Zap,
  Timer,
  Mountain,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTaskStore } from "@/lib/taskStore";
import { usePomodoroStore } from "@/lib/store";
import { TaskModal } from "@/components/manage/TaskModal";
import { Task, TaskArchetype, Priority } from "@/types";
import { cn } from "@/lib/utils";

export default function ManagePage() {
  const { tasks, selectedTab, setSelectedTab, addTask, updateTask, deleteTask, toggleTaskDone } =
    useTaskStore();
  const { startTimer } = usePomodoroStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filter tasks
  const todayTasks = tasks.filter((t) => t.status !== "staged");
  const backlogTasks = tasks.filter((t) => t.status === "staged");
  const completedTodayCount = todayTasks.filter((t) => t.status === "done").length;
  const slotCapacity = 5;

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

  // Archetype icon helper
  const renderArchetypeBadge = (archetype: TaskArchetype, task: Task) => {
    switch (archetype) {
      case "quick-check":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300/40">
            <Zap className="h-3 w-3" /> Quick Check
          </span>
        );
      case "short":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-300/40">
            <Clock className="h-3 w-3" /> {task.durationMinutes || 30}m
          </span>
        );
      case "pomodoro":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-300/40">
            <Timer className="h-3 w-3" /> {task.pomodoroCount || 2} 🍅
          </span>
        );
      case "epic":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-300/40">
            <Mountain className="h-3 w-3" /> Epic
          </span>
        );
    }
  };

  // Priority badge helper
  const renderPriorityBadge = (priority: Priority) => {
    const classes = {
      P0: "bg-priority-p0-bg text-priority-p0-text border-priority-p0-border",
      P1: "bg-priority-p1-bg text-priority-p1-text border-priority-p1-border",
      P2: "bg-priority-p2-bg text-priority-p2-text border-priority-p2-border",
    };
    return (
      <span
        className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider",
          classes[priority]
        )}
      >
        {priority}
      </span>
    );
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
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative",
                selectedTab === "daily" ? "text-slate-900 shadow-xs bg-white" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Daily Plan
            </button>
            <button
              onClick={() => setSelectedTab("weekly")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedTab === "weekly" ? "text-slate-900 shadow-xs bg-white" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Weekly Horizon
            </button>
            <button
              onClick={() => setSelectedTab("backlog")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                selectedTab === "backlog" ? "text-slate-900 shadow-xs bg-white" : "text-slate-500 hover:text-slate-800"
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

      {/* ── Daily Plan Tab ─────────────────────────────────────────── */}
      {selectedTab === "daily" && (
        <div className="space-y-6">
          {/* Capacity Meter Bar (5-Slot Rule) */}
          <div className="liquid-glass-light rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800">
                  Today&apos;s Capacity Throttle
                </h3>
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                    todayTasks.length >= slotCapacity
                      ? "bg-red-500/10 text-red-700 border-red-300"
                      : "bg-emerald-500/10 text-emerald-800 border-emerald-300"
                  )}
                >
                  {todayTasks.length} / {slotCapacity} Slots Used
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The rule of 5: Deep focus requires strictly guarding daily slots against cognitive overload.
              </p>
            </div>

            {/* Visual Slot Indicators */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: slotCapacity }).map((_, i) => {
                const isFilled = i < todayTasks.length;
                const isDone = i < completedTodayCount;
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all",
                      isDone
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : isFilled
                        ? "bg-forest text-white border-forest-light"
                        : "bg-white/40 text-slate-400 border-slate-200/60"
                    )}
                    title={`Slot ${i + 1}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Execution Queue ({todayTasks.length})
              </h4>
              <span className="text-xs text-slate-400">
                {completedTodayCount} Completed
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No tasks scheduled for today</p>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Add Task&quot; or promote from your Backlog</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  className={cn(
                    "liquid-glass-light rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 group",
                    task.status === "done" ? "opacity-60 bg-white/30" : "hover:border-sage/50"
                  )}
                >
                  {/* Left: Checkbox + Title + Badges */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskDone(task.id)}
                      className={cn(
                        "h-5 w-5 rounded-lg border flex items-center justify-center transition-all focus:outline-hidden shrink-0",
                        task.status === "done"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-sage bg-white"
                      )}
                    >
                      {task.status === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold text-slate-800 truncate leading-snug",
                          task.status === "done" && "line-through text-slate-400"
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderArchetypeBadge(task.archetype, task)}
                        {renderPriorityBadge(task.priority)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick actions (Play Pomodoro, Edit, Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Launch into Pomodoro */}
                    <button
                      onClick={() => startTimer(task.id, task.title)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Focus in Pomodoro timer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>

                    {/* Edit Task */}
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Task */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Weekly Horizon Tab ─────────────────────────────────────── */}
      {selectedTab === "weekly" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, idx) => (
              <div
                key={day}
                className="liquid-glass-light rounded-2xl p-3 border border-white/80 min-h-[180px] flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
                  <span className="text-xs font-bold text-slate-800">{day}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {idx === 1 ? "Today" : ""}
                  </span>
                </div>
                <div className="flex-1 space-y-1.5">
                  {idx === 1 ? (
                    todayTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className="text-xs font-medium p-1.5 rounded-lg bg-white/70 border border-white truncate text-slate-700"
                      >
                        {t.title}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                      Open slot
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Backlog & Inbox Tab ─────────────────────────────────────── */}
      {selectedTab === "backlog" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Staged Backlog Items ({backlogTasks.length})
            </h4>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="liquid-glass-light rounded-3xl p-10 text-center border border-white/80">
              <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Inbox is empty</p>
              <p className="text-xs text-slate-400 mt-1">All tasks are scheduled for execution!</p>
            </div>
          ) : (
            backlogTasks.map((task) => (
              <motion.div
                layout
                key={task.id}
                className="liquid-glass-light rounded-2xl p-3.5 border border-white/80 flex items-center justify-between gap-3 group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderArchetypeBadge(task.archetype, task)}
                    {renderPriorityBadge(task.priority)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTask(task.id, { status: "scheduled" })}
                    className="px-3 py-1.5 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-light transition-all"
                  >
                    Move to Today
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-black/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
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
