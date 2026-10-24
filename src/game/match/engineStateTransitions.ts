import * as THREE from 'three';
import { GameEngine } from '../gameEngine';
import { Team } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { setupMenuEnvironment } from '../world/menuScene';
import { buildLobbyWorld } from '../world/lobbyBuilder';
import { buildBedWarsArena } from '../world/arenaBuilder';
import { createCharacterModel } from '../graphics/characterModel';
import { BotOpponent } from '../entities/botOpponent';

export function clearEngineScene(engine: GameEngine) {
  engine.interaction.stopBreak();
  engine.particles.clear();
  engine.world.clear();
  engine.resources.clear();
  engine.npcs.clear();
  if (engine.opponentMesh) {
    engine.scene.remove(engine.opponentMesh);
    engine.opponentMesh = null;
  }
  engine.bot = null;
  while (engine.scene.children.length > 0) engine.scene.remove(engine.scene.children[0]);
  engine.scene.add(engine.world.blockMeshGroup);
  engine.visualizer.attachToScene(engine.scene);
  engine.scene.add(engine.camera);
}

export function startEngineMenu(engine: GameEngine) {
  engine.state = 'menu';
  clearEngineScene(engine);
  setupMenuEnvironment(engine.scene, engine.world);
}

export function enterEngineLobby(engine: GameEngine) {
  sounds.playClick();
  engine.state = 'lobby';
  engine.hotbar = [];
  engine.selectedSlot = 0;
  engine.inventory = { iron: 0, gold: 0, diamond: 0, emerald: 0 };
  clearEngineScene(engine);
  buildLobbyWorld(engine.scene, engine.world);
  engine.npcs.setupLobbyNPCs();
  engine.network.leaveMatch();
  engine.player.teleport(new THREE.Vector3(0, 1, 8), Math.PI);
  engine.onSyncUI?.();
}

export function startEngineMatch(engine: GameEngine, roomId: string, myTeam: Team, opponentName: string) {
  sounds.playClick();
  engine.state = 'match';
  clearEngineScene(engine);
  engine.arenaLocs = buildBedWarsArena(engine.scene, engine.world);
  engine.resources.setLocations(engine.arenaLocs);
  engine.match.initMatch(roomId, myTeam, opponentName);
  engine.resetMatchLoadout();
  const spawn = myTeam === 'red' ? engine.arenaLocs.redSpawn : engine.arenaLocs.blueSpawn;
  const oppSpawn = myTeam === 'red' ? engine.arenaLocs.blueSpawn : engine.arenaLocs.redSpawn;
  engine.network.sendMatchStart(roomId, { x: spawn.x, y: spawn.y, z: spawn.z });
  engine.player.teleport(spawn, myTeam === 'red' ? 0 : Math.PI);

  const oppShirt = myTeam === 'red' ? 0x2563eb : 0xdc2626;
  engine.opponentMesh = createCharacterModel(oppShirt, 0x1e293b, opponentName);
  engine.opponentMesh.position.copy(oppSpawn);
  engine.scene.add(engine.opponentMesh);

  engine.npcs.setupArenaNPCs(
    engine.arenaLocs.redShopPos,
    engine.arenaLocs.blueShopPos,
    engine.arenaLocs.redUpgradePos,
    engine.arenaLocs.blueUpgradePos
  );
  const isTestArena = roomId.startsWith('test_arena_');
  const isPractice = roomId.startsWith('practice_');
  engine.bot = (isTestArena || isPractice) ? new BotOpponent(engine.opponentMesh, isTestArena) : null;
  engine.onSyncUI?.();
}
