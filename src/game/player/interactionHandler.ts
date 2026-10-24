import * as THREE from 'three';
import { BlockType, GameState, HotbarItem, MatchInfo, Team } from '../../types/game';
import { NPCManager } from '../entities/npcManager';
import { CharacterMesh } from '../graphics/characterModel';
import { BotOpponent } from '../entities/botOpponent';
import { NetworkClient } from '../network/networkClient';
import { VoxelWorld } from '../world/voxelWorld';
import { PlayerController } from './playerController';
import { BlockBreakVisualizer } from '../graphics/destroyStages';
import { BlockParticleManager } from '../graphics/blockParticles';
import { ArenaLocations } from '../world/arenaBuilder';
import { AntiCheatEngine } from '../anticheat/antiCheatEngine';
import { MiningManager } from './miningManager';
import { PlacementManager } from './placementManager';
import { updateEnderPearls, clearEnderPearls } from './enderPearlAction';

export interface InteractionContext {
  camera: THREE.PerspectiveCamera;
  world: VoxelWorld;
  npcs: NPCManager;
  player: PlayerController;
  network: NetworkClient;
  visualizer: BlockBreakVisualizer;
  particles: BlockParticleManager;
  antiCheat?: AntiCheatEngine;
  getHotbar: () => (HotbarItem | null)[];
  getSelectedSlot: () => number;
  getState: () => GameState;
  getMatchInfo: () => MatchInfo;
  getArenaLocs: () => ArenaLocations | null;
  getOpponentMesh: () => CharacterMesh | null;
  getBot: () => BotOpponent | null;
  onStartTestArena?: () => void;
  onOpenShop?: (shopType: 'item_shop' | 'upgrade_shop') => void;
  onBedDestroyed: (team: Team, by: Team) => void;
  onOpponentDeath: () => void;
  onHealPlayer?: (amount: number) => void;
  onDamagePlayer?: (amount: number) => void;
  onSyncUI?: () => void;
  getHand?: () => any;
  scene?: THREE.Scene;
}

export class InteractionHandler {
  public ctx: InteractionContext;
  private mining: MiningManager;
  private placement: PlacementManager;

  constructor(ctx: InteractionContext) {
    this.ctx = ctx;
    this.mining = new MiningManager(ctx);
    this.placement = new PlacementManager(ctx);
  }

  public startBreak() {
    this.mining.startBreak();
    this.ctx.getHand?.()?.swing();
  }

  public stopBreak() {
    this.mining.stopBreak();
  }

  public handleAttackOrBreak() {
    this.mining.startBreak();
    this.ctx.getHand?.()?.swing();
  }

  public startPlace() {
    this.placement.startPlace();
  }

  public stopPlace() {
    this.placement.stopPlace();
  }

  public handlePlaceBlock(): boolean {
    const placed = this.placement.executePlace();
    if (placed) {
      this.ctx.getHand?.()?.swing();
    }
    return placed;
  }

  public confirmPlacement(x: number, y: number, z: number) {
    this.placement.confirmPlacement(x, y, z);
  }

  public rejectPlacement(x: number, y: number, z: number) {
    this.placement.rejectPlacement(x, y, z);
  }

  public clearPendingPlacements() {
    this.placement.clearPending();
    clearEnderPearls();
  }

  public update(delta: number) {
    this.mining.update(delta);
    this.placement.update(delta);
    updateEnderPearls(delta, this.ctx);
  }
}
