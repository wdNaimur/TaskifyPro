"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatVisualizerProps {
  timeLeft: number;
  isRunning: boolean;
  isControlsVisible?: boolean;
  isRotated?: boolean;
}

// Individual animated rolling bubble digit with fixed block width & playful angle
function RollingBubbleDigit({
  digit,
  color,
  rotation = 0,
  overlap = false,
  zIndex = 10,
}: {
  digit: string;
  color: string;
  rotation?: number;
  overlap?: boolean;
  zIndex?: number;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none shrink-0",
        // Fixed proportional block width so digits never jump or jitter
        "w-[0.58em] min-w-[0.58em]",
        // Controlled, clean overlap
        overlap && "-ml-[0.14em]"
      )}
      style={{
        zIndex,
        fontFamily:
          "var(--font-fredoka), 'Fredoka', 'Nunito', 'SF Pro Rounded', 'Arial Rounded MT Bold', sans-serif",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={digit}
          initial={{ y: -24, opacity: 0, rotate: rotation - 4 }}
          animate={{ y: 0, opacity: 0.95, rotate: rotation }}
          exit={{ y: 24, opacity: 0, rotate: rotation + 4 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 26,
            mass: 0.8,
          }}
          className="mix-blend-screen transition-colors leading-none tracking-tight select-none inline-block text-center"
          style={{ color }}
        >
          {digit}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function FloatVisualizer({
  timeLeft,
  isRunning,
  isControlsVisible = true,
  isRotated = false,
}: FloatVisualizerProps) {
  // Option to toggle between Hours:Minutes ("02:21") and Total Minutes ("141:00") when >= 60 min
  const [preferTotalMinutes, setPreferTotalMinutes] = useState(false);
  const [isPhysicalLandscape, setIsPhysicalLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPhysicalLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Compute font size from vertical perspective:
  // - If software isRotated (portrait phone turned 90°): user's visual height is physical width (vw).
  //   Fills ~60% of vertical perspective: min(60vw, 30vh).
  // - If physically in landscape (width > height): user's visual height is physical height (vh).
  //   Fills ~60% of vertical perspective: min(28vw, 60vh).
  // - If standard portrait: width is the limiting factor: clamp(4.25rem, min(34vw, 38vh), 22rem).
  const dynamicFontSize = isRotated
    ? "clamp(4.5rem, min(60vw, 30vh), 22rem)"
    : isPhysicalLandscape
    ? "clamp(4.5rem, min(28vw, 60vh), 22rem)"
    : "clamp(4.25rem, min(34vw, 38vh), 22rem)";

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const totalMinutes = Math.floor(timeLeft / 60);

  const isHoursMode = hours > 0 && !preferTotalMinutes;

  // Primary left and right pairs
  const leftStr = isHoursMode
    ? String(hours).padStart(2, "0")
    : String(totalMinutes).padStart(2, "0");

  const rightStr = isHoursMode
    ? String(minutes).padStart(2, "0")
    : String(seconds).padStart(2, "0");

  const leftDigits = leftStr.split("");
  const rightDigits = rightStr.split("");

  // Color palette for left digits
  const leftColors = ["#4FA3FF", "#FFA558", "#FF85A1"];
  const leftRotations = [-3, 3.5, 2];

  // Color palette for right digits
  const rightColors = ["#0066FF", "#FF7522", "#E11D48"];
  const rightRotations = [-2.5, 4, 2];

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* ── Giant StandBy Float Clock Face ──────────────────────────── */}
      <motion.div
        animate={{
          y: isRunning ? [0, -6, 0] : 0,
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center select-none leading-none font-bold max-w-full px-1"
        style={{ fontSize: dynamicFontSize }}
      >
        {/* ── Left Pair: Hours (or Minutes) ─────────────────────────── */}
        <div className="flex items-center">
          {leftDigits.map((d, idx) => (
            <RollingBubbleDigit
              key={`left-${idx}`}
              digit={d}
              color={leftColors[idx % leftColors.length]}
              rotation={leftRotations[idx % leftRotations.length]}
              overlap={idx > 0}
              zIndex={10 + idx * 5}
            />
          ))}
        </div>

        {/* ── Colon Discs (Two frosted translucent spheres) ─────────── */}
        <div className="flex flex-col justify-center items-center gap-[0.14em] px-[0.1em] relative z-30 shrink-0">
          <motion.div
            animate={{ opacity: isRunning ? [0.95, 0.45, 0.95] : 0.85 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="h-[0.12em] w-[0.12em] rounded-full bg-white/75 shadow-[0_0_24px_rgba(255,255,255,0.7)] backdrop-blur-md"
          />
          <motion.div
            animate={{ opacity: isRunning ? [0.95, 0.45, 0.95] : 0.85 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="h-[0.12em] w-[0.12em] rounded-full bg-white/75 shadow-[0_0_24px_rgba(255,255,255,0.7)] backdrop-blur-md"
          />
        </div>

        {/* ── Right Pair: Minutes (or Seconds) ──────────────────────── */}
        <div className="flex items-center">
          {rightDigits.map((d, idx) => (
            <RollingBubbleDigit
              key={`right-${idx}`}
              digit={d}
              color={rightColors[idx % rightColors.length]}
              rotation={rightRotations[idx % rightRotations.length]}
              overlap={idx > 0}
              zIndex={10 + idx * 5}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Unit Indicators & Live Remaining Time Tag (Auto-hides with controls) ─ */}
      <div
        className={cn(
          "flex flex-col items-center gap-1.5 mt-2 sm:mt-4 z-20 transition-opacity duration-500",
          !isControlsVisible && isRunning ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="flex items-center gap-6 sm:gap-12 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-white/35 uppercase">
          <span>{isHoursMode ? "HRS" : "MIN"}</span>
          <span>{isHoursMode ? "MIN" : "SEC"}</span>
        </div>

        {/* Dynamic Detail Pill (Click to toggle format if session > 59 min) */}
        {hours > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreferTotalMinutes(!preferTotalMinutes);
            }}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5"
            title="Click to toggle display format"
          >
            <span>⏱️</span>
            <span>
              {hours}h {minutes}m {String(seconds).padStart(2, "0")}s
            </span>
            <span className="text-[10px] text-white/30">
              ({totalMinutes}m total)
            </span>
          </button>
        ) : (
          <div className="text-[11px] font-mono text-white/40 tracking-wider">
            {minutes}m {String(seconds).padStart(2, "0")}s
          </div>
        )}
      </div>
    </div>
  );
}
