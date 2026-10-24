import React from 'react';
import { MovementLogEntry } from '../game/anticheat/movementLogger';
import { AntiCheatLogsHeader } from './AntiCheatLogsHeader';
import { AntiCheatLogsViewer } from './AntiCheatLogsViewer';

/**
 * Propriedades para a aba de Logs do Painel Anti-Cheat.
 */
interface AntiCheatLogsTabProps {
  logs: MovementLogEntry[];
  copied: boolean;
  onCopyLogs: () => void;
  onClearLogs: () => void;
}

/**
 * Aba de Logs do Anti-Cheat.
 * Exibe o cabeçalho com ações de cópia/limpeza e a visualização dos logs.
 */
export function AntiCheatLogsTab({
  logs,
  copied,
  onCopyLogs,
  onClearLogs,
}: AntiCheatLogsTabProps) {
  return (
    <div className="space-y-2">
      <AntiCheatLogsHeader
        copied={copied}
        onCopyLogs={onCopyLogs}
        onClearLogs={onClearLogs}
      />
      <AntiCheatLogsViewer logs={logs} />
    </div>
  );
}
