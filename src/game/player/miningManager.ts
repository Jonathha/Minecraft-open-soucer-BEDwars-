import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { canBreakBlock, getBlockHardness } from './blockRules';
import { InteractionContext } from './interactionHandler';
import { handleNpcAndCombatInteractions } from './combatNpcInteractions';
import { handleBedBreakEvent } from './bedBreakHelper';

export class MiningManager {
  private ctx: InteractionContext;
  private raycaster = new THREE.Raycaster();
  public isMining = false;
  public miningBlockPos: THREE.Vector3 | null = null;
  public miningBlockType: BlockType | null = null;
  public miningFaceNormal = new THREE.Vector3(0, 1, 0);
  public miningProgress = 0;
  private hitSoundTimer = 0;

  constructor(ctx: InteractionContext) {
    this.ctx = ctx;
  }

  public startBreak() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.ctx.camera);
    if (handleNpcAndCombatInteractions(this.ctx, this.raycaster)) return;

    const state = this.ctx.getState();
    if (state !== 'match') return;
    const hit = this.ctx.world.raycast(this.raycaster, 5);
    if (hit) {
      const myTeam = this.ctx.getMatchInfo().myTeam;
      if (!canBreakBlock(state, hit.type, hit.blockPos, this.ctx.world, myTeam)) return;

      this.isMining = true;
      this.miningBlockPos = hit.blockPos.clone();
      this.miningBlockType = hit.type;
      this.miningFaceNormal = hit.normal.clone();
      this.miningProgress = 0;
      this.hitSoundTimer = 0.2;
      const isBed = this.miningBlockType === BlockType.BED_RED || this.miningBlockType === BlockType.BED_BLUE;
      this.ctx.visualizer.setStage(this.miningBlockPos.x, this.miningBlockPos.y, this.miningBlockPos.z, 0);
      sounds.playBlockHit();
      this.ctx.particles.spawnMiningHitParticles(this.miningBlockPos, this.miningFaceNormal, this.miningBlockType);
    }
  }

  public stopBreak() {
    this.isMining = false;
    this.miningBlockPos = null;
    this.miningBlockType = null;
    this.miningProgress = 0;
    this.ctx.visualizer.hide();
  }

  public update(delta: number) {
    if (!this.isMining || !this.miningBlockPos || this.miningBlockType === null) return;
    const state = this.ctx.getState();
    const myTeam = this.ctx.getMatchInfo().myTeam;
    if (!canBreakBlock(state, this.miningBlockType, this.miningBlockPos, this.ctx.world, myTeam)) {
      this.stopBreak();
      return;
    }

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.ctx.camera);
    const hit = this.ctx.world.raycast(this.raycaster, 5);
    if (!hit || hit.blockPos.x !== this.miningBlockPos.x || hit.blockPos.y !== this.miningBlockPos.y || hit.blockPos.z !== this.miningBlockPos.z) {
      if (hit && canBreakBlock(state, hit.type, hit.blockPos, this.ctx.world, myTeam)) {
        this.miningBlockPos = hit.blockPos.clone();
        this.miningBlockType = hit.type;
        this.miningFaceNormal = hit.normal.clone();
        this.miningProgress = 0;
        const isBed = this.miningBlockType === BlockType.BED_RED || this.miningBlockType === BlockType.BED_BLUE;
        this.ctx.visualizer.setStage(this.miningBlockPos.x, this.miningBlockPos.y, this.miningBlockPos.z, 0);
        sounds.playBlockHit();
        this.ctx.particles.spawnMiningHitParticles(this.miningBlockPos, this.miningFaceNormal, this.miningBlockType);
      } else {
        this.stopBreak();
      }
      return;
    }

    const hardness = getBlockHardness(this.miningBlockType, this.ctx.getHotbar()[this.ctx.getSelectedSlot()] ?? undefined);
    this.miningProgress += delta / hardness;

    // Keep swinging hand or pickaxe continuously while destroying block
    const hand = this.ctx.getHand?.();
    if (hand && !hand.isSwinging) {
      hand.swing();
    }

    this.hitSoundTimer -= delta;
    if (this.hitSoundTimer <= 0) {
      this.hitSoundTimer = 0.18;
      sounds.playBlockHit();
      this.ctx.particles.spawnMiningHitParticles(this.miningBlockPos, this.miningFaceNormal, this.miningBlockType);
    }

    const stage = Math.min(9, Math.floor(this.miningProgress * 10));
    const isBed = this.miningBlockType === BlockType.BED_RED || this.miningBlockType === BlockType.BED_BLUE;
    this.ctx.visualizer.setStage(this.miningBlockPos.x, this.miningBlockPos.y, this.miningBlockPos.z, stage);

    if (this.miningProgress >= 1.0) {
      this.finishBlockBreak();
    }
  }

  private finishBlockBreak() {
    if (!this.miningBlockPos || this.miningBlockType === null) return;
    const bp = this.miningBlockPos.clone();
    const brokenType = this.miningBlockType;

    sounds.playBlockBreak();
    this.ctx.particles.spawnBreakExplosion(bp, brokenType);
    this.ctx.world.removeBlock(bp.x, bp.y, bp.z);
    this.ctx.network.sendBlockBreak({ x: bp.x, y: bp.y, z: bp.z });

    if (brokenType === BlockType.BED_RED || brokenType === BlockType.BED_BLUE) {
      handleBedBreakEvent(this.ctx, bp, brokenType);
    }
    this.stopBreak();
  }
}
