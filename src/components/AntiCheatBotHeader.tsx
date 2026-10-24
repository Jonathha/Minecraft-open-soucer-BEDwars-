import React from 'react';
import { Bot, Play } from 'lucide-react';

interface AntiCheatBotHeaderProps {
  isBotActive: boolean;
  onEnterTestArena: () => void;
}

export function AntiCheatBotHeader({
  isBotActive,
  onEnterTestArena,
}: AntiCheatBotHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
        <Bot className="w-3.5 h-3.5 text-blue-400" />
        Bot de Testes
      </span>
      {!isBotActive ? (
        <button
          id="btn-panel-enter-test-arena"
          onClick={onEnterTestArena}
          className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/80 transition-colors"
        >
          <Play className="w-2.5 h-2.5" />
          Entrar na Arena
        </button>
      ) : (
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
          Ativo
        </span>
      )}
    </div>
  );
}
