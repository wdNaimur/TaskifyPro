"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

/**
 * Screen Wake Lock hook for mobile & desktop browsers.
 * Prevents mobile devices from dimming, sleeping, or locking the screen
 * while active focus timers or countdowns are running.
 *
 * Automatically re-acquires the lock when returning to the tab (visibilitychange),
 * and supports graceful user gesture retries for strict mobile browsers.
 */
export function useWakeLock(enabled: boolean = true): UseWakeLockReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement | null>(null);

  // Check support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(Boolean("wakeLock" in navigator && navigator.wakeLock?.request));
    }
  }, []);

  // Request native Screen Wake Lock
  const request = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    // 1. Native Screen Wake Lock API (Safari iOS 16.4+, Chrome, Edge, Android)
    if ("wakeLock" in navigator && navigator.wakeLock?.request) {
      // If already holding an active lock, return true
      if (sentinelRef.current && !sentinelRef.current.released) {
        setIsActive(true);
        return true;
      }

      try {
        const sentinel = await navigator.wakeLock.request("screen");
        sentinelRef.current = sentinel;
        setIsActive(true);

        sentinel.addEventListener("release", () => {
          setIsActive(false);
          sentinelRef.current = null;
        });

        return true;
      } catch (err: unknown) {
        // AbortError can happen if document is hidden or phone is in ultra low power mode
        setIsActive(false);
        sentinelRef.current = null;
      }
    }

    // 2. Fallback for older iOS versions / legacy webviews: loop a silent dummy canvas video
    try {
      if (!fallbackVideoRef.current && typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;

        // Draw 1 pixel
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "rgba(0,0,0,0.01)";
          ctx.fillRect(0, 0, 1, 1);
        }

        // Capture 1fps stream if supported
        const stream = (canvas as HTMLCanvasElement & { captureStream?: (fps: number) => MediaStream }).captureStream?.(1);
        if (stream) {
          const video = document.createElement("video");
          video.setAttribute("playsinline", "");
          video.setAttribute("webkit-playsinline", "");
          video.muted = true;
          video.loop = true;
          video.srcObject = stream;
          video.style.position = "fixed";
          video.style.opacity = "0.001";
          video.style.pointerEvents = "none";
          video.style.zIndex = "-1";
          document.body.appendChild(video);
          video.play().catch(() => {});
          fallbackVideoRef.current = video;
          setIsActive(true);
          return true;
        }
      }
    } catch {
      // Ignore fallback errors
    }

    return false;
  }, []);

  // Release the Screen Wake Lock
  const release = useCallback(async (): Promise<void> => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // Ignore
      } finally {
        sentinelRef.current = null;
        setIsActive(false);
      }
    }

    if (fallbackVideoRef.current) {
      try {
        fallbackVideoRef.current.pause();
        fallbackVideoRef.current.srcObject = null;
        fallbackVideoRef.current.remove();
      } catch {
        // Ignore
      } finally {
        fallbackVideoRef.current = null;
        setIsActive(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      release();
      return;
    }

    // Request lock initially
    request();

    // Re-acquire lock whenever user returns to tab / phone wakes up
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        request();
      }
    };

    // User gesture fallback: on mobile, if initial request was blocked by lack of user gesture,
    // the first tap will immediately acquire the lock
    const handleUserGesture = () => {
      if (enabled && !sentinelRef.current) {
        request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });
    window.addEventListener("click", handleUserGesture, { once: true, passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("click", handleUserGesture);
      release();
    };
  }, [enabled, request, release]);

  return {
    isSupported,
    isActive,
    request,
    release,
  };
}
