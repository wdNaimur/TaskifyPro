import { DayOfWeek } from "@/types";

export const ALL_DAYS_OF_WEEK: { id: DayOfWeek; name: string; short: string }[] = [
  { id: "monday", name: "Monday", short: "Mon" },
  { id: "tuesday", name: "Tuesday", short: "Tue" },
  { id: "wednesday", name: "Wednesday", short: "Wed" },
  { id: "thursday", name: "Thursday", short: "Thu" },
  { id: "friday", name: "Friday", short: "Fri" },
  { id: "saturday", name: "Saturday", short: "Sat" },
  { id: "sunday", name: "Sunday", short: "Sun" },
];

export const DAY_OF_WEEK_TO_JS_DAY: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const JS_DAY_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export interface WeekDayInfo {
  dayName: string;
  dayId: DayOfWeek;
  shortName: string;
  dateStr: string;
  dayNum: number;
  monthName: string;
  isToday: boolean;
  isWeekend: boolean;
}

/**
 * Computes the 7 days of the current week starting on the user's preferred `startOfWeek`.
 * Correctly handles weekend designations from `weekendDays`.
 */
export function computeWeekDays(
  startOfWeek: DayOfWeek = "monday",
  weekendDays: DayOfWeek[] = ["saturday", "sunday"]
): WeekDayInfo[] {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const currentJsDay = now.getDay();
  const targetJsDay = DAY_OF_WEEK_TO_JS_DAY[startOfWeek] ?? 1;

  let diff = currentJsDay - targetJsDay;
  if (diff < 0) {
    diff += 7;
  }

  const startDay = new Date(now);
  startDay.setDate(now.getDate() - diff);
  startDay.setHours(0, 0, 0, 0);

  const result: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);

    const dateStr = d.toISOString().split("T")[0];
    const jsDay = d.getDay();
    const dayId = JS_DAY_TO_DAY_OF_WEEK[jsDay];
    const dayItem = ALL_DAYS_OF_WEEK.find((item) => item.id === dayId);
    const dayName = dayItem ? dayItem.name : "Monday";
    const shortName = dayItem ? dayItem.short : "Mon";
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const isToday = dateStr === todayStr;
    const isWeekend = weekendDays.includes(dayId);

    result.push({
      dayName,
      dayId,
      shortName,
      dateStr,
      dayNum,
      monthName,
      isToday,
      isWeekend,
    });
  }

  return result;
}
