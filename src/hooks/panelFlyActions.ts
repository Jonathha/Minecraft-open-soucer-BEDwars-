import { GameEngine } from '../game/gameEngine';

/**
 * Controla a ativação e desativação do sistema de Fly de teste.
 * Permite alternar o estado do jogador no motor e atualizar a UI.
 */
export function handleToggleFlyAction(
  engine: GameEngine | null,
  flyEnabled: boolean,
  setFlyEnabled: (v: boolean) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  const next = !flyEnabled;
  setFlyEnabled(next);
  engine.player.isFlyEnabled = next;
  setLastLog(
    next
      ? 'Sistema de Fly ATIVADO (Segure [ L ] para voar)'
      : 'Sistema de Fly DESATIVADO'
  );
}

/**
 * Reseta o estado do sistema de Fly para desativado.
 */
export function handleResetFlyState(
  engine: GameEngine | null,
  setFlyEnabled: (v: boolean) => void
): void {
  if (!engine) return;
  engine.player.isFlyEnabled = false;
  setFlyEnabled(false);
}
