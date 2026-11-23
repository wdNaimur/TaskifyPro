"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseKeyboardShortcutsOptions {
  onOpenNewTask?: () => void;
}

export function useKeyboardShortcuts(options?: UseKeyboardShortcutsOptions) {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts if user is typing in form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Help trigger: '?' key (or Shift + '/')
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // Escape closes help modal if open
      if (e.key === "Escape" && isHelpOpen) {
        e.preventDefault();
        setIsHelpOpen(false);
        return;
      }

      // Modifier key guard: Don't hijack browser combinations like Cmd+R, Ctrl+C, etc.
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // 'n' or 'N' -> Open Add Task modal
      if (e.key === "n" || e.key === "N") {
        if (options?.onOpenNewTask) {
          e.preventDefault();
          options.onOpenNewTask();
        }
        return;
      }

      // Number keys '1' through '5' for quick section navigation
      switch (e.key) {
        case "1":
          e.preventDefault();
          router.push("/focus");
          break;
        case "2":
          e.preventDefault();
          router.push("/tasks");
          break;
        case "3":
          e.preventDefault();
          router.push("/manage");
          break;
        case "4":
          e.preventDefault();
          router.push("/habits");
          break;
        case "5":
          e.preventDefault();
          router.push("/reports");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isHelpOpen, options]);

  return {
    isHelpOpen,
    setIsHelpOpen,
  };
}
