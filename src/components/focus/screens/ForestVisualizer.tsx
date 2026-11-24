"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coffee, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForestVisualizerProps {
  formattedTime: string;
  progressRatio: number;
  mode: "work" | "shortBreak" | "longBreak";
  isRotated?: boolean;
}

export function ForestVisualizer({
  formattedTime,
  progressRatio,
  mode,
  isRotated = false,
}: ForestVisualizerProps) {
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

  // Compute sizing based on vertical perspective:
  // - In rotated mode: vertical height is physical width (vw). Fill ~76% of vertical perspective.
  // - In physical landscape: vertical height is physical height (vh). Fill ~76% of vertical perspective.
  // - In standard portrait: fill 88% width / 76% height.
  const svgSize = isRotated
    ? "w-[min(76vw,76vh,440px)] h-[min(76vw,76vh,440px)]"
    : isPhysicalLandscape
    ? "w-[min(76vh,76vw,440px)] h-[min(76vh,76vw,440px)]"
    : "w-[min(88vw,76vh,440px)] h-[min(88vw,76vh,440px)]";

  const countdownTextSize = isRotated
    ? "text-[clamp(2.5rem,min(11vw,11vh),4.5rem)]"
    : isPhysicalLandscape
    ? "text-[clamp(2.5rem,min(11vh,11vw),4.5rem)]"
    : "text-[clamp(2.25rem,min(9vw,9vh),4.5rem)]";

  // SVG Radial Ring properties
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        viewBox="0 0 320 320"
        className={cn(svgSize, "-rotate-90")}
      >
        {/* Background Track */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth="9"
          stroke="rgba(16, 185, 129, 0.1)"
          fill="transparent"
        />
        {/* Active Progress Ring */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth="9"
          stroke="#10b981"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>

      {/* Living Tree & Large Timer in Center */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        {/* Forest Tree Stages */}
        <div className="mb-2">
          {mode === "work" ? (
            progressRatio < 0.25 ? (
              /* Stage 1: Baby Sprout (0 - 25%) */
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-emerald-400"
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22v-8" />
                  <path d="M12 14c-3-2-6 0-6 4 3 1 6-1 6-4z" fill="currentColor" fillOpacity="0.3" />
                  <path d="M12 14c3-2 6 0 6 4-3 1-6-1-6-4z" fill="currentColor" fillOpacity="0.4" />
                </svg>
              </motion.div>
            ) : progressRatio < 0.75 ? (
              /* Stage 2: Growing Sapling (25 - 75%) */
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-emerald-300"
              >
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22V8" />
                  <path d="M12 12c-4-2-7 0-7 5 4 1 7-2 7-5z" fill="currentColor" fillOpacity="0.3" />
                  <path d="M12 10c4-2 7 0 7 5-4 1-7-2-7-5z" fill="currentColor" fillOpacity="0.35" />
                  <path d="M12 8c-2-3-4-2-4 1 2 1 4-1 4-1z" fill="currentColor" fillOpacity="0.45" />
                </svg>
              </motion.div>
            ) : (
              /* Stage 3: Full Blooming Tree (75 - 100%) */
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-emerald-400"
              >
                <TreePine className="h-14 w-14 fill-emerald-500/25 drop-shadow-md" />
              </motion.div>
            )
          ) : (
            /* Rest / Break: Steaming tea */
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-amber-400"
            >
              <Coffee className="h-12 w-12" />
            </motion.div>
          )}
        </div>

        {/* Countdown Digits */}
        <div className={cn("font-mono font-bold tracking-tight text-white drop-shadow-lg", countdownTextSize)}>
          {formattedTime}
        </div>

        <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/80 mt-1">
          {mode === "work" ? "Immersion Mode" : "Rest & Breathe"}
        </p>
      </div>
    </div>
  );
}
