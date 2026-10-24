import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface AntiCheatLogsButtonProps {
  rejectionCount: number;
  onOpen: () => void;
}

export function AntiCheatLogsButton({ rejectionCount, onOpen }: AntiCheatLogsButtonProps) {
  return (
    <button
      id="btn-open-anticheat-logs"
      onClick={() => {
        document.exitPointerLock?.();
        onOpen();
      }}
      className="fixed top-3 right-48 max-sm:top-12 max-sm:right-3 z-50 flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-md text-xs shadow-lg backdrop-blur-sm transition-all pointer-events-auto cursor-pointer"
      title="Abrir modal com o registro detalhado de rejeições do Anti-Cheat (Atalho: P)"
    >
      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
      <span className="font-medium font-sans">Logs Anti-Cheat</span>
      <span className="text-[10px] text-neutral-400 font-mono bg-neutral-800 px-1 py-0.5 rounded border border-neutral-700/60">[P]</span>
      {rejectionCount > 0 && (
        <span className="ml-0.5 bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.2 rounded text-[10px] font-mono font-bold">
          {rejectionCount}
        </span>
      )}
    </button>
  );
}
