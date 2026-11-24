"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/lib/stores/taskStore";

/**
 * Tracks client-side hydration of persisted task data.
 * Prevents flashing the empty "No tasks" screen on initial load/reload
 * by rendering skeleton placeholders while reading localStorage.
 *
 * Includes a failsafe timeout to guarantee it never gets stuck.
 */
export function useHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 1. If Zustand persist has already hydrated
    if (useTaskStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
      return;
    }

    // 2. Subscribe to hydration finish event
    const unsub = useTaskStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true);
    });

    // 3. Failsafe timeout: always mark as hydrated after mount
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 60);

    return () => {
      unsub?.();
      clearTimeout(timer);
    };
  }, []);

  return isHydrated;
}
