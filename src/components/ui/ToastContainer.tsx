"use client";

import { useToastStore } from "@/lib/stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "pointer-events-auto rounded-2xl p-3 shadow-2xl border backdrop-blur-xl flex items-center justify-between gap-3",
              t.type === "error" || t.type === "warning"
                ? "bg-red-50/90 border-red-200 text-red-900"
                : t.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                : "bg-white/90 border-white/80 text-slate-800"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === "error" || t.type === "warning" ? (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              ) : t.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-slate-600 shrink-0" />
              )}
              <span className="text-xs font-semibold leading-snug truncate">
                {t.message}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-forest hover:bg-forest-light text-white text-[11px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {t.action.label}
                </button>
              )}

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
