import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Propriedades do botão flutuante do painel Anti-Cheat.
 */
interface AntiCheatFloatingButtonProps {
  vlScore: number;
  logsCount: number;
  onOpen: () => void;
}

/**
 * Botão flutuante minimizado no canto superior direito.
 */
export function AntiCheatFloatingButton({
  vlScore,
  logsCount,
  onOpen,
}: AntiCheatFloatingButtonProps) {
  return (
    <button
      id="btn-open-ac-panel"
      onClick={onOpen}
      className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-md text-xs shadow-lg backdrop-blur-sm transition-all"
    >
      <Shield className="w-3.5 h-3.5 text-amber-400" />
      <span className="font-mono font-medium">Test AC (VL: {vlScore})</span>
      {logsCount > 0 && (
        <span className="ml-1 bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded text-[10px] font-mono">
          {logsCount} logs
        </span>
      )}
    </button>
  );
}
