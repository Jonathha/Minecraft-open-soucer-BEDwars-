import React from 'react';
import { BotControlMode } from '../game/entities/botOpponent';

interface AntiCheatBotModesProps {
  botMode: BotControlMode;
  onSetBotMode: (mode: BotControlMode) => void;
}

export function AntiCheatBotModes({
  botMode,
  onSetBotMode,
}: AntiCheatBotModesProps) {
  const topButtons = [
    { mode: 'behind_wall' as const, label: '🧱 Na Parede', id: 'btn-bot-mode-behind-wall' },
    { mode: 'idle' as const, label: '🛑 Parado', id: 'btn-bot-mode-idle' },
    { mode: 'follow' as const, label: '🏃 Seguir', id: 'btn-bot-mode-follow' },
  ];

  const bottomButtons = [
    { mode: 'patrol' as const, label: '↔️ Patrulhar', id: 'btn-bot-mode-patrol' },
    { mode: 'bridge' as const, label: '🌉 Fazer Ponte', id: 'btn-bot-mode-bridge' },
  ];

  return (
    <div className="space-y-1">
      <span className="text-[10px] text-neutral-400 font-medium">Comportamento:</span>
      <div className="grid grid-cols-3 gap-1">
        {topButtons.map((btn) => (
          <button
            key={btn.mode}
            id={btn.id}
            onClick={() => onSetBotMode(btn.mode)}
            className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-colors ${
              botMode === btn.mode
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-neutral-800/90 text-neutral-400 border-neutral-700 hover:bg-neutral-700/80'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 pt-0.5">
        {bottomButtons.map((btn) => (
          <button
            key={btn.mode}
            id={btn.id}
            onClick={() => onSetBotMode(btn.mode)}
            className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-colors ${
              botMode === btn.mode
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-neutral-800/90 text-neutral-400 border-neutral-700 hover:bg-neutral-700/80'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
