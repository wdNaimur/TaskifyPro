import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ScratchpadState {
  note: string;
  setNote: (note: string) => void;
}

export const useScratchpadStore = create<ScratchpadState>()(
  persist(
    (set) => ({
      note: "",
      setNote: (note: string) => set({ note }),
    }),
    {
      name: "taskify-scratchpad-storage",
    }
  )
);
