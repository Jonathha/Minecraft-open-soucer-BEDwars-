import React from 'react';
import { AntiCheatControlsTab } from './AntiCheatControlsTab';
import { AntiCheatLogsTab } from './AntiCheatLogsTab';

interface AntiCheatTabContentProps {
  panel: any;
  onSimulateBanModal: () => void;
  onOpenRejectionLogs?: () => void;
}

export function AntiCheatTabContent({
  panel: p,
  onSimulateBanModal,
  onOpenRejectionLogs,
}: AntiCheatTabContentProps) {
  if (p.activeTab === 'logs') {
    return (
      <AntiCheatLogsTab
        logs={p.logs}
        copied={p.copied}
        onCopyLogs={p.handleCopyLogs}
        onClearLogs={p.handleClearLogs}
      />
    );
  }

  return (
    <AntiCheatControlsTab
      vlScore={p.vlScore} flyEnabled={p.flyEnabled}
      speedEnabled={p.speedEnabled} speedValue={p.speedValue}
      espEnabled={p.espEnabled} antiEspEnabled={p.antiEspEnabled}
      fakeFovBypass={p.fakeFovBypass} aimbotEnabled={p.aimbotEnabled}
      aimbotFov={p.aimbotFov} occlusionStatus={p.occlusionStatus}
      opponentDistance={p.opponentDistance} isBotActive={p.isBotActive}
      botMode={p.botMode} botAttack={p.botAttack} lastLog={p.lastLog}
      onOpenRejectionLogs={onOpenRejectionLogs}
      onToggleFly={p.handleToggleFly} onToggleSpeed={p.handleToggleSpeed}
      onSpeedChange={p.handleSpeedChange} onToggleEsp={p.handleToggleEsp}
      onToggleAntiEsp={p.handleToggleAntiEsp} onToggleFakeFovBypass={p.handleToggleFakeFovBypass}
      onToggleAimbot={p.handleToggleAimbot} onAimbotFovChange={p.handleAimbotFovChange}
      onEnterTestArena={p.handleEnterTestArena} onSetBotMode={p.handleSetBotMode}
      onTeleportBotBehindWall={p.handleTeleportBotBehindWall}
      onTeleportBotNearPlayer={p.handleTeleportBotNearPlayer}
      onTeleportBotToCenter={p.handleTeleportBotToCenter}
      onToggleBotAttack={p.handleToggleBotAttack}
      onSpawnVisualWool={p.handleSpawnVisualWool}
      onSpawnFakeGhostBlock={p.handleSpawnFakeGhostBlock}
      onAutoTpBed={p.handleAutoTpBed}
      onSimulateBanModal={onSimulateBanModal} onResetVL={p.handleResetVL}
    />
  );
}
