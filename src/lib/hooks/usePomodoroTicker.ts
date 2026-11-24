"use client";

import { useEffect, useRef } from "react";
import { usePomodoroStore } from "@/lib/stores/pomodoroStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { createTimerWorker } from "@/lib/workers/timerWorker";
import { useWakeLock } from "./useWakeLock";

/**
 * Tab-suspend-safe global ticker hook for Pomodoro countdown.
 * Uses a dedicated Web Worker to maintain ticking when the browser tab is inactive.
 * Includes absolute timestamp delta reconciliation so time remains 100% accurate
 * even if the computer enters sleep or the tab is frozen by the OS.
 * Automatically keeps mobile screen awake when countdown is actively running.
 */
export function usePomodoroTicker() {
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const tick = usePomodoroStore((s) => s.tick);
  const keepScreenAwake = useSettingsStore((s) => s.settings.keepScreenAwake);

  // Keep display awake on mobile during active countdown
  useWakeLock(isRunning && keepScreenAwake !== false);

  const workerRef = useRef<Worker | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or terminate the Web Worker
  useEffect(() => {
    workerRef.current = createTimerWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, []);

  // Handle start / stop commands and ticking
  useEffect(() => {
    if (!isRunning) {
      // Stopped / Paused
      if (workerRef.current) {
        workerRef.current.postMessage({ action: "stop" });
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      return;
    }

    // Running: reset timestamp anchor
    lastTickTimeRef.current = Date.now();

    const handleTick = () => {
      const now = Date.now();
      const elapsedMs = now - lastTickTimeRef.current;

      // Normal tick ~1000ms, or catch up if thread was stalled
      const deltaSeconds = Math.max(1, Math.round(elapsedMs / 1000));
      lastTickTimeRef.current = now;

      tick(deltaSeconds);
    };

    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        if (e.data?.type === "TICK") {
          handleTick();
        }
      };
      workerRef.current.postMessage({ action: "start" });
    } else {
      // Fallback to main-thread interval if worker is unsupported
      fallbackIntervalRef.current = setInterval(handleTick, 1000);
    }

    // Instant catch-up when tab regains focus or visibility
    const handleReconcile = () => {
      if (document.visibilityState === "visible" && isRunning) {
        const now = Date.now();
        const elapsedMs = now - lastTickTimeRef.current;
        if (elapsedMs >= 1500) {
          const deltaSeconds = Math.round(elapsedMs / 1000);
          lastTickTimeRef.current = now;
          tick(deltaSeconds);
        }
      }
    };

    document.addEventListener("visibilitychange", handleReconcile);
    window.addEventListener("focus", handleReconcile);

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: "stop" });
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleReconcile);
      window.removeEventListener("focus", handleReconcile);
    };
  }, [isRunning, tick]);
}
