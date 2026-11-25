"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/lib/stores/toastStore";

interface ScreenOrientationWithLock extends ScreenOrientation {
  lock?: (orientation: string) => Promise<void>;
}

export function useDeskClockMode() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  // Listen to external fullscreen changes (e.g. Esc key or browser button)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Toggle Screen Orientation / Desk Clock StandBy mode
  const toggleScreenRotation = useCallback(async () => {
    try {
      if (typeof screen !== "undefined" && screen.orientation && "lock" in screen.orientation) {
        const orientation = screen.orientation as ScreenOrientationWithLock;
        if (!isRotated) {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
          }
          if (orientation.lock) {
            await orientation.lock("landscape").catch(() => {});
          }
        } else {
          orientation.unlock?.();
        }
      }
    } catch {
      // Fallback to software CSS rotation
    }

    setIsRotated((prev) => {
      const next = !prev;
      if (next) {
        toast.info("Desk Clock mode active (Landscape)");
      } else {
        toast.info("Standard orientation restored");
      }
      return next;
    });
  }, [isRotated]);

  // Reset software rotation if device is physically rotated to landscape
  useEffect(() => {
    const handleOrientation = () => {
      if (window.innerWidth > window.innerHeight && isRotated) {
        setIsRotated(false);
      }
    };
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);
    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, [isRotated]);

  return {
    isFullscreen,
    isRotated,
    toggleFullscreen,
    toggleScreenRotation,
  };
}
