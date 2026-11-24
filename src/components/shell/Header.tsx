"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, User, Keyboard } from "lucide-react";

interface HeaderProps {
  onOpenMobile: () => void;
  onOpenShortcuts?: () => void;
}

const PAGE_SUBTITLES: Record<string, string> = {
  "/tasks":    "Today's Focus",
  "/manage":   "Planning Engine",
  "/habits":   "Habit Tracker",
  "/reports":  "Analytics",
  "/settings": "Settings",
  "/focus":    "Deep Focus Mode",
};

export function Header({ onOpenMobile, onOpenShortcuts }: HeaderProps) {
  const pathname = usePathname();
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date())
    );
  }, []);

  // Pick the subtitle for the current route; fall back to app name
  const subtitle = PAGE_SUBTITLES[pathname] ?? "Taskify";

  return (
    <header className="h-16 shrink-0 rounded-2xl liquid-glass-light flex items-center justify-between px-4 lg:px-6 select-none transition-all">
      {/* ── Left side: Mobile Hamburger + Date ────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 rounded-xl text-slate-charcoal hover:bg-black/5 transition-colors lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-slate-800 leading-tight tracking-tight min-h-[1.25rem]">
            {today || "Today"}
          </h2>
          <p className="text-xs font-medium text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ── Right side: Notifications & User avatar ────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Keyboard Shortcuts Helper */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-2 text-slate-charcoal/70 hover:text-slate-charcoal hover:bg-black/5 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Keyboard Shortcuts"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-4 w-4" />
          </button>
        )}

        {/* Notifications — badge only shown when there are real notifications */}
        <button
          className="p-2 text-slate-charcoal/70 hover:text-slate-charcoal hover:bg-black/5 rounded-xl transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Badge removed — will be restored when real notifications are wired up */}
        </button>

        {/* User Avatar */}
        <button
          className="flex items-center justify-center h-9 w-9 rounded-xl bg-forest/80 text-white hover:bg-forest transition-colors border border-white/40 shadow-xs focus:outline-hidden ring-1 ring-black/5"
          aria-label="User profile"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
