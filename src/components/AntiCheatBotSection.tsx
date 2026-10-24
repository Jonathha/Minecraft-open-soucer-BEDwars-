import React from 'react';
import { BotControlMode } from '../game/entities/botOpponent';
import { AntiCheatBotHeader } from './AntiCheatBotHeader';
import { AntiCheatBotModes } from './AntiCheatBotModes';
import { AntiCheatBotTeleports } from './AntiCheatBotTeleports';

interface AntiCheatBotSectionProps {
  isBotActive: boolean;
  botMode: BotControlMode;
  botAttack: boolean;
  onEnterTestArena: () => void;
  onSetBotMode: (mode: BotControlMode) => void;
  onTeleportBotBehindWall: () => void;
  onTeleportBotNearPlayer: () => void;
  onTeleportBotToCenter: () => void;
  onToggleBotAttack: () => void;
}

export function AntiCheatBotSection({
  isBotActive,
  botMode,
  botAttack,
  onEnterTestArena,
  onSetBotMode,
  onTeleportBotBehindWall,
  onTeleportBotNearPlayer,
  onTeleportBotToCenter,
  onToggleBotAttack,
}: AntiCheatBotSectionProps) {
  return (
    <div className="bg-neutral-900/90 rounded-lg p-2.5 border border-neutral-800 space-y-2 mb-2.5">
      <AntiCheatBotHeader
        isBotActive={isBotActive}
        onEnterTestArena={onEnterTestArena}
      />

      {isBotActive ? (
        <div className="space-y-2 pt-0.5">
          <AntiCheatBotModes
            botMode={botMode}
            onSetBotMode={onSetBotMode}
          />
          <AntiCheatBotTeleports
            botAttack={botAttack}
            onTeleportBotBehindWall={onTeleportBotBehindWall}
            onTeleportBotNearPlayer={onTeleportBotNearPlayer}
            onTeleportBotToCenter={onTeleportBotToCenter}
            onToggleBotAttack={onToggleBotAttack}
          />
        </div>
      ) : (
        <p className="text-[11px] text-neutral-400 italic">
          Clique no NPC no Lobby ou use o botão &quot;Entrar na Arena&quot; para testar com o Bot.
        </p>
      )}
    </div>
  );
}
