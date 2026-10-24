import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface AntiCheatRejectionsButtonProps {
  onOpenRejectionLogs?: () => void;
}

export function AntiCheatRejectionsButton({
  onOpenRejectionLogs,
}: AntiCheatRejectionsButtonProps) {
  if (!onOpenRejectionLogs) return null;

  return (
    <button
      id="btn-panel-open-rejections"
      onClick={onOpenRejectionLogs}
      className="w-full flex items-center justify-between px-2.5 py-1.5 mb-2.5 bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 text-red-300 rounded transition-colors text-xs"
    >
      <span className="flex items-center gap-1.5 font-medium">
        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        Abrir Relatório de Rejeições
      </span>
      <span className="text-[10px] bg-red-900/60 px-1.5 py-0.5 rounded font-mono text-red-300">
        [P]
      </span>
    </button>
  );
}
