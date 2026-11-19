"use client";

import { useEffect } from "react";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";

/**
 * Global ticker hook for Pomodoro countdown.
 * Runs interval every 1 second when isRunning is true.
 */
export function usePomodoroTicker() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const tick = usePomodoroStore((s) => s.tick);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);
}
