import * as THREE from 'three';
import { InteractionContext } from './interactionHandler';
import { sounds } from '../audio/soundManager';

interface ActivePearl {
  group: THREE.Group;
  sprite: THREE.Sprite;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifeTime: number;
  trailTimer: number;
}

const activePearls: ActivePearl[] = [];

let pearlTexture: THREE.Texture | null = null;
function getPearlTexture(): THREE.Texture {
  if (!pearlTexture) {
    pearlTexture = new THREE.TextureLoader().load('/textures/items/ender_pearl.png');
    pearlTexture.magFilter = THREE.NearestFilter;
    pearlTexture.minFilter = THREE.NearestFilter;
  }
  return pearlTexture;
}

/**
 * Launches an authentic Minecraft Ender Pearl projectile:
 * - Spawns at player eye position
 * - Initial speed 26 m/s with momentum inheritance
 * - Realistic Minecraft trajectory (gravity + drag)
 * - Emits purple portal particle trail
 * - Bursts particles and teleports upon impact
 * - Deals 5 HP (2.5 hearts) damage upon landing
 */
export function launchEnderPearl(ctx: InteractionContext): boolean {
  const dir = new THREE.Vector3();
  ctx.camera.getWorldDirection(dir);

  // Spawn near player's eyes, slightly forward
  const origin = ctx.player.position.clone().add(new THREE.Vector3(0, 1.45, 0)).addScaledVector(dir, 0.35);

  // Minecraft throw speed ~ 26 m/s (approx 1.3 blocks/tick)
  const speed = 26.0;
  const velocity = dir.clone().multiplyScalar(speed);

  // Inherit player's horizontal momentum
  velocity.x += ctx.player.velocity.x * 0.25;
  velocity.z += ctx.player.velocity.z * 0.25;

  const texture = getPearlTexture();
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    depthTest: true,
    depthWrite: false,
    transparent: true
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.38, 0.38, 0.38);

  const group = new THREE.Group();
  group.position.copy(origin);
  group.add(sprite);

  // Add a soft ender glow
  const glowLight = new THREE.PointLight(0xa855f7, 0.8, 3.5);
  group.add(glowLight);

  // Add to scene
  const targetScene = ctx.scene || (ctx.camera.parent as THREE.Scene | null);
  if (targetScene) {
    targetScene.add(group);
  }

  activePearls.push({
    group,
    sprite,
    position: origin.clone(),
    velocity,
    lifeTime: 0,
    trailTimer: 0
  });

  // Play authentic throw whoosh sound
  sounds.playThrow();

  // Notify server of legitimate pearl throw for authoritative tracking
  ctx.network?.send('pearl:throw', {
    origin: { x: origin.x, y: origin.y, z: origin.z },
    dir: { x: dir.x, y: dir.y, z: dir.z }
  });

  // Trigger arm swing
  ctx.getHand?.()?.swing();

  return true;
}

/**
 * Updates all active flying Ender Pearls each frame.
 */
