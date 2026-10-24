import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { Particle, getParticleColor } from './particleTypes';

export { type Particle } from './particleTypes';

export class BlockParticleManager {
  private particles: Particle[] = [];
  private group = new THREE.Group();
  private scene: THREE.Scene;
  private geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.group);
  }

  public spawnBreakParticles(x: number, y: number, z: number, blockType: BlockType, count = 16) {
    const color = getParticleColor(blockType);
    const material = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.set(
        x + 0.5 + (Math.random() - 0.5) * 0.8,
        y + 0.5 + (Math.random() - 0.5) * 0.8,
        z + 0.5 + (Math.random() - 0.5) * 0.8
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 3.5 + 1.0,
        (Math.random() - 0.5) * 3.5
      );

      const life = 0.35 + Math.random() * 0.25;
      this.particles.push({ mesh, velocity, life, maxLife: life });
      this.group.add(mesh);
    }
  }

  public spawnBreakExplosion(posOrX: THREE.Vector3 | number, yOrType?: number, z?: number, blockType?: BlockType) {
    if (typeof posOrX === 'object') {
      this.spawnBreakParticles(posOrX.x, posOrX.y, posOrX.z, (yOrType as BlockType) || BlockType.WHITE_WOOL, 24);
    } else {
      this.spawnBreakParticles(posOrX, yOrType || 0, z || 0, blockType || BlockType.WHITE_WOOL, 24);
    }
  }

  public spawnMiningHitParticles(posOrX: THREE.Vector3 | number, yOrNormalOrType?: THREE.Vector3 | number, zOrType?: number, blockType?: BlockType) {
    if (typeof posOrX === 'object') {
      const type = typeof zOrType === 'number' ? zOrType : (typeof yOrNormalOrType === 'number' ? yOrNormalOrType : BlockType.WHITE_WOOL);
      this.spawnBreakParticles(posOrX.x, posOrX.y, posOrX.z, type as BlockType, 4);
    } else {
      this.spawnBreakParticles(posOrX, yOrNormalOrType as number || 0, zOrType || 0, blockType || BlockType.WHITE_WOOL, 4);
    }
  }

  public spawnPortalParticles(pos: THREE.Vector3, count = 16, speedScale = 1.0) {
    const PORTAL_COLORS = [0x9333ea, 0xa855f7, 0x7e22ce, 0xc084fc, 0xd946ef, 0x06b6d4];
    for (let i = 0; i < count; i++) {
      const color = PORTAL_COLORS[Math.floor(Math.random() * PORTAL_COLORS.length)];
      const material = new THREE.MeshBasicMaterial({ color });
      const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mesh = new THREE.Mesh(geom, material);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.2,
        pos.y + (Math.random() - 0.5) * 0.2,
        pos.z + (Math.random() - 0.5) * 0.2
      );
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5 * speedScale,
        (Math.random() - 0.15) * 3.5 * speedScale,
        (Math.random() - 0.5) * 3.5 * speedScale
      );
      const life = 0.25 + Math.random() * 0.3;
      this.particles.push({ mesh, velocity, life, maxLife: life });
      this.group.add(mesh);
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.group.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.velocity.y -= 14 * delta; // Gravity
      p.mesh.position.addScaledVector(p.velocity, delta);
      p.mesh.rotation.x += delta * 5;
      p.mesh.rotation.y += delta * 5;

      const scale = p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  public clear() {
    for (const p of this.particles) {
      this.group.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }

  public destroy() {
    this.clear();
    this.geometry.dispose();
    this.scene.remove(this.group);
  }
}
