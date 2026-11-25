"use client";

import { useState, useEffect } from "react";

/**
 * Automatically fades / hides interactive overlays after a duration of user inactivity
 * (mouse movement, keypress, or touch). Resets immediately on any user interaction.
 */
export function useInactivityFade(isActive: boolean, timeoutMs: number = 2500): boolean {
  const [internalVisible, setInternalVisible] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    let timer: NodeJS.Timeout;

    const handleActivity = () => {
      setInternalVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setInternalVisible(false);
      }, timeoutMs);
    };

    handleActivity();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [isActive, timeoutMs]);

  return !isActive || internalVisible;
}
