/**
 * Factory for creating the Pomodoro Web Worker.
 * Ensures timer ticks are not throttled when browser tab is inactive.
 * Includes inline Blob fallback if external worker script fails to load.
 */

const INLINE_WORKER_CODE = `
let intervalId = null;
self.onmessage = function (e) {
  const data = e.data || {};
  const action = data.action;
  if (action === "start") {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage({ type: "TICK", timestamp: Date.now() });
    }, 1000);
  } else if (action === "stop" || action === "pause") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
`;

export function createTimerWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }

  // Attempt 1: Standard public static worker
  try {
    return new Worker("/workers/timerWorker.js");
  } catch {
    // Attempt 2: Inline Blob worker
    try {
      const blob = new Blob([INLINE_WORKER_CODE], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);
      return new Worker(blobUrl);
    } catch (fallbackErr) {
      console.warn(
        "Timer Web Worker unavailable; using main-thread fallback.",
        fallbackErr
      );
      return null;
    }
  }
}
