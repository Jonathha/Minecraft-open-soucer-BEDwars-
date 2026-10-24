import React from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';

interface AntiCheatLogsHeaderProps {
  copied: boolean;
  onCopyLogs: () => void;
  onClearLogs: () => void;
}

export function AntiCheatLogsHeader({
  copied,
  onCopyLogs,
  onClearLogs,
}: AntiCheatLogsHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-neutral-900/90 px-2.5 py-1.5 rounded border border-neutral-800">
      <span className="text-[11px] text-neutral-400 font-mono">
        Gravando: 3s Pré-Build + Ação
      </span>
      <div className="flex items-center gap-1.5">
        <button
          id="btn-copy-logs"
          onClick={onCopyLogs}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : 'Copiar Logs'}</span>
        </button>
        <button
          id="btn-clear-logs"
          onClick={onClearLogs}
          title="Limpar todos os logs"
          className="p-1 text-neutral-400 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
