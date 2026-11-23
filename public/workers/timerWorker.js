// Taskify Pomodoro Web Worker
// Runs in a background thread, immune to main thread UI suspension and tab throttling.

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
