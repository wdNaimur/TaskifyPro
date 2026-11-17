"use client";

import { Menu, Flame, Bell, User } from "lucide-react";

interface HeaderProps {
  onOpenMobile: () => void;
}

export function Header({ onOpenMobile }: HeaderProps) {
  // Format current date nicely: "Tuesday, Nov 17"
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

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
          <h2 className="text-base font-bold text-slate-800 leading-tight tracking-tight">
            {today}
          </h2>
          <p className="text-xs font-medium text-slate-500 hidden sm:block">
            Today&apos;s Focus
          </p>
        </div>
      </div>

      {/* ── Right side: Quick stats & User avatar ────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          className="p-2 text-slate-charcoal/70 hover:text-slate-charcoal hover:bg-black/5 rounded-xl transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-priority-p0-text ring-2 ring-white" />
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

