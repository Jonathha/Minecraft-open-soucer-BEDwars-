import React from 'react';
import { Sliders, Terminal } from 'lucide-react';

interface AntiCheatPanelTabsProps {
  activeTab: 'controls' | 'logs';
  logsCount: number;
  onSelectTab: (tab: 'controls' | 'logs') => void;
}

export function AntiCheatPanelTabs({
  activeTab,
  logsCount,
  onSelectTab,
}: AntiCheatPanelTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded border border-neutral-800 mb-2.5">
      <button
        onClick={() => onSelectTab('controls')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded text-xs font-medium transition-colors ${
          activeTab === 'controls'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Controles de Teste</span>
      </button>
      <button
        onClick={() => onSelectTab('logs')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded text-xs font-medium transition-colors ${
          activeTab === 'logs'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>Logs de Movimento ({logsCount})</span>
      </button>
    </div>
  );
}
