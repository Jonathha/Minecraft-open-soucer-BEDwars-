import { GameEngine } from '../game/gameEngine';
import { BotControlMode } from '../game/entities/botOpponent';

/**
 * Altera o modo de comportamento da inteligência artificial do Bot.
 */
export function handleSetBotModeAction(
  engine: GameEngine | null,
  mode: BotControlMode,
  setBotMode: (m: BotControlMode) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine || !engine.bot) {
    setLastLog('Nenhum Bot ativo na partida atual.');
    return;
  }
  setBotMode(mode);
  engine.bot.setMode(mode);
  const labels: Record<BotControlMode, string> = {
    idle: 'Parado (Freeze)',
    behind_wall: 'Atrás da Parede',
    follow: 'Seguir Jogador',
    patrol: 'Patrulhar',
    bridge: 'Fazer Ponte',
  };
  setLastLog(`Modo do Bot alterado para: ${labels[mode]}`);
}

/**
 * Alterna se o bot atacará o jogador ou ficará no modo pacífico.
 */
export function handleToggleBotAttackAction(
  engine: GameEngine | null,
  botAttack: boolean,
  setBotAttack: (v: boolean) => void,
  setLastLog: (s: string) => void
): void {
  if (!engine || !engine.bot) {
    setLastLog('Nenhum Bot ativo.');
    return;
  }
  const next = !botAttack;
  setBotAttack(next);
  engine.bot.toggleAttack(next);
  setLastLog(
    next
      ? 'Ataque do Bot ATIVADO'
      : 'Ataque do Bot DESATIVADO (Modo Pacífico)'
  );
}

/**
 * Inicia uma partida rápida na arena de testes com o bot.
 */
export function handleEnterTestArenaAction(
  engine: GameEngine | null,
  setLastLog: (s: string) => void
): void {
  if (!engine) return;
  engine.startMatch('test_arena_' + Date.now(), 'red', 'Bot de Teste');
  setLastLog(
    'Entrou na Arena de Testes com Bot configurável e ESP/Anti-ESP!'
  );
}
