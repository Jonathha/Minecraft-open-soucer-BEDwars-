import * as THREE from 'three';
import { ResourceType } from '../../types/game';

export function createGeneratorBeaconMesh(pos: THREE.Vector3, color: number, size: number): { mesh: THREE.Mesh; baseY: number } {
  const geo = new THREE.OctahedronGeometry(size);
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.2, metalness: 0.8,
    emissive: color, emissiveIntensity: 0.25, transparent: true, opacity: 0.85
  });
  const mesh = new THREE.Mesh(geo, mat);
  const baseY = pos.y + 2.0;
  mesh.position.set(pos.x, baseY, pos.z);
  return { mesh, baseY };
}

export function createResourceItemMesh(type: ResourceType): THREE.Mesh {
  let geo: THREE.BufferGeometry;
  let color: number;
  if (type === 'iron') {
    geo = new THREE.BoxGeometry(0.25, 0.1, 0.4);
    color = 0xd1d5db;
  } else if (type === 'gold') {
    geo = new THREE.BoxGeometry(0.25, 0.1, 0.4);
    color = 0xfacc15;
  } else if (type === 'diamond') {
    geo = new THREE.OctahedronGeometry(0.22);
    color = 0x38bdf8;
  } else {
    geo = new THREE.OctahedronGeometry(0.22);
    color = 0x22c55e;
  }
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
  return new THREE.Mesh(geo, mat);
}
