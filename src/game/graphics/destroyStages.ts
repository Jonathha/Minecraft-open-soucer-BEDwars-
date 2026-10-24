import * as THREE from 'three';
import { loadCrackTextures } from './crackTextureGenerator';

export { generateCrackTexture, loadCrackTextures } from './crackTextureGenerator';

export class BlockBreakVisualizer {
  private overlayMesh: THREE.Mesh;
  private crackMaterials: THREE.MeshBasicMaterial[] = [];
  public currentStage = -1;
  public activePos: { x: number; y: number; z: number } | null = null;
  private outlineMesh: THREE.LineSegments;

  constructor(scene: THREE.Scene) {
    const crackTextures = loadCrackTextures();
    this.crackMaterials = crackTextures.map(tex => new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }));

    const geometry = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    this.overlayMesh = new THREE.Mesh(geometry, this.crackMaterials[0]);
    this.overlayMesh.visible = false;
    scene.add(this.overlayMesh);

    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.001, 1.001, 1.001));
    this.outlineMesh = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2, transparent: true, opacity: 0.4 })
    );
    this.outlineMesh.visible = false;
    scene.add(this.outlineMesh);
  }

  public setProgress(x: number, y: number, z: number, progress: number) {
    if (progress <= 0 || progress >= 1) {
      this.clear();
      return;
    }
    const stage = Math.min(9, Math.floor(progress * 10));
    this.setStage(x, y, z, stage);
  }

  public setStage(xOrPos: number | THREE.Vector3, yOrStage?: number | boolean, zOrStage?: number | boolean, stage?: number) {
    let x: number, y: number, z: number, st: number;
    if (typeof xOrPos === 'object') {
      x = xOrPos.x;
      y = xOrPos.y;
      z = xOrPos.z;
      st = typeof yOrStage === 'number' ? yOrStage : (typeof zOrStage === 'number' ? zOrStage : (stage || 0));
    } else {
      x = xOrPos;
      y = typeof yOrStage === 'number' ? yOrStage : 0;
      z = typeof zOrStage === 'number' ? zOrStage : 0;
      st = stage || 0;
    }

    if (st < 0 || st > 9) {
      this.clear();
      return;
    }
    this.activePos = { x, y, z };
    this.currentStage = st;
    this.overlayMesh.position.set(x, y, z);
    this.overlayMesh.material = this.crackMaterials[st];
    this.overlayMesh.visible = true;
    this.outlineMesh.position.set(x, y, z);
    this.outlineMesh.visible = true;
  }

  public showOutline(x: number, y: number, z: number) {
    this.outlineMesh.position.set(x, y, z);
    this.outlineMesh.visible = true;
  }

  public hideOutline() {
    if (!this.overlayMesh.visible) {
      this.outlineMesh.visible = false;
    }
  }

  public hide() {
    this.clear();
  }

  public clear() {
    this.overlayMesh.visible = false;
    this.outlineMesh.visible = false;
    this.activePos = null;
    this.currentStage = -1;
  }

  public attachToScene(scene: THREE.Scene) {
    scene.add(this.overlayMesh);
    scene.add(this.outlineMesh);
  }

  public destroy(scene: THREE.Scene) {
    this.clear();
    scene.remove(this.overlayMesh);
    scene.remove(this.outlineMesh);
    this.crackMaterials.forEach(m => {
      m.map?.dispose();
      m.dispose();
    });
    this.overlayMesh.geometry.dispose();
    this.outlineMesh.geometry.dispose();
  }
}
