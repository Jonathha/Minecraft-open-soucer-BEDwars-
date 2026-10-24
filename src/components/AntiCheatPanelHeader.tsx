import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Propriedades para o cabeçalho superior do painel Anti-Cheat.
 */
interface AntiCheatPanelHeaderProps {
  onClose: () => void;
}

/**
 * Cabeçalho do Painel Anti-Cheat contendo ícone de escudo, título e botão de fechar.
 */
export function AntiCheatPanelHeader({
  onClose,
}: AntiCheatPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
      <div className="flex items-center gap-1.5">
        <Shield className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-neutral-100">Painel Anti-Cheat</span>
      </div>
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-neutral-800/60 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
