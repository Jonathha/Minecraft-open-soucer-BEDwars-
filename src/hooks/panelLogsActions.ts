import { GameEngine } from '../game/gameEngine';

/**
 * Copia os logs brutos de movimentação para a área de transferência.
 */
export function handleCopyLogsAction(
  engine: GameEngine | null,
  setCopied: (v: boolean) => void
): void {
  if (!engine) return;
  const text = engine.antiCheat.movementLogger.getLogsAsString();
  navigator.clipboard
    .writeText(text)
    .then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    })
    .catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
}

/**
 * Reseta o nível de violação (VL) do jogador para 0.
 */
export function handleResetVlAction(
  engine: GameEngine | null,
  setVlScore: (v: number) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  engine.antiCheat.reset();
  setVlScore(0);
  setLastLog('Nível de Violação (VL) resetado para 0');
}

/**
 * Limpa todos os registros do histórico de logs de movimentação.
 */
export function handleClearLogsAction(
  engine: GameEngine | null,
  setLogs: (logs: any[]) => void
): void {
  if (!engine) return;
  engine.antiCheat.movementLogger.clearLogs();
  setLogs([]);
}
