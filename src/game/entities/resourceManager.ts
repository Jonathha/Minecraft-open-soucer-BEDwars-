import * as THREE from 'three';
import { ResourceCounts, ResourceType } from '../../types/game';
import { sounds } from '../audio/soundManager';
import { ArenaLocations } from '../world/arenaBuilder';
import { createGeneratorBeaconMesh, createResourceItemMesh } from './resourceMeshFactory';

interface SpawnedItem {
  mesh: THREE.Mesh;
  type: ResourceType;
  baseY: number;
}

interface GeneratorBeacon {
  mesh: THREE.Mesh;
  baseY: number;
}

export class ResourceManager {
  private scene: THREE.Scene;
  private items: SpawnedItem[] = [];
  private beacons: GeneratorBeacon[] = [];
  private itemGroup = new THREE.Group();
  private ironTimer = 0;
  private goldTimer = 0;
  private diamondTimer = 0;
  private emeraldTimer = 0;
  private arenaLocs: ArenaLocations | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.itemGroup);
  }

  public setLocations(locs: ArenaLocations) {
    this.clear();
    this.arenaLocs = locs;
    for (const dGen of locs.diamondGens) {
      this.createBeacon(dGen, 0x38bdf8, 0.45);
    }
    for (const eGen of locs.emeraldGens) {
      this.createBeacon(eGen, 0x22c55e, 0.55);
    }
  }

  private createBeacon(pos: THREE.Vector3, color: number, size: number) {
    const beacon = createGeneratorBeaconMesh(pos, color, size);
    this.itemGroup.add(beacon.mesh);
    this.beacons.push(beacon);
  }

  private spawn(type: ResourceType, pos: THREE.Vector3) {
    if (this.items.length >= 64) return;
    const mesh = createResourceItemMesh(type);
    const offset = new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3);
    mesh.position.copy(pos).add(offset);
    this.itemGroup.add(mesh);
    this.items.push({ mesh, type, baseY: mesh.position.y });
  }

  public update(delta: number, time: number, playerPos: THREE.Vector3, resources: ResourceCounts) {
    if (!this.arenaLocs) return;

    this.ironTimer += delta;
    if (this.ironTimer >= 2.2) {
      this.ironTimer = 0;
      this.spawn('iron', this.arenaLocs.redGenPos);
      this.spawn('iron', this.arenaLocs.blueGenPos);
    }

    this.goldTimer += delta;
    if (this.goldTimer >= 6.5) {
      this.goldTimer = 0;
      this.spawn('gold', this.arenaLocs.redGenPos);
      this.spawn('gold', this.arenaLocs.blueGenPos);
    }

    this.diamondTimer += delta;
    if (this.diamondTimer >= 18) {
      this.diamondTimer = 0;
      for (const dGen of this.arenaLocs.diamondGens) {
        this.spawn('diamond', dGen);
      }
    }

    this.emeraldTimer += delta;
    if (this.emeraldTimer >= 26) {
      this.emeraldTimer = 0;
      for (const eGen of this.arenaLocs.emeraldGens) {
        this.spawn('emerald', eGen);
      }
    }

    for (const beacon of this.beacons) {
      beacon.mesh.rotation.y += delta * 1.5;
      beacon.mesh.position.y = beacon.baseY + Math.sin(time * 2) * 0.15;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.mesh.rotation.y += delta * 2.5;
      item.mesh.position.y = item.baseY + Math.sin(time * 3 + i) * 0.12;

      const dist = item.mesh.position.distanceTo(playerPos);
      if (dist < 1.4) {
        resources[item.type] += 1;
        sounds.playPickup();
        this.itemGroup.remove(item.mesh);
        this.items.splice(i, 1);
      }
    }
  }

  public clear() {
    for (const item of this.items) this.itemGroup.remove(item.mesh);
    this.items = [];
    for (const beacon of this.beacons) this.itemGroup.remove(beacon.mesh);
    this.beacons = [];
    this.ironTimer = 0;
    this.goldTimer = 0;
    this.diamondTimer = 0;
    this.emeraldTimer = 0;
  }
}
