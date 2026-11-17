import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — Class Name utility
 *
 * Combines multiple class values together (strings, arrays, objects)
 * and resolves any conflicting Tailwind classes intelligently.
 *
 * Example:
 *   cn("px-2 py-1", isActive && "bg-sage", "px-4")
 *   → "py-1 bg-sage px-4"   (px-2 is overridden by px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
