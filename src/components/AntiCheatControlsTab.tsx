import React from 'react';
import { AntiCheatControlsTabProps } from './antiCheatControlsProps';
import { AntiCheatRejectionsButton } from './AntiCheatRejectionsButton';
import { AntiCheatEspSection } from './AntiCheatEspSection';
import { AntiCheatAimbotSection } from './AntiCheatAimbotSection';
import { AntiCheatBotSection } from './AntiCheatBotSection';
import { AntiCheatMovementSection } from './AntiCheatMovementSection';
import { AntiCheatExploitsSection } from './AntiCheatExploitsSection';
import { AntiCheatControlsFooter } from './AntiCheatControlsFooter';

export function AntiCheatControlsTab(p: AntiCheatControlsTabProps) {
  return (
    <div className="space-y-2.5">
      <AntiCheatRejectionsButton onOpenRejectionLogs={p.onOpenRejectionLogs} />
      <AntiCheatEspSection
        espEnabled={p.espEnabled} antiEspEnabled={p.antiEspEnabled}
        fakeFovBypass={p.fakeFovBypass} occlusionStatus={p.occlusionStatus}
        opponentDistance={p.opponentDistance} onToggleEsp={p.onToggleEsp}
        onToggleAntiEsp={p.onToggleAntiEsp} onToggleFakeFovBypass={p.onToggleFakeFovBypass}
      />
      <AntiCheatAimbotSection
        aimbotEnabled={p.aimbotEnabled} aimbotFov={p.aimbotFov}
        onToggleAimbot={p.onToggleAimbot} onAimbotFovChange={p.onAimbotFovChange}
      />
      <AntiCheatBotSection
        isBotActive={p.isBotActive} botMode={p.botMode} botAttack={p.botAttack}
        onEnterTestArena={p.onEnterTestArena} onSetBotMode={p.onSetBotMode}
        onTeleportBotBehindWall={p.onTeleportBotBehindWall}
        onTeleportBotNearPlayer={p.onTeleportBotNearPlayer}
        onTeleportBotToCenter={p.onTeleportBotToCenter} onToggleBotAttack={p.onToggleBotAttack}
      />
      <AntiCheatMovementSection
        flyEnabled={p.flyEnabled} speedEnabled={p.speedEnabled} speedValue={p.speedValue}
        onToggleFly={p.onToggleFly} onToggleSpeed={p.onToggleSpeed} onSpeedChange={p.onSpeedChange}
      />
      <AntiCheatExploitsSection
        onSpawnFakeGhostBlock={p.onSpawnFakeGhostBlock}
        onSpawnVisualWool={p.onSpawnVisualWool} onAutoTpBed={p.onAutoTpBed}
      />
      <AntiCheatControlsFooter
        lastLog={p.lastLog} onSimulateBanModal={p.onSimulateBanModal} onResetVL={p.onResetVL}
      />
    </div>
  );
}
