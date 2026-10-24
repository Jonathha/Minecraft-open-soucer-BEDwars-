import * as THREE from 'three';
import { VoxelWorld } from './voxelWorld';
import { buildLobbyWorld } from './lobbyBuilder';

export function setupMenuEnvironment(scene: THREE.Scene, world: VoxelWorld) {
  scene.background = new THREE.Color(0x78b7ff);
  scene.fog = new THREE.FogExp2(0x78b7ff, 0.012);

  // Build the complete grand BedWars Lobby island (plaza, cherry trees, portal, towers, parkour)
  buildLobbyWorld(scene, world);

  // Ambient floating voxel clouds high above the lobby island
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const cloudGeo = new THREE.BoxGeometry(6, 1.2, 8);
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMat);
    cloud.position.set((Math.random() - 0.5) * 80, 24 + Math.random() * 5, (Math.random() - 0.5) * 80);
    cloudGroup.add(cloud);
  }
  scene.add(cloudGroup);

  return { cloudGroup };
}

export function updateMenuCamera(camera: THREE.Camera, time: number) {
  const radius = 30;
  const speed = 0.08;
  const x = Math.cos(time * speed) * radius;
  const z = Math.sin(time * speed) * radius;
  camera.position.set(x, 14 + Math.sin(time * 0.2) * 2, z);
  camera.lookAt(0, 3, 0);
}
