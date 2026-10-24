import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { AntiCheatFloatingButton } from './AntiCheatFloatingButton';
import { AntiCheatPanelHeader } from './AntiCheatPanelHeader';
import { AntiCheatPanelTabs } from './AntiCheatPanelTabs';
import { AntiCheatTabContent } from './AntiCheatTabContent';
import { useAntiCheatPanel } from '../hooks/useAntiCheatPanel';

interface AntiCheatTestPanelProps {
  engine: GameEngine | null;
  onSimulateBanModal?: () => void;
  onOpenRejectionLogs?: () => void;
}

export function AntiCheatTestPanel({
  engine,
  onSimulateBanModal = () => {},
  onOpenRejectionLogs,
}: AntiCheatTestPanelProps) {
  const p = useAntiCheatPanel(engine);

  if (!p.isOpen) {
    return (
      <AntiCheatFloatingButton
        vlScore={p.vlScore}
        logsCount={p.logs.length}
        onOpen={() => p.setIsOpen(true)}
      />
    );
  }

  return (
    <div
      id="anticheat-test-panel"
      className={`fixed top-3 right-3 z-50 bg-neutral-950/95 border border-neutral-800 rounded-lg shadow-2xl p-3 text-neutral-200 text-xs font-sans backdrop-blur-md transition-all max-h-[calc(100vh-24px)] flex flex-col ${
        p.activeTab === 'logs' ? 'w-[450px]' : 'w-80'
      }`}
    >
      <AntiCheatPanelHeader onClose={() => p.setIsOpen(false)} />

      <AntiCheatPanelTabs
        activeTab={p.activeTab}
        logsCount={p.logs.length}
        onSelectTab={p.setActiveTab}
      />

      <div className="flex-1 overflow-y-auto pr-1">
        <AntiCheatTabContent
          panel={p}
          onSimulateBanModal={onSimulateBanModal}
          onOpenRejectionLogs={onOpenRejectionLogs}
        />
      </div>
    </div>
  );
}
