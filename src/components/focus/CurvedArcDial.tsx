"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CurvedArcDialProps {
  value: number; // in minutes, e.g. 25
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function CurvedArcDial({
  value,
  onChange,
  min = 5,
  max = 120,
  step = 1,
  disabled = false,
}: CurvedArcDialProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startValRef = useRef(value);
  const [isInteracting, setIsInteracting] = useState(false);

  // SVG Geometry Constants
  // Center of the virtual circle
  const cx = 240;
  const cy = 290;
  const radius = 250; // Arc radius
  const degPerMinute = 2.4; // Degrees between each minute
  const maxAngleDeg = 36; // Maximum visible angle spread left & right

  // Handle pointer down (mouse or touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startValRef.current = value;
    setIsInteracting(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Fallback for older browsers
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || disabled) return;

    const dx = e.clientX - startXRef.current;
    // Moving left increases minutes (turns dial clockwise towards higher numbers)
    // 9 pixels of drag per minute for natural, responsive feel
    const deltaMinutes = -dx / 9;
    const rawVal = startValRef.current + deltaMinutes;
    const clampedVal = Math.max(min, Math.min(max, Math.round(rawVal / step) * step));

    if (clampedVal !== value) {
      onChange(clampedVal);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsInteracting(false);

    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }
  };

  // Generate tick marks around the current value
  const ticks = useMemo(() => {
    const list: {
      minute: number;
      isMajor: boolean;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      labelX?: number;
      labelY?: number;
      opacity: number;
      isCenter: boolean;
    }[] = [];

    const visibleSpan = Math.ceil(maxAngleDeg / degPerMinute) + 2;
    const startMin = Math.max(min, Math.floor(value - visibleSpan));
    const endMin = Math.min(max, Math.ceil(value + visibleSpan));

    for (let m = startMin; m <= endMin; m++) {
      const angleDeg = (m - value) * degPerMinute;
      if (Math.abs(angleDeg) > maxAngleDeg) continue;

      const angleRad = (angleDeg * Math.PI) / 180;
      const sin = Math.sin(angleRad);
      const cos = Math.cos(angleRad);

      const isMajor = m % 5 === 0;
      const isCenter = m === value;

      // Tick lengths
      const tickLength = isMajor ? 16 : 8;
      const rOuter = radius;
      const rInner = radius - tickLength;

      // Outer point (on the arc)
      const x2 = cx + rOuter * sin;
      const y2 = cy - rOuter * cos;

      // Inner point
      const x1 = cx + rInner * sin;
      const y1 = cy - rInner * cos;

      // Opacity fades toward outer edges of the arc
      const normAngle = Math.abs(angleDeg) / maxAngleDeg;
      const opacity = Math.max(0, 1 - Math.pow(normAngle, 1.8));

      // Label point for major ticks
      let labelX: number | undefined;
      let labelY: number | undefined;

      if (isMajor) {
        const rLabel = radius - 30;
        labelX = cx + rLabel * sin;
        labelY = cy - rLabel * cos;
      }

      list.push({
        minute: m,
        isMajor,
        x1,
        y1,
        x2,
        y2,
        labelX,
        labelY,
        opacity: isMajor ? opacity : opacity * 0.7,
        isCenter,
      });
    }

    return list;
  }, [value, min, max, degPerMinute, maxAngleDeg, radius, cx, cy]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "relative w-full max-w-[480px] h-[150px] mx-auto select-none touch-none",
        disabled ? "cursor-default opacity-80" : "cursor-grab active:cursor-grabbing"
      )}
    >
      <svg
        viewBox="0 0 480 150"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        {/* Curved Baseline Arc */}
        <path
          d={`M 90 95 A 250 250 0 0 1 390 95`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Ticks and Number Labels */}
        {ticks.map((t) => (
          <g key={t.minute}>
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isCenter ? "#0F172A" : t.isMajor ? "#475569" : "#94A3B8"}
              strokeWidth={t.isCenter ? 3 : t.isMajor ? 2 : 1.25}
              strokeLinecap="round"
              opacity={t.opacity}
            />

            {t.isMajor && t.labelX !== undefined && t.labelY !== undefined && (
              <text
                x={t.labelX}
                y={t.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={t.isCenter ? "13" : "11"}
                fontWeight={t.isCenter ? "700" : "500"}
                fill={t.isCenter ? "#0F172A" : "#64748B"}
                opacity={t.opacity}
                className="font-mono transition-colors"
              >
                {t.minute}
              </text>
            )}
          </g>
        ))}

        {/* Red Center Indicator Dot (matching photo perfectly) */}
        <circle
          cx={cx}
          cy={26}
          r={5.5}
          fill="#EF4444"
          className="transition-transform duration-150"
          style={{
            transformOrigin: `${cx}px 26px`,
            transform: isInteracting ? "scale(1.2)" : "scale(1)",
          }}
        />
      </svg>
    </div>
  );
}
