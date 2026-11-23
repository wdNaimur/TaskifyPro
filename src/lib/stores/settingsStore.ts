import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserSettings } from "@/types";
import { DEFAULT_USER_SETTINGS } from "@/lib/constants";
import { useToastStore } from "./toastStore";
import { useTaskStore } from "./taskStore";
import { useHabitStore } from "./habitStore";

export interface ExtendedSettings extends UserSettings {
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEffects: boolean;
}

interface SettingsState {
  settings: ExtendedSettings;
  updateSettings: (updates: Partial<ExtendedSettings>) => void;
  resetSettings: () => void;
  exportAllData: () => void;
  importAllData: (jsonString: string) => boolean;
  clearAllAppData: () => void;
}

const INITIAL_SETTINGS: ExtendedSettings = {
  ...DEFAULT_USER_SETTINGS,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEffects: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: INITIAL_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
        useToastStore.getState().addToast("Settings updated", "success");
      },

      resetSettings: () => {
        set({ settings: INITIAL_SETTINGS });
        useToastStore.getState().addToast("Settings reset to defaults", "info");
      },

      exportAllData: () => {
        try {
          const exportPayload = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            tasks: useTaskStore.getState().tasks,
            habits: useHabitStore.getState().habits,
            habitLogs: useHabitStore.getState().logs,
            reflections: useHabitStore.getState().reflections,
            settings: get().settings,
          };

          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
          const downloadAnchor = document.createElement("a");
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute(
            "download",
            `taskify_backup_${new Date().toISOString().split("T")[0]}.json`
          );
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();

          useToastStore.getState().addToast("Backup exported successfully", "success");
        } catch {
          useToastStore.getState().addToast("Failed to export backup", "error");
        }
      },

      importAllData: (jsonString: string): boolean => {
        try {
          const data = JSON.parse(jsonString);
          if (!data || typeof data !== "object") {
            throw new Error("Invalid backup format");
          }

          if (Array.isArray(data.tasks)) {
            useTaskStore.setState({ tasks: data.tasks });
          }

          if (Array.isArray(data.habits)) {
            useHabitStore.setState({
              habits: data.habits,
              logs: data.habitLogs || {},
              reflections: data.reflections || {},
            });
          }

          if (data.settings) {
            set({ settings: { ...INITIAL_SETTINGS, ...data.settings } });
          }

          useToastStore.getState().addToast("Backup restored successfully", "success");
          return true;
        } catch {
          useToastStore.getState().addToast("Invalid JSON backup file", "error");
          return false;
        }
      },

      clearAllAppData: () => {
        useTaskStore.setState({ tasks: [] });
        useHabitStore.setState({ habits: [], logs: {}, reflections: {} });
        set({ settings: INITIAL_SETTINGS });
        useToastStore.getState().addToast("All data cleared", "warning");
      },
    }),
    {
      name: "taskify-settings-storage",
    }
  )
);
