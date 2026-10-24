import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AntiCheatControlsFooterProps {
  lastLog: string;
  onSimulateBanModal: () => void;
  onResetVL: () => void;
}

export function AntiCheatControlsFooter({
  lastLog,
  onSimulateBanModal,
  onResetVL,
}: AntiCheatControlsFooterProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          id="btn-trigger-test-ban"
          onClick={onSimulateBanModal}
          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-950/70 hover:bg-red-900/80 border border-red-800/60 text-red-300 rounded text-[11px]"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Simular Ban</span>
        </button>
        <button
          id="btn-reset-vl"
          onClick={onResetVL}
          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 rounded text-[11px]"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Resetar VL</span>
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-neutral-800/80">
        <p className="text-[11px] font-mono text-neutral-300 bg-neutral-900 px-2 py-1 rounded truncate">
          {lastLog}
        </p>
      </div>
    </>
  );
}
