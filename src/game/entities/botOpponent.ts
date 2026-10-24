import * as THREE from 'three';
import { CharacterMesh } from '../graphics/characterModel';
import { VoxelWorld } from '../world/voxelWorld';
import { BlockType } from '../../types/game';

export type BotControlMode = 'idle' | 'follow' | 'patrol' | 'behind_wall' | 'bridge';

export class BotOpponent {
  public model: CharacterMesh;
  public position = new THREE.Vector3(0, 10.5, -21);
  public health = 20;
  public isAlive = true;
  public isTestBot = false;
  public mode: BotControlMode = 'bridge';
  public attackEnabled = true;
  private bridgeTimer = 0;
  private attackTimer = 0;
  private bridgeIndex = 0;
  private patrolBase = new THREE.Vector3(0, 10.5, -21);

  constructor(model: CharacterMesh, isTestBot = false) {
    this.model = model;
    this.isTestBot = isTestBot;
    if (isTestBot) {
      this.mode = 'behind_wall';
      this.attackEnabled = false;
      this.position.set(4, 10.5, -24); // Posicionado firmemente no chão atrás da parede da base
    }
    this.model.position.copy(this.position);
    this.patrolBase.copy(this.position);
  }

  public setMode(mode: BotControlMode) {
    this.mode = mode;
    if (mode === 'behind_wall') {
      this.position.set(4, 10.5, -24);
      this.model.position.copy(this.position);
    } else if (mode === 'patrol') {
      this.patrolBase.copy(this.position);
    }
  }

  public toggleAttack(enabled?: boolean) {
    this.attackEnabled = enabled !== undefined ? enabled : !this.attackEnabled;
  }

  public teleport(pos: THREE.Vector3) {
    this.position.copy(pos);
    this.model.position.copy(pos);
    this.patrolBase.copy(pos);
  }

  public update(delta: number, time: number, playerPos: THREE.Vector3, world: VoxelWorld, onHitPlayer?: (damage: number) => void) {
    if (!this.isAlive) {
      this.model.visible = false;
      return;
    }

    let isMoving = false;

    if (this.mode === 'bridge') {
      // Bridge building progression towards center and player island
      this.bridgeTimer += delta;
      if (this.bridgeTimer > 2.0 && this.bridgeIndex < 20) {
        this.bridgeTimer = 0;
        this.bridgeIndex++;
        const z = -16 + this.bridgeIndex;
        world.setBlock(0, 11, z, BlockType.BLUE_WOOL);
        this.position.set(0, 11.5, z);
      }
      isMoving = this.bridgeIndex < 18;
    } else if (this.mode === 'follow') {
      // Walk towards player
      const dir = new THREE.Vector3().subVectors(playerPos, this.position);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 1.8) {
        dir.normalize();
        this.position.addScaledVector(dir, delta * 3.5);
        isMoving = true;
      }
    } else if (this.mode === 'patrol') {
      // Patrol horizontally
      const offset = Math.sin(time * 2) * 3;
      this.position.x = this.patrolBase.x + offset;
      isMoving = true;
    } else if (this.mode === 'behind_wall' || this.mode === 'idle') {
      // Stay stationary
      isMoving = false;
    }

    // Snap bot to ground surface (solid block top = blockY + 0.5)
    const bx = Math.round(this.position.x);
    const bz = Math.round(this.position.z);
    for (let checkY = 25; checkY >= -5; checkY--) {
      const b = world.getBlock(bx, checkY, bz);
      if (b !== BlockType.AIR) {
        this.position.y = checkY + 0.5;
        break;
      }
    }

    // Look at player
    const targetAngle = Math.atan2(playerPos.x - this.position.x, playerPos.z - this.position.z);
    this.model.rotation.y = targetAngle;
    this.model.position.copy(this.position);

    // Combat check
    const distToPlayer = this.position.distanceTo(playerPos);
    this.attackTimer += delta;
    if (this.attackEnabled && distToPlayer < 2.5 && this.attackTimer > 1.2) {
      this.attackTimer = 0;
      this.model.updateAnimation(time, false, 12);
      onHitPlayer?.(4);
    } else {
      this.model.updateAnimation(time, isMoving, 8);
    }
  }

  public takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    this.health -= amount;
    this.position.add(knockbackDir.clone().multiplyScalar(1.2));
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  public respawn(spawnPos: THREE.Vector3) {
    this.isAlive = true;
    this.health = 20;
    this.position.copy(spawnPos);
    this.model.position.copy(spawnPos);
  }
}
