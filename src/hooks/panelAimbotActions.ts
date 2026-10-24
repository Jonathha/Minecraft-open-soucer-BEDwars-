import { GameEngine } from '../game/gameEngine';

/**
 * Ações para controle do Aimbot com FOV no painel de testes Anti-Cheat.
 */

export function handleToggleAimbotAction(
  engine: GameEngine | null,
  currentVal: boolean,
  setAimbotEnabled: (v: boolean) => void,
  setLastLog: (msg: string) => void
): void {
  const next = !currentVal;
  setAimbotEnabled(next);
  if (engine) {
    engine.aimbot.aimbotEnabled = next;
  }
  setLastLog(
    next
      ? `Aimbot FOV Ativado (Ativa no clique / tecla L, FOV: ${engine?.aimbot.fov || 70}°)`
      : 'Aimbot FOV Desativado'
  );
}

export function handleAimbotFovChangeAction(
  engine: GameEngine | null,
  fovVal: number,
  setAimbotFov: (v: number) => void,
  setLastLog: (msg: string) => void
): void {
  setAimbotFov(fovVal);
  if (engine) {
    engine.aimbot.fov = fovVal;
  }
  setLastLog(`Aimbot FOV ajustado para ${fovVal}°`);
}
