"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
}

const MAX_WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = "lg",
  closeOnBackdropClick = true,
  closeOnEsc = true,
}: ModalProps) {
  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* ── Backdrop ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* ── Modal Card ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className={cn(
              "relative w-full rounded-3xl liquid-glass-light p-5 sm:p-6 shadow-2xl border border-white/80 overflow-hidden z-10 flex flex-col max-h-[90vh]",
              MAX_WIDTH_CLASSES[maxWidth]
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header (rendered if title or icon provided) */}
            {(title || icon) && (
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-forest text-white shadow-xs">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors focus:outline-hidden shrink-0 ml-2"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Content Body with slight inner breathing room so focus rings don't clip */}
            <div className="flex-1 overflow-y-auto mt-3.5 px-1.5 py-1 -mx-1.5">
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="pt-3 border-t border-slate-200/60 shrink-0 mt-3 flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
