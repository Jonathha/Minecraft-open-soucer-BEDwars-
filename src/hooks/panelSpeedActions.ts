import { GameEngine } from '../game/gameEngine';

/**
 * Alterna a ativação do cheat de Speed no jogador.
 */
export function handleToggleSpeedAction(
  engine: GameEngine | null,
  speedEnabled: boolean,
  speedValue: number,
  setSpeedEnabled: (v: boolean) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  const next = !speedEnabled;
  setSpeedEnabled(next);
  engine.player.isSpeedEnabled = next;
  setLastLog(
    next
      ? `Sistema de Speed ATIVADO (${speedValue.toFixed(1)}x)`
      : 'Sistema de Speed DESATIVADO'
  );
}

/**
 * Atualiza o multiplicador de velocidade do jogador no motor.
 */
export function handleSpeedChangeAction(
  engine: GameEngine | null,
  val: number,
  speedEnabled: boolean,
  setSpeedValue: (v: number) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  setSpeedValue(val);
  engine.player.speedMultiplier = val;
  if (speedEnabled || engine.player.isSpeedEnabled) {
    setLastLog(
      `Velocidade configurada para ${val.toFixed(1)}x (${(6.2 * val).toFixed(1)} m/s)`
    );
  }
}
