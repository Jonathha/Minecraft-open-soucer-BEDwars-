import React from 'react';
import { Gauge } from 'lucide-react';

interface AntiCheatMovementSpeedProps {
  speedEnabled: boolean;
  speedValue: number;
  onToggleSpeed: () => void;
}

export function AntiCheatMovementSpeed({
  speedEnabled,
  speedValue,
  onToggleSpeed,
}: AntiCheatMovementSpeedProps) {
  return (
    <button
      id="btn-toggle-speed"
      onClick={onToggleSpeed}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-colors ${
        speedEnabled
          ? 'bg-blue-950/70 border-blue-500/80 text-blue-200'
          : 'bg-neutral-800/70 border-neutral-700/60 text-neutral-300 hover:bg-neutral-700'
      }`}
    >
      <div className="flex flex-col text-left">
        <span className="flex items-center gap-1.5 font-medium text-xs">
          <Gauge className="w-3.5 h-3.5 text-blue-400" />
          Sistema de Speed
        </span>
        <span className="text-[9.5px] text-neutral-400">
          {speedEnabled
            ? `Velocidade: ${speedValue.toFixed(1)}x (${(6.2 * speedValue).toFixed(1)} m/s)`
            : 'Aumenta velocidade do jogador'}
        </span>
      </div>
      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-900/80">
        {speedEnabled ? 'LIGADO' : 'DESLIGADO'}
      </span>
    </button>
  );
}
