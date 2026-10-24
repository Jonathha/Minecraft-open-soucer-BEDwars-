import * as THREE from 'three';
import { GameEngine } from './gameEngine';
import { MatchManager } from './match/matchManager';
import { InteractionHandler } from './player/interactionHandler';
import { NetworkClient } from './network/networkClient';

export function createEngineMatchManager(engine: GameEngine): MatchManager {
  return new MatchManager(
    engine.player,
    () => engine.arenaLocs,
    () => { engine.state = 'ended'; },
    () => engine.onSyncUI?.(),
    () => {
      engine.resetMatchLoadout();
      const spawn = engine.match.matchInfo.myTeam === 'red' ? engine.arenaLocs?.redSpawn : engine.arenaLocs?.blueSpawn;
      if (spawn) engine.network?.sendRespawn({ x: spawn.x, y: spawn.y, z: spawn.z });
    },
    () => {
      engine.interaction?.clearPendingPlacements();
      engine.network?.sendDeath();
    }
  );
}

export function createEngineInteractionHandler(engine: GameEngine): InteractionHandler {
  return new InteractionHandler({
    camera: engine.camera,
    world: engine.world,
    npcs: engine.npcs,
    player: engine.player,
    network: null as unknown as NetworkClient,
    visualizer: engine.visualizer,
    particles: engine.particles,
    antiCheat: engine.antiCheat,
    getHotbar: () => engine.hotbar,
    getSelectedSlot: () => engine.selectedSlot,
    getState: () => engine.state,
    getMatchInfo: () => engine.match.matchInfo,
    getArenaLocs: () => engine.arenaLocs,
    getOpponentMesh: () => engine.opponentMesh,
    getBot: () => engine.bot,
    onStartTestArena: () => engine.startMatch('test_arena_' + Date.now(), 'red', 'Bot de Teste'),
    onOpenShop: (t) => engine.onOpenShop?.(t),
    onBedDestroyed: (tm) => engine.match.handleBedDestroyed(tm),
    onOpponentDeath: () => engine.match.handleOpponentDeath(engine.bot),
    onHealPlayer: (amt) => { engine.match.health = Math.min(20, engine.match.health + amt); engine.onSyncUI?.(); },
    onDamagePlayer: (amt) => {
      engine.match.takeDamage(amt, new THREE.Vector3());
      engine.onSyncUI?.();
    },
    onSyncUI: () => engine.onSyncUI?.(),
    getHand: () => engine.firstPersonHand,
    scene: engine.scene
  });
}
