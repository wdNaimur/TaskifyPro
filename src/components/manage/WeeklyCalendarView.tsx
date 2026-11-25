"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Task } from "@/types";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import {
  computeWeekDays,
  formatLocalDate,
  type WeekDayInfo,
} from "@/lib/utils/date";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { cn } from "@/lib/utils";

/* ─── Props ──────────────────────────────────────────────────────── */
interface WeeklyCalendarViewProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onAddTaskForDate: (dateStr: string) => void;
  onMoveTaskTime?: (
    taskId: string,
    dateStr: string,
    startTime: string
  ) => void;
}

/* ─── Calendar Block (computed display unit) ─────────────────────── */
interface CalendarBlock {
  task: Task;
  dayDateStr: string;
  startMinutes: number; // minutes from midnight 0-1439
  displayMinutes: number; // visible duration in this day
  isSplitStart: boolean; // continues on the next day →
  isSplitEnd: boolean; // ← continued from previous day
}

/* ─── Constants ──────────────────────────────────────────────────── */
const HOUR_HEIGHT = 64; // px per hour row
const MIN_CAPSULE_H = 28; // px — readable minimum

const STATIC_WEEK: WeekDayInfo[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((dayName, idx) => ({
  dayName,
  dayId: "monday" as const,
  shortName: dayName.slice(0, 3),
  dateStr: `day-${idx + 1}`,
  dayNum: idx + 1,
  monthName: "",
  isToday: false,
  isWeekend: dayName === "Saturday" || dayName === "Sunday",
}));

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function padTime(h: number, m: number = 0): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Duration a task occupies on the calendar (minutes). */
function effectiveDuration(task: Task): number {
  return task.durationMinutes || 60;
}

/* ─── Auto-schedule algorithm ────────────────────────────────────── */
/**
 * Find the first free position >= `from` that is at least 1 minute wide,
 * respecting already-occupied intervals.
 */
function findFreeStart(
  from: number,
  occupied: [number, number][],
  dayEnd: number
): number | null {
  let cursor = from;
  for (const [oStart, oEnd] of occupied) {
    if (cursor >= dayEnd) return null;
    if (cursor < oStart) return cursor; // gap before this block
    if (cursor < oEnd) cursor = oEnd; // skip occupied
  }
  return cursor < dayEnd ? cursor : null;
}

function computeCalendarBlocks(
  weekDays: WeekDayInfo[],
  tasks: Task[],
  todayStr: string,
  dayStartHour: number
): CalendarBlock[] {
  const blocks: CalendarBlock[] = [];
  const dayStartMin = dayStartHour * 60;
  const dayEndMin = 24 * 60; // 1440

  // ── Group tasks by day ──
  const tasksByDay = new Map<string, Task[]>();
  for (const day of weekDays) tasksByDay.set(day.dateStr, []);

  for (const t of tasks) {
    if (t.status === "staged") continue;
    const dateStr = t.scheduledDate || todayStr;
    tasksByDay.get(dateStr)?.push(t);
  }

  // ── Process days in order ──
  let overflow: { task: Task; remainingMin: number }[] = [];

  for (const day of weekDays) {
    const dayTasks = tasksByDay.get(day.dateStr) || [];
    const occupied: [number, number][] = []; // sorted

    const pushOccupied = (s: number, e: number) => {
      occupied.push([s, e]);
      occupied.sort((a, b) => a[0] - b[0]);
    };

    // 1 ── Place tasks with explicit scheduledStartTime
    const withTime = dayTasks.filter((t) => t.scheduledStartTime);
    const withoutTime = dayTasks.filter((t) => !t.scheduledStartTime);

    for (const task of withTime) {
      const [h, m] = task.scheduledStartTime!.split(":").map(Number);
      const start = h * 60 + (m || 0);
      const dur = effectiveDuration(task);
      const displayEnd = Math.min(start + dur, dayEndMin);
      const displayDur = displayEnd - start;

      pushOccupied(start, displayEnd);
      blocks.push({
        task,
        dayDateStr: day.dateStr,
        startMinutes: start,
        displayMinutes: displayDur,
        isSplitStart: start + dur > dayEndMin,
        isSplitEnd: false,
      });

      if (start + dur > dayEndMin) {
        overflow.push({ task, remainingMin: dur - displayDur });
      }
    }

    // 2 ── Place overflow from previous day
    const prevOverflow = [...overflow];
    overflow = [];

    for (const { task, remainingMin } of prevOverflow) {
      const dur = Math.min(remainingMin, dayEndMin - dayStartMin);
      if (dur <= 0) continue;

      pushOccupied(dayStartMin, dayStartMin + dur);
      blocks.push({
        task,
        dayDateStr: day.dateStr,
        startMinutes: dayStartMin,
        displayMinutes: dur,
        isSplitStart: remainingMin > dur,
        isSplitEnd: true,
      });

      if (remainingMin > dur) {
        overflow.push({ task, remainingMin: remainingMin - dur });
      }
    }

    // 3 ── Auto-place tasks without explicit time
    for (const task of withoutTime) {
      const dur = effectiveDuration(task);
      const freeStart = findFreeStart(dayStartMin, occupied, dayEndMin);

      if (freeStart === null) {
        // Completely full → overflow to next day
        overflow.push({ task, remainingMin: dur });
        continue;
      }

      const displayEnd = Math.min(freeStart + dur, dayEndMin);
      const displayDur = displayEnd - freeStart;

      pushOccupied(freeStart, displayEnd);
      blocks.push({
        task,
        dayDateStr: day.dateStr,
        startMinutes: freeStart,
        displayMinutes: displayDur,
        isSplitStart: freeStart + dur > dayEndMin,
        isSplitEnd: false,
      });

      if (freeStart + dur > dayEndMin) {
        overflow.push({ task, remainingMin: dur - displayDur });
      }
    }
  }

  return blocks;
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */
export function WeeklyCalendarView({
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTaskForDate,
  onMoveTaskTime,
}: WeeklyCalendarViewProps) {
  const { settings } = useSettingsStore();
  const isHydrated = useHydrated();
  const startOfWeek = settings.startOfWeek || "monday";
  const weekendDays = settings.weekendDays || ["saturday", "sunday"];
  const dayStartHour = settings.dayStartHour ?? 6;

  const [weekDays, setWeekDays] = useState<WeekDayInfo[]>(
    STATIC_WEEK as WeekDayInfo[]
  );
  const [todayStr, setTodayStr] = useState("");
  const [currentTimeOffset, setCurrentTimeOffset] = useState<number | null>(
    null
  );

  // Drag state
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    dayDateStr: string;
    hour: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Hours shown: dayStartHour → 23
  const hours: number[] = [];
  for (let h = dayStartHour; h < 24; h++) hours.push(h);

  const totalHeight = hours.length * HOUR_HEIGHT;

  // Pixel offset for a given minutes-from-midnight value
  const minutesToPx = (totalMin: number): number => {
    const offset = totalMin - dayStartHour * 60;
    return Math.max(0, (offset / 60) * HOUR_HEIGHT);
  };

  /* ── Effects ─────────────────────────────────────────────────── */
  useEffect(() => {
    setWeekDays(computeWeekDays(startOfWeek, weekendDays));
    setTodayStr(formatLocalDate());
  }, [startOfWeek, weekendDays]);

  // Current-time red line — update every minute
  useEffect(() => {
    function update() {
      const now = new Date();
      const h = now.getHours();
      if (h < dayStartHour) {
        setCurrentTimeOffset(null);
        return;
      }
      const m = now.getMinutes();
      setCurrentTimeOffset(minutesToPx(h * 60 + m));
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayStartHour]);

  // Auto-scroll to current time on first hydration
  useEffect(() => {
    if (currentTimeOffset !== null && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, currentTimeOffset - 140);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  /* ── Computed blocks ─────────────────────────────────────────── */
  const calendarBlocks = computeCalendarBlocks(
    weekDays,
    tasks,
    todayStr,
    dayStartHour
  );

  // The dragged task object (for sizing the drop preview)
  const draggedTask = dragTaskId
    ? tasks.find((t) => t.id === dragTaskId) ?? null
    : null;
  const dragDurHours = draggedTask
    ? Math.ceil(effectiveDuration(draggedTask) / 60)
    : 1;

  /* ── Drag & Drop handlers ────────────────────────────────────── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (dayDateStr: string, hour: number) => {
    if (!dragTaskId || !onMoveTaskTime) return;
    onMoveTaskTime(dragTaskId, dayDateStr, padTime(hour));
    setDragTaskId(null);
    setDropTarget(null);
  };

  /* ── Week-tasks count ────────────────────────────────────────── */
  const totalWeekTasks = new Set(calendarBlocks.map((b) => b.task.id)).size;

  /* ── Loading skeleton ────────────────────────────────────────── */
  if (!isHydrated) {
    return (
      <div
        className="space-y-4 animate-pulse"
        aria-label="Loading weekly calendar"
      >
        <div className="h-12 bg-white/70 rounded-2xl border border-white/80" />
        <div className="h-[500px] bg-white/50 rounded-2xl border border-white/80" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ═══ Header Bar ═════════════════════════════════════════════ */}
      <div className="liquid-glass-light rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-forest" />
              <span>Weekly Calendar</span>
            </h3>
            {weekDays[0]?.monthName && (
              <span className="text-xs font-mono text-slate-400">
                {weekDays[0].monthName} {weekDays[0].dayNum} –{" "}
                {weekDays[6]?.monthName} {weekDays[6]?.dayNum}
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-800 border-emerald-300">
              {totalWeekTasks} tasks this week
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Time-grid view — drag tasks to reschedule. Capsules auto-size to
            duration.
          </p>
        </div>
      </div>

      {/* ═══ Calendar Grid ══════════════════════════════════════════ */}
      <div className="liquid-glass-light rounded-2xl border border-white/80 shadow-xs overflow-hidden">
        {/* ── Sticky day-name header ─────────────────────────────── */}
        <div className="flex border-b border-slate-200/60 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
          {/* Time col header */}
          <div className="w-16 shrink-0 p-2 border-r border-slate-200/40 flex items-end justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Time
            </span>
          </div>

          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              className={cn(
                "flex-1 min-w-[120px] py-2 sm:py-3 text-center border-r border-slate-200/30 last:border-r-0",
                day.isToday && "bg-emerald-500/[0.06]",
                !day.isToday && day.isWeekend && "bg-amber-500/[0.03]"
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider block",
                  day.isToday ? "text-emerald-700" : "text-slate-500"
                )}
              >
                {day.shortName}
              </span>
              <span
                className={cn(
                  "text-lg font-bold leading-tight inline-flex items-center justify-center",
                  day.isToday &&
                    "text-white bg-emerald-600 rounded-full w-8 h-8"
                )}
              >
                {day.dayNum}
              </span>
              {day.isToday && (
                <span className="block text-[9px] font-bold text-emerald-700 mt-0.5">
                  Today
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Scrollable time-grid body ──────────────────────────── */}
        <div
          ref={scrollRef}
          className="overflow-y-auto overflow-x-auto max-h-[calc(100vh-320px)]"
        >
          <div className="flex relative" style={{ height: totalHeight }}>
            {/* ── Time labels column ─────────────────────────────── */}
            <div className="w-16 shrink-0 relative border-r border-slate-200/40">
              {hours.map((hour, idx) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start justify-end pr-2 pt-0.5 border-b border-slate-200/20"
                  style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <span className="text-[11px] font-mono text-slate-400 font-medium -mt-0.5 select-none">
                    {formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Current-time red line ───────────────────────────── */}
            {currentTimeOffset !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: currentTimeOffset }}
              >
                <div className="w-16 shrink-0 flex justify-end pr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                </div>
                <div className="flex-1 h-[2px] bg-red-500/70" />
              </div>
            )}

            {/* ── Day columns ────────────────────────────────────── */}
            {weekDays.map((day) => {
              const dayBlocks = calendarBlocks.filter(
                (b) => b.dayDateStr === day.dateStr
              );

              return (
                <div
                  key={day.dateStr}
                  className={cn(
                    "flex-1 min-w-[120px] relative border-r border-slate-200/20 last:border-r-0",
                    day.isToday && "bg-emerald-500/[0.015]",
                    !day.isToday && day.isWeekend && "bg-amber-500/[0.01]"
                  )}
                >
                  {/* Hour grid lines & click-to-add targets */}
                  {hours.map((hour, idx) => {
                    const isDropHere =
                      dropTarget?.dayDateStr === day.dateStr &&
                      hour >= dropTarget.hour &&
                      hour < dropTarget.hour + dragDurHours;

                    return (
                      <div
                        key={hour}
                        className={cn(
                          "absolute left-0 right-0 border-b border-slate-200/20 group/cell transition-colors",
                          isDropHere
                            ? "bg-forest/10"
                            : "hover:bg-slate-500/[0.03]"
                        )}
                        style={{
                          top: idx * HOUR_HEIGHT,
                          height: HOUR_HEIGHT,
                        }}
                        onClick={() => onAddTaskForDate(day.dateStr)}
                        onDragOver={handleDragOver}
                        onDragEnter={() =>
                          setDropTarget({ dayDateStr: day.dateStr, hour })
                        }
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDrop(day.dateStr, hour);
                        }}
                      >
                        {/* subtle + on hover */}
                        {!isDropHere && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none">
                            <Plus className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        )}
                        {/* drop preview */}
                        {isDropHere &&
                          hour === dropTarget?.hour && (
                            <div className="absolute inset-x-1 top-0.5 bottom-0.5 rounded-xl border-2 border-dashed border-forest/40 bg-forest/[0.07] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-forest/70">
                                Drop here — {formatHour(hour)}
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}

                  {/* ── Drag-overlay layer (captures drag events over capsules) */}
                  {dragTaskId && (
                    <div className="absolute inset-0 z-20">
                      {hours.map((hour, idx) => (
                        <div
                          key={`overlay-${hour}`}
                          className="absolute left-0 right-0"
                          style={{
                            top: idx * HOUR_HEIGHT,
                            height: HOUR_HEIGHT,
                          }}
                          onDragOver={handleDragOver}
                          onDragEnter={() =>
                            setDropTarget({ dayDateStr: day.dateStr, hour })
                          }
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDrop(day.dateStr, hour);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* ── Task Capsules ─────────────────────────────── */}
                  {dayBlocks.map((block) => {
                    const topPx = minutesToPx(block.startMinutes);
                    const rawH =
                      (block.displayMinutes / 60) * HOUR_HEIGHT;
                    const heightPx = Math.max(MIN_CAPSULE_H, rawH);
                    const isShort = heightPx <= 36;
                    const isMedium = heightPx > 36 && heightPx <= 72;
                    const { task } = block;
                    const isDone = task.status === "done";
                    const dur = effectiveDuration(task);
                    const durLabel =
                      dur >= 60
                        ? `${Math.floor(dur / 60)}h${dur % 60 ? ` ${dur % 60}m` : ""}`
                        : `${dur}m`;

                    return (
                      <div
                        key={`${task.id}-${block.dayDateStr}-${block.isSplitEnd ? "cont" : "orig"}`}
                        className={cn(
                          "absolute left-1 right-1 z-10 rounded-xl overflow-hidden transition-all",
                          "cursor-pointer select-none group/capsule",
                          "hover:shadow-lg hover:scale-x-[1.02]",
                          dragTaskId === task.id && "opacity-30 scale-95",
                          // Priority colors — left accent stripe via gradient
                          task.priority === "P0" &&
                            "bg-gradient-to-r from-red-500/20 via-red-50/95 to-red-50/90 border border-red-300/50",
                          task.priority === "P1" &&
                            "bg-gradient-to-r from-emerald-500/20 via-emerald-50/95 to-emerald-50/90 border border-emerald-300/50",
                          task.priority === "P2" &&
                            "bg-gradient-to-r from-amber-400/20 via-amber-50/95 to-amber-50/90 border border-amber-200/50",
                          isDone && "opacity-50",
                          // Split indicators
                          block.isSplitEnd && "rounded-t-none border-t-0 border-t-dashed",
                          block.isSplitStart && "rounded-b-none border-b-0"
                        )}
                        style={{
                          top: topPx,
                          height: heightPx,
                          borderLeftWidth: "3px",
                          borderLeftColor:
                            task.priority === "P0"
                              ? "rgb(239 68 68)"
                              : task.priority === "P1"
                                ? "rgb(16 185 129)"
                                : "rgb(245 158 11)",
                        }}
                        draggable={!block.isSplitEnd}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", task.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDragTaskId(null);
                          setDropTarget(null);
                        }}
                        onClick={() => onEditTask?.(task)}
                      >
                        <div className="px-2 py-1 h-full flex flex-col justify-between overflow-hidden">
                          {/* Top row */}
                          <div className="flex items-start gap-1 min-w-0">
                            {/* Split-continued icon */}
                            {block.isSplitEnd && (
                              <ChevronLeft className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <span
                              className={cn(
                                "font-semibold truncate flex-1 leading-tight",
                                isShort ? "text-[10px]" : "text-[11px]",
                                isDone && "line-through"
                              )}
                            >
                              {task.title}
                            </span>

                            {/* Hover actions */}
                            <div className="opacity-0 group-hover/capsule:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                              {onEditTask && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask(task);
                                  }}
                                  className="p-0.5 rounded-md bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-xs cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil className="h-2.5 w-2.5" />
                                </button>
                              )}
                              {onDeleteTask && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                  }}
                                  className="p-0.5 rounded-md bg-white/80 hover:bg-red-50 text-slate-500 hover:text-red-600 shadow-xs cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Bottom row (only on medium+ capsules) */}
                          {!isShort && (
                            <div className="flex items-center justify-between mt-auto pt-0.5">
                              <span className="text-[9px] font-mono text-slate-400 font-medium">
                                {durLabel}
                              </span>
                              <div className="flex items-center gap-1">
                                {block.isSplitStart && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600">
                                    <span>continues</span>
                                    <ChevronRight className="h-2.5 w-2.5" />
                                  </span>
                                )}
                                {block.isSplitEnd && (
                                  <span className="text-[9px] font-bold text-slate-400">
                                    …continued
                                  </span>
                                )}
                                {!isMedium && (
                                  <span
                                    className={cn(
                                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                                      task.priority === "P0" &&
                                        "bg-red-500/15 text-red-700",
                                      task.priority === "P1" &&
                                        "bg-emerald-500/15 text-emerald-700",
                                      task.priority === "P2" &&
                                        "bg-amber-500/10 text-amber-700"
                                    )}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
