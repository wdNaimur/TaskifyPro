"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { FloatingPomodoro } from "@/components/shell/FloatingPomodoro";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#EEF2EF] p-2.5 sm:p-4 gap-3 sm:gap-4 antialiased">
      {/* ── Persistent Floating Liquid Glass Sidebar ────────────────── */}
      <Sidebar
        desktopCollapsed={desktopCollapsed}
        onToggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
        {/* ── Floating Liquid Glass Header ──────────────────────────── */}
        <Header onOpenMobile={() => setMobileSidebarOpen(true)} />

        {/* ── Page Content ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto mt-2.5 sm:mt-4 pr-1">
          {children}
        </main>

        {/* ── Floating Pomodoro Anchor Widget ─────────────────────── */}
        <FloatingPomodoro />
      </div>
    </div>
  );
}
