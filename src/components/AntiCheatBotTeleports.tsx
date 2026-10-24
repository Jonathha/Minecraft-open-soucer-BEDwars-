import React from 'react';
import { Swords, ShieldOff } from 'lucide-react';

interface AntiCheatBotTeleportsProps {
  botAttack: boolean;
  onTeleportBotBehindWall: () => void;
  onTeleportBotNearPlayer: () => void;
  onTeleportBotToCenter: () => void;
  onToggleBotAttack: () => void;
}

export function AntiCheatBotTeleports({
  botAttack,
  onTeleportBotBehindWall,
  onTeleportBotNearPlayer,
  onTeleportBotToCenter,
  onToggleBotAttack,
}: AntiCheatBotTeleportsProps) {
  return (
    <>
      <div className="space-y-1 pt-1 border-t border-neutral-800/80">
        <span className="text-[10px] text-neutral-400 font-medium">Posicionamento Rápido:</span>
        <div className="grid grid-cols-3 gap-1">
          <button
            id="btn-tp-bot-wall"
            onClick={onTeleportBotBehindWall}
            className="py-1 px-1 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded text-[10px] truncate"
            title="Posiciona o Bot atrás da parede na base azul"
          >
            🧱 Na Parede
          </button>
          <button
            id="btn-tp-bot-near"
            onClick={onTeleportBotNearPlayer}
            className="py-1 px-1 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded text-[10px] truncate"
            title="Teleporta o bot a 3 metros (Buffer <5m)"
          >
            📍 Perto (3m)
          </button>
          <button
            id="btn-tp-bot-center"
            onClick={onTeleportBotToCenter}
            className="py-1 px-1 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded text-[10px] truncate"
            title="Teleporta para a ilha central"
          >
            🏛️ Centro
          </button>
        </div>
      </div>

      <button
        id="btn-toggle-bot-attack"
        onClick={onToggleBotAttack}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-medium border transition-colors ${
          botAttack
            ? 'bg-rose-950/80 text-rose-300 border-rose-700 hover:bg-rose-900/80'
            : 'bg-neutral-800/90 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
        }`}
      >
        <span className="flex items-center gap-1.5">
          {botAttack ? <Swords className="w-3.5 h-3.5 text-rose-400" /> : <ShieldOff className="w-3.5 h-3.5 text-neutral-400" />}
          Ataque do Bot
        </span>
        <span className="font-mono text-[10px] font-bold">
          {botAttack ? 'ATIVADO' : 'PACÍFICO'}
        </span>
      </button>
    </>
  );
}
