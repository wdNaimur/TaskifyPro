"use client";

import { useRef } from "react";
import { Download, Upload, FlaskConical, ShieldAlert } from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useTaskStore } from "@/lib/stores/taskStore";

interface DataBackupSettingsProps {
  onOpenClearAllModal: () => void;
}

export function DataBackupSettings({ onOpenClearAllModal }: DataBackupSettingsProps) {
  const { exportAllData, importAllData } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importAllData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="liquid-glass-light rounded-3xl p-5 sm:p-7 border border-white/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
        <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Data Management &amp; Backups
          </h2>
          <p className="text-xs text-slate-500">
            Your data is completely private and stored locally. Export or restore backups anytime.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Export JSON */}
        <button
          type="button"
          onClick={exportAllData}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Download className="h-4 w-4 text-forest" />
          <span>Export Backup (JSON)</span>
        </button>

        {/* Import JSON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Upload className="h-4 w-4 text-blue-600" />
          <span>Restore Backup (JSON)</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Seed Dev Test Data */}
        <button
          type="button"
          onClick={() => useTaskStore.getState().loadDevDemoTasks()}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <FlaskConical className="h-4 w-4 text-amber-600" />
          <span>Load Dev Test Tasks</span>
        </button>

        {/* Clear Data Danger Zone */}
        <button
          type="button"
          onClick={onOpenClearAllModal}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-50/80 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <span>Clear All Data</span>
        </button>
      </div>
    </div>
  );
}
