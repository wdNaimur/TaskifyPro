"use client";

import { Modal } from "@/components/ui/Modal";
import { useSettingsStore } from "@/lib/stores/settingsStore";

interface DangerZoneSettingsProps {
  isResetConfirmOpen: boolean;
  onCloseResetConfirm: () => void;
  isClearAllConfirmOpen: boolean;
  onCloseClearAllConfirm: () => void;
}

export function DangerZoneSettings({
  isResetConfirmOpen,
  onCloseResetConfirm,
  isClearAllConfirmOpen,
  onCloseClearAllConfirm,
}: DangerZoneSettingsProps) {
  const { resetSettings, clearAllAppData } = useSettingsStore();

  return (
    <>
      {/* Reset Preferences Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={onCloseResetConfirm}
        title="Reset All Preferences?"
        description="This will restore all timer durations, soundscapes, and capacity settings to factory defaults."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onCloseResetConfirm}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              resetSettings();
              onCloseResetConfirm();
            }}
            className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-light cursor-pointer shadow-xs"
          >
            Reset Preferences
          </button>
        </div>
      </Modal>

      {/* Clear All App Data Modal */}
      <Modal
        isOpen={isClearAllConfirmOpen}
        onClose={onCloseClearAllConfirm}
        title="Permanently Clear All App Data?"
        description="Warning: This will permanently delete all tasks, backlog items, habit logs, and reflections stored on this device. This action cannot be undone."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onCloseClearAllConfirm}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              clearAllAppData();
              onCloseClearAllConfirm();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs"
          >
            Yes, Clear Everything
          </button>
        </div>
      </Modal>
    </>
  );
}
