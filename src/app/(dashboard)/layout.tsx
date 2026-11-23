"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import { FloatingPomodoro } from "@/components/shell/FloatingPomodoro";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { TaskModal } from "@/components/manage/TaskModal";
import { useTaskStore } from "@/lib/stores/taskStore";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);

  const { addTask } = useTaskStore();

  const { isHelpOpen, setIsHelpOpen } = useKeyboardShortcuts({
    onOpenNewTask: () => setIsGlobalTaskModalOpen(true),
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#EEF2EF] p-2.5 sm:p-4 gap-3 sm:gap-4 antialiased">
      {/* ── Toast Notifications ───────────────────────────────────── */}
      <ToastContainer />

      {/* ── Keyboard Shortcuts Help Modal ──────────────────────────── */}
      <KeyboardShortcutsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* ── Global Quick Task Creation Modal ('N' shortcut) ────────── */}
      <TaskModal
        isOpen={isGlobalTaskModalOpen}
        onClose={() => setIsGlobalTaskModalOpen(false)}
        onSave={(newTask) => addTask(newTask)}
      />

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
        <Header
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onOpenShortcuts={() => setIsHelpOpen(true)}
        />

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
