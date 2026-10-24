import { GameEngine } from '../game/gameEngine';

/**
 * Alterna a visibilidade do modelo 3D através de blocos (ESP Chams).
 */
export function handleToggleEspAction(
  engine: GameEngine | null,
  espEnabled: boolean,
  setEspEnabled: (v: boolean) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  const next = !espEnabled;
  setEspEnabled(next);
  engine.esp.toggleEsp(next);
  setLastLog(
    next
      ? 'ESP de Personagem (Chams 3D) ATIVADO: Modelo visível através dos blocos!'
      : 'ESP de Personagem DESATIVADO'
  );
}

/**
 * Alterna a proteção de oclusão do Anti-ESP por cálculo de raio/voxels.
 */
export function handleToggleAntiEspAction(
  engine: GameEngine | null,
  antiEspEnabled: boolean,
  setAntiEspEnabled: (v: boolean) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  const next = !antiEspEnabled;
  setAntiEspEnabled(next);
  engine.esp.toggleAntiEsp(next);
  setLastLog(
    next
      ? 'Anti-ESP ATIVADO (Oclusão por Raio/Voxel): Jogador oculto atrás de paredes (>4.5m)!'
      : 'Anti-ESP DESATIVADO: Todos os jogadores são transmitidos e renderizados.'
  );
}

/**
 * Alterna a tentativa de bypass de FOV para testar a defesa do Anti-ESP.
 */
export function handleToggleFakeFovBypassAction(
  engine: GameEngine | null,
  fakeFovBypass: boolean,
  setFakeFovBypass: (v: boolean) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  const next = !fakeFovBypass;
  setFakeFovBypass(next);
  engine.esp.toggleFakeFovBypass(next);
  setLastLog(
    next
      ? 'Teste de Bypass de FOV ATIVADO: Cheat tenta forçar pacote de visibilidade. Anti-ESP valida voxels e neutraliza.'
      : 'Teste de Bypass de FOV DESATIVADO'
  );
}