export function updateEnderPearls(delta: number, ctx: InteractionContext) {
  if (activePearls.length === 0) return;

  const GRAVITY = 13.5; // m/s^2 (close to vanilla Minecraft's 0.03 blocks/tick^2)
  const DRAG = 0.99;    // per 1/20 second tick
  const dragFactor = Math.pow(DRAG, delta * 20);

  for (let i = activePearls.length - 1; i >= 0; i--) {
    const pearl = activePearls[i];
    if (!pearl) continue;

    pearl.lifeTime += delta;

    // Remove if expired or fallen too deep into the void
    if (pearl.lifeTime > 8.0 || pearl.position.y < -18.0) {
      if (activePearls[i] === pearl) {
        removePearl(i);
      }
      continue;
    }

    // Trailing purple portal particles
    pearl.trailTimer += delta;
    if (pearl.trailTimer >= 0.035) {
      pearl.trailTimer = 0;
      ctx.particles.spawnPortalParticles(pearl.position, 2, 0.25);
    }

    // Spin the sprite during flight
    pearl.sprite.material.rotation += delta * 14;

    // Apply gravity and drag
    pearl.velocity.y -= GRAVITY * delta;
    pearl.velocity.x *= dragFactor;
    pearl.velocity.z *= dragFactor;

    // Calculate displacement for this frame
    const step = pearl.velocity.clone().multiplyScalar(delta);
    const dist = step.length();
    // Substep in ~4cm increments to completely prevent tunneling through blocks
    const substeps = Math.max(1, Math.ceil(dist / 0.04));
    const subVec = step.clone().divideScalar(substeps);

    let collided = false;
    let hitPos = pearl.position.clone();
    const hitNormal = new THREE.Vector3(0, 1, 0);

    // If pearl starts already inside a solid block, trigger collision immediately
    const startBx = Math.round(pearl.position.x);
    const startBy = Math.round(pearl.position.y);
    const startBz = Math.round(pearl.position.z);
    if (ctx.world.isSolid(startBx, startBy, startBz)) {
      collided = true;
      hitNormal.set(0, 1, 0);
      hitPos.copy(pearl.position);
    } else {
      for (let s = 1; s <= substeps; s++) {
        const checkPos = pearl.position.clone().addScaledVector(subVec, s);
        const bx = Math.round(checkPos.x);
        const by = Math.round(checkPos.y);
        const bz = Math.round(checkPos.z);

        if (ctx.world.isSolid(bx, by, bz)) {
          collided = true;
          const prevPos = pearl.position.clone().addScaledVector(subVec, s - 1);
          const pbx = Math.round(prevPos.x);
          const pby = Math.round(prevPos.y);
          const pbz = Math.round(prevPos.z);

          hitNormal.set(pbx - bx, pby - by, pbz - bz);
          if (hitNormal.lengthSq() === 0) {
            hitNormal.set(0, 1, 0);
          } else {
            hitNormal.normalize();
          }

          hitPos.copy(checkPos);
          break;
        }
      }
    }

    if (collided) {
      // 1. Burst portal particles at the impact point
      ctx.particles.spawnPortalParticles(hitPos, 32, 1.3);

      // 2. Play teleport sound
      sounds.playTeleport();

      // 3. Compute exact landing coordinates according to collision normal
      let finalY: number;
      let targetX = hitPos.x + hitNormal.x * 0.38;
      let targetZ = hitPos.z + hitNormal.z * 0.38;

      if (hitNormal.y < -0.3) {
        // Hit underside of block / base: teleport directly underneath without ascending to the roof
        const blockBottom = Math.round(hitPos.y) - 0.5;
        finalY = blockBottom - 1.85;
      } else if (hitNormal.y > 0.5) {
        // Hit top surface of block: place feet smoothly on the block surface
        const blockTop = Math.round(hitPos.y) + 0.5;
        finalY = blockTop;
      } else {
        // Hit vertical wall: offset player away from the wall along the normal
        targetX = hitPos.x + hitNormal.x * 0.45;
        targetZ = hitPos.z + hitNormal.z * 0.45;
        finalY = hitPos.y - 0.9;
        // If feet are slightly intersecting a block, push outward further into open air
        for (let push = 0; push < 3; push++) {
          const bx = Math.round(targetX);
          const by = Math.round(finalY);
          const bz = Math.round(targetZ);
          if (ctx.world.isSolid(bx, by, bz) || ctx.world.isSolid(bx, by + 1, bz)) {
            targetX += hitNormal.x * 0.25;
            targetZ += hitNormal.z * 0.25;
          } else {
            break;
          }
        }
      }

      // 4. Teleport player and notify anti-cheat and server of authoritative pearl landing
      const landingPos = new THREE.Vector3(targetX, finalY, targetZ);
      ctx.player.teleport(landingPos, ctx.player.yaw, ctx.player.pitch);
      ctx.antiCheat?.notifyTeleport(landingPos);
      ctx.network?.send('pearl:land', { pos: { x: landingPos.x, y: landingPos.y, z: landingPos.z } });
      ctx.network?.sendMove(
        { x: landingPos.x, y: landingPos.y, z: landingPos.z },
        ctx.player.yaw,
        undefined,
        true,
        delta,
        { x: 0, y: 0, z: 0 },
        true
      );

      // 5. Spawn portal arrival particles around player
      ctx.particles.spawnPortalParticles(ctx.player.position, 20, 0.8);

      // 6. Deal 5 HP (2.5 hearts) damage like original Minecraft
      ctx.onDamagePlayer?.(5);

      // 7. Remove pearl entity safely
      if (activePearls[i] === pearl) {
        removePearl(i);
      }
    } else {
      pearl.position.add(step);
      pearl.group.position.copy(pearl.position);
    }
  }
}

function removePearl(index: number) {
  const pearl = activePearls[index];
  if (!pearl) return;

  if (pearl.group.parent) {
    pearl.group.parent.remove(pearl.group);
  }
  pearl.sprite.material.dispose();

  activePearls.splice(index, 1);
}

/**
 * Removes all active pearls (e.g. on match end or respawn)
 */
export function clearEnderPearls() {
  while (activePearls.length > 0) {
    removePearl(0);
  }
}

/**
 * Compatibility wrapper for executeEnderPearlTeleport
 */
export function executeEnderPearlTeleport(ctx: InteractionContext): boolean {
  return launchEnderPearl(ctx);
}
