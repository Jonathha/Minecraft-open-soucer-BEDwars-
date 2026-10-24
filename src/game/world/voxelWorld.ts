import * as THREE from 'three';
import { BlockType } from '../../types/game';
import { getBlockMaterial } from '../graphics/textures';

export interface BlockIntersection {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  blockPos: THREE.Vector3;
  placePos: THREE.Vector3;
  type: BlockType;
}

export class VoxelWorld {
  public scene: THREE.Scene;
  public blocks = new Map<string, { type: BlockType; mesh?: THREE.Mesh }>();
  public fakeGhostBlocks = new Map<string, { type: BlockType; mesh: THREE.Mesh }>();
  public playerPlaced = new Set<string>();
  private boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  private bedGeometry = new THREE.BoxGeometry(1, 0.5625, 1);
  public blockMeshGroup = new THREE.Group();
  public instancedMeshes: THREE.InstancedMesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.blockMeshGroup);
  }

  public key(x: number, y: number, z: number): string {
    return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
  }

  public setBlock(x: number, y: number, z: number, type: BlockType, isPlayerPlaced = false): void {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const k = this.key(rx, ry, rz);

    if (type === BlockType.AIR) {
      this.removeBlock(rx, ry, rz);
      return;
    }

    if (this.blocks.has(k)) {
      this.removeBlock(rx, ry, rz);
    }

    const isBed = type === BlockType.BED_RED || type === BlockType.BED_BLUE;
    const material = getBlockMaterial(type, { x: rx, y: ry, z: rz });
    const mesh = new THREE.Mesh(isBed ? this.bedGeometry : this.boxGeometry, material);
    mesh.position.set(rx, isBed ? ry - 0.21875 : ry, rz);
    mesh.userData = { isBlock: true, pos: { x: rx, y: ry, z: rz }, type };
    this.blockMeshGroup.add(mesh);
    this.blocks.set(k, { type, mesh });
    if (isPlayerPlaced) {
      this.playerPlaced.add(k);
    } else {
      this.playerPlaced.delete(k);
    }
  }

  public isPlayerPlaced(x: number, y: number, z: number): boolean {
    return this.playerPlaced.has(this.key(x, y, z));
  }

  public setFakeGhostBlock(x: number, y: number, z: number, type: BlockType = BlockType.GLOWSTONE): void {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const k = this.key(rx, ry, rz);

    if (this.fakeGhostBlocks.has(k)) {
      const old = this.fakeGhostBlocks.get(k);
      if (old) this.blockMeshGroup.remove(old.mesh);
      this.fakeGhostBlocks.delete(k);
    }

    const material = getBlockMaterial(type, { x: rx, y: ry, z: rz });
    const mesh = new THREE.Mesh(this.boxGeometry, material);
    mesh.position.set(rx, ry, rz);
    mesh.userData = { isBlock: true, pos: { x: rx, y: ry, z: rz }, type, isFakeGhostBlock: true };
    this.blockMeshGroup.add(mesh);
    this.fakeGhostBlocks.set(k, { type, mesh });
  }

  public getBlock(x: number, y: number, z: number): BlockType {
    const k = this.key(x, y, z);
    const entry = this.blocks.get(k) || this.fakeGhostBlocks.get(k);
    return entry ? entry.type : BlockType.AIR;
  }

  public getRealBlock(x: number, y: number, z: number): BlockType {
    const k = this.key(x, y, z);
    const entry = this.blocks.get(k);
    return entry ? entry.type : BlockType.AIR;
  }

  public isSolid(x: number, y: number, z: number): boolean {
    const type = this.getBlock(x, y, z);
    return type !== BlockType.AIR;
  }

  public isRealSolid(x: number, y: number, z: number): boolean {
    const type = this.getRealBlock(x, y, z);
    return type !== BlockType.AIR;
  }

  public removeBlock(x: number, y: number, z: number): BlockType {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const k = this.key(rx, ry, rz);
    const entry = this.blocks.get(k);
    if (!entry) return BlockType.AIR;

    if (entry.mesh) {
      this.blockMeshGroup.remove(entry.mesh);
    }
    this.blocks.delete(k);
    this.playerPlaced.delete(k);
    return entry.type;
  }

  public raycast(raycaster: THREE.Raycaster, maxDistance = 6): BlockIntersection | null {
    const intersects = raycaster.intersectObjects(this.blockMeshGroup.children, false);
    if (intersects.length === 0) return null;

    const hit = intersects[0];
    if (hit.distance > maxDistance || !hit.face) return null;

    const mesh = hit.object as THREE.Mesh;
    const blockPos = mesh.userData?.pos
      ? new THREE.Vector3(mesh.userData.pos.x, mesh.userData.pos.y, mesh.userData.pos.z)
      : new THREE.Vector3(Math.round(mesh.position.x), Math.round(mesh.position.y), Math.round(mesh.position.z));
    const normal = new THREE.Vector3(
      Math.round(hit.face.normal.x),
      Math.round(hit.face.normal.y),
      Math.round(hit.face.normal.z)
    );
    const placePos = new THREE.Vector3(
      Math.round(blockPos.x + normal.x),
      Math.round(blockPos.y + normal.y),
      Math.round(blockPos.z + normal.z)
    );
    const type = (mesh.userData?.type as BlockType) || BlockType.STONE;

    return { point: hit.point, normal, blockPos, placePos, type };
  }

  /**
   * Converts all individual lobby block meshes into GPU-accelerated THREE.InstancedMesh batches.
   * Decreases draw calls from ~1500+ down to ~12 without altering physics or collision bounds.
   */
  public bakeLobbyInstancedMeshes(): void {
    const blocksByType = new Map<BlockType, { x: number; y: number; z: number }[]>();

    for (const [key, entry] of this.blocks.entries()) {
      const parts = key.split(',');
      if (parts.length === 3) {
        const x = Number(parts[0]);
        const y = Number(parts[1]);
        const z = Number(parts[2]);
        let list = blocksByType.get(entry.type);
        if (!list) {
          list = [];
          blocksByType.set(entry.type, list);
        }
        list.push({ x, y, z });
      }
    }

    // Remove all individual meshes from the rendering scene group
    while (this.blockMeshGroup.children.length > 0) {
      this.blockMeshGroup.remove(this.blockMeshGroup.children[0]);
    }

    // Unset mesh references from block entries (retaining block type map for collision)
    for (const entry of this.blocks.values()) {
      entry.mesh = undefined;
    }

    // Dispose and reset any previous instanced meshes
    for (const im of this.instancedMeshes) {
      im.dispose?.();
    }
    this.instancedMeshes = [];

    // Create 1 InstancedMesh per BlockType
    const dummy = new THREE.Object3D();
    for (const [type, positions] of blocksByType.entries()) {
      if (positions.length === 0) continue;

      const isBed = type === BlockType.BED_RED || type === BlockType.BED_BLUE;
      const material = getBlockMaterial(type);
      const geometry = isBed ? this.bedGeometry : this.boxGeometry;

      const instancedMesh = new THREE.InstancedMesh(geometry, material, positions.length);
      instancedMesh.castShadow = false;
      instancedMesh.receiveShadow = false;

      for (let i = 0; i < positions.length; i++) {
        const { x, y, z } = positions[i];
        dummy.position.set(x, isBed ? y - 0.21875 : y, z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      this.blockMeshGroup.add(instancedMesh);
      this.instancedMeshes.push(instancedMesh);
    }
  }

  public clear(): void {
    while (this.blockMeshGroup.children.length > 0) {
      this.blockMeshGroup.remove(this.blockMeshGroup.children[0]);
    }
    for (const im of this.instancedMeshes) {
      im.dispose?.();
    }
    this.instancedMeshes = [];
    this.blocks.clear();
    this.fakeGhostBlocks.clear();
    this.playerPlaced.clear();
  }
}
