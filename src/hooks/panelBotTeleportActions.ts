import * as THREE from 'three';
import { GameEngine } from '../game/gameEngine';

/**
 * Teleporta o bot para trás da parede da base para teste de oclusão.
 */
export function handleTeleportBotBehindWallAction(
  engine: GameEngine | null,
  setLastLog: (s: string) => void
): void {
  if (!engine || !engine.bot) {
    setLastLog('Nenhum Bot ativo. Entre na Arena de Testes primeiro!');
    return;
  }
  const targetPos = new THREE.Vector3(4, 10.5, -24);
  engine.bot.teleport(targetPos);
  setLastLog(
    `Bot posicionado atrás da parede da base (${targetPos.x}, ${targetPos.y}, ${targetPos.z})`
  );
}

/**
 * Teleporta o bot para 3 metros na frente do jogador (dentro do buffer <5m).
 */
export function handleTeleportBotNearPlayerAction(
  engine: GameEngine | null,
  setLastLog: (s: string) => void
): void {
  if (!engine || !engine.bot) {
    setLastLog('Nenhum Bot ativo. Entre na Arena de Testes primeiro!');
    return;
  }
  const yaw = engine.player.yaw;
  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  ).normalize();
  const targetPos = new THREE.Vector3(
    engine.player.position.x + forward.x * 3.0,
    engine.player.position.y,
    engine.player.position.z + forward.z * 3.0
  );
  engine.bot.teleport(targetPos);
  setLastLog(
    'Bot teleportado para 3.0m na sua frente (Dentro do Buffer <5m)'
  );
}

/**
 * Teleporta o bot para o centro da arena.
 */
export function handleTeleportBotToCenterAction(
  engine: GameEngine | null,
  setLastLog: (s: string) => void
): void {
  if (!engine || !engine.bot) {
    setLastLog('Nenhum Bot ativo. Entre na Arena de Testes primeiro!');
    return;
  }
  const targetPos = new THREE.Vector3(0, 12.5, 0);
  engine.bot.teleport(targetPos);
  setLastLog('Bot teleportado para o Centro da Arena (0, 12.5, 0)');
}
