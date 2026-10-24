import * as THREE from 'three';
import { HotbarItem } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { canPlaceBlock } from './blockRules';
import { findBridgePlacement } from './bridgeHelper';
import { InteractionContext } from './interactionHandler';
import { PlacementPredictionTracker } from './placementPredictionTracker';
import { evaluateAndSendBlockPlacement } from './placementExecutionHelper';
import { executeEnderPearlTeleport } from './enderPearlAction';

export class PlacementManager {
  private ctx: InteractionContext;
  private raycaster = new THREE.Raycaster();
  public isPlacing = false;
  private placeCooldown = 0;
  private readonly INITIAL_PLACE_DELAY = 0.28;
  private readonly REPEAT_INTERVAL = 0.20;
  private tracker: PlacementPredictionTracker;
  private recentPlaced: Array<{ x: number; y: number; z: number; timestamp: number }> = [];

  constructor(ctx: InteractionContext) {
    this.ctx = ctx;
    this.tracker = new PlacementPredictionTracker(ctx);
  }

  public confirmPlacement(x: number, y: number, z: number) { this.tracker.confirmPlacement(x, y, z); }
  public rejectPlacement(x: number, y: number, z: number) { this.tracker.rejectPlacement(x, y, z); }
  public isPlacementPending(x: number, y: number, z: number): boolean { return this.tracker.isPlacementPending(x, y, z); }
  public clearPending() {
    this.tracker.clearPending();
    this.recentPlaced = [];
  }

  public startPlace() {
    this.isPlacing = true;
    this.executePlace();
    this.placeCooldown = this.INITIAL_PLACE_DELAY;
  }

  public stopPlace() {
    this.isPlacing = false;
    this.placeCooldown = 0;
  }

  public update(delta: number) {
    if (!this.isPlacing) return;
    this.placeCooldown -= delta;
    if (this.placeCooldown <= 0) {
      this.executePlace();
      this.placeCooldown = this.REPEAT_INTERVAL;
    }
  }

  public executePlace(): boolean {
    this.ctx.camera.updateMatrixWorld(true);
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.ctx.camera);
    const state = this.ctx.getState();

    const npcHit = this.ctx.npcs.checkInteraction(this.raycaster);
    if (npcHit === 'bedwars_1v1' && state === 'lobby') {
      sounds.playClick();
      this.ctx.network.joinQueue('Jogador');
      return true;
    }
    if ((npcHit === 'item_shop' || npcHit === 'upgrade_shop') && state === 'match') {
      sounds.playClick();
      this.ctx.onOpenShop?.(npcHit);
      return true;
    }

    if (state !== 'match') return false;

    const hotbar = this.ctx.getHotbar();
    const slot = this.ctx.getSelectedSlot();
    const currentItem = hotbar[slot];
    if (!currentItem || currentItem.count <= 0) return false;

    if (currentItem.id === 'golden_apple') {
      sounds.playPickup();
      this.ctx.onHealPlayer?.(8);
      this.consumeItem(hotbar, slot, currentItem);
      return true;
    }

    if (currentItem.id === 'ender_pearl') {
      const teleported = executeEnderPearlTeleport(this.ctx);
      if (teleported) {
        this.consumeItem(hotbar, slot, currentItem);
        return true;
      }
    }

    if (currentItem.type !== 'block') return false;
    if (!this.ctx.network.isConnected) return false;

    const isSneaking = this.ctx.player.isSneaking || this.ctx.player.keys.sneak;
    const target = findBridgePlacement(
      this.raycaster,
      this.ctx.world,
      5.2,
      this.ctx.player.position,
      isSneaking
    );
    if (!target) return false;

    const pp = target.placePos;
    if (this.ctx.world.isSolid(pp.x, pp.y, pp.z)) return false;
    if (!canPlaceBlock(state, pp, this.ctx.getArenaLocs(), this.ctx.player.position)) return false;

    const success = evaluateAndSendBlockPlacement(this.ctx, target, currentItem, this.tracker);
    if (!success) return false;

    this.recentPlaced.push({ x: pp.x, y: pp.y, z: pp.z, timestamp: Date.now() });
    if (this.recentPlaced.length > 50) this.recentPlaced.shift();

    sounds.playBlockPlace();
    this.consumeItem(hotbar, slot, currentItem);
    return true;
  }

  private consumeItem(hotbar: (HotbarItem | null)[], slot: number, item: HotbarItem) {
    item.count--;
    if (item.count <= 0) hotbar[slot] = null;
    this.ctx.onSyncUI?.();
  }
}
