import { create } from "zustand";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type?: "error" | "warning" | "success" | "info";
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  addToast: (
    message: string,
    type?: "error" | "warning" | "success" | "info",
    action?: ToastAction
  ) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = "info", action) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type, action }] }));

    // Auto-remove after 4.5 seconds (gives user comfortable time to hit Undo)
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
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
  info: (msg: string, action?: ToastAction) => useToastStore.getState().addToast(msg, "info", action),
};
