import React from 'react';
import { Wind } from 'lucide-react';

interface AntiCheatMovementFlyProps {
  flyEnabled: boolean;
  onToggleFly: () => void;
}

export function AntiCheatMovementFly({
  flyEnabled,
  onToggleFly,
}: AntiCheatMovementFlyProps) {
  return (
    <button
      id="btn-toggle-fly"
      onClick={onToggleFly}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-colors ${
        flyEnabled
          ? 'bg-purple-950/70 border-purple-500/80 text-purple-200'
          : 'bg-neutral-800/70 border-neutral-700/60 text-neutral-300 hover:bg-neutral-700'
      }`}
    >
      <div className="flex flex-col text-left">
        <span className="flex items-center gap-1.5 font-medium text-xs">
          <Wind className="w-3.5 h-3.5 text-purple-400" />
          Sistema de Fly [ Segure L ]
        </span>
        <span className="text-[9.5px] text-neutral-400">
          {flyEnabled
            ? 'Segure [ L ] no jogo para voar'
            : 'Ative para voar ao segurar L'}
        </span>
      </div>
      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-900/80">
        {flyEnabled ? 'LIGADO' : 'DESLIGADO'}
      </span>
    </button>
  );
}
