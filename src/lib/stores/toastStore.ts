import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type?: "error" | "warning" | "success" | "info";
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: "error" | "warning" | "success" | "info") => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = `toast-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Quick helper
export const toast = {
  error: (msg: string) => useToastStore.getState().addToast(msg, "error"),
  warning: (msg: string) => useToastStore.getState().addToast(msg, "warning"),
  success: (msg: string) => useToastStore.getState().addToast(msg, "success"),
  info: (msg: string) => useToastStore.getState().addToast(msg, "info"),
};
