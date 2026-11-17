"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  X,
  Flame,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  desktopCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Manage",
    href: "/manage",
    icon: Calendar,
  },
  {
    label: "Habits",
    href: "/habits",
    icon: Sparkles,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({
  desktopCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile Backdrop ────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Container ──────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col select-none",
          // Mobile: flush to screen edge, no peek
          "inset-y-0 left-0 w-64 rounded-r-3xl",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full pointer-events-none",
          // Desktop: floating pill layout with fixed predictable width
          "lg:pointer-events-auto lg:relative lg:inset-y-auto lg:left-auto lg:translate-x-0 lg:rounded-3xl",
          desktopCollapsed ? "lg:w-[68px]" : "lg:w-60",
          // Apple Liquid Glass
          "liquid-glass-dark text-white",
          "transition-[width] duration-300 ease-in-out"
        )}
      >
        {/* ── Header: Logo + Collapse/Close controls ───────────────── */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-white/10 shrink-0 overflow-hidden",
            desktopCollapsed ? "lg:justify-center px-2" : "justify-between px-3.5"
          )}
        >
          {/* Logo Brand Link */}
          <Link
            href="/tasks"
            className="flex items-center gap-3 rounded-2xl focus:outline-hidden"
            onClick={onCloseMobile}
            title={desktopCollapsed ? "Taskify" : undefined}
          >
            {/* Polished Logo: exactly 40x40px */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner ring-1 ring-white/50 backdrop-blur-md">
              <CheckCheck className="h-5 w-5 drop-shadow-md" strokeWidth={2.5} />
            </div>

            {/* Logo Text — hides cleanly when collapsed */}
            <span
              className={cn(
                "font-bold text-lg tracking-tight text-white whitespace-nowrap drop-shadow-xs transition-opacity duration-200",
                desktopCollapsed ? "lg:hidden" : "block"
              )}
            >
              Taskify
            </span>
          </Link>

          {/* Desktop Collapse Toggle Button */}
          {!desktopCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Navigation Links ─────────────────────────────────────── */}
        <nav
          className={cn(
            "flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden",
            desktopCollapsed ? "px-0 flex flex-col items-center" : "px-2.5"
          )}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={desktopCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center h-11 rounded-xl text-sm font-semibold transition-colors group relative overflow-hidden",
                  // In collapsed mode: fixed 44px box centered in the sidebar!
                  desktopCollapsed
                    ? "lg:w-11 lg:justify-center"
                    : "w-full",
                  isActive
                    ? "text-white"
                    : "text-white/75 hover:text-white hover:bg-white/5"
                )}
              >
                {/* ── Apple Liquid Pill: glides between tabs smoothly ── */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-xl liquid-glass-active z-0"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}

                {/* Centered Icon Container */}
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "text-white drop-shadow-md scale-105" : "text-white/75 group-hover:scale-105 group-hover:text-white"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Nav label */}
                <span
                  className={cn(
                    "relative z-10 whitespace-nowrap font-medium text-sm text-white drop-shadow-xs pr-3",
                    desktopCollapsed ? "lg:hidden" : "block"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop Expand Button ───────────────────────────────── */}
        {desktopCollapsed && (
          <div className="hidden lg:flex justify-center pb-2 pt-1 border-t border-white/10 shrink-0">
            <button
              onClick={onToggleCollapse}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
