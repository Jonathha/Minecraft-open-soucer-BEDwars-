import * as THREE from 'three';

/**
 * Procedurally generates 10 stages of Minecraft-authentic destruction crack patterns
 */
export function generateCrackTexture(stage: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = '#000000';

  const density = (stage + 1) / 10;
  const numCracks = Math.floor(density * 45);

  ctx.fillRect(7, 7, 2, 2);

  let seed = stage * 1337 + 42;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < numCracks; i++) {
    const x = Math.floor(random() * 16);
    const y = Math.floor(random() * 16);
    ctx.fillRect(x, y, 1, 1);

    if (random() > 0.4) {
      const dir = Math.floor(random() * 4);
      if (dir === 0) ctx.fillRect(Math.min(15, x + 1), y, 1, 1);
      else if (dir === 1) ctx.fillRect(Math.max(0, x - 1), y, 1, 1);
      else if (dir === 2) ctx.fillRect(x, Math.min(15, y + 1), 1, 1);
      else ctx.fillRect(x, Math.max(0, y - 1), 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

export function loadCrackTextures(): THREE.CanvasTexture[] {
  const textures: THREE.CanvasTexture[] = [];
  for (let i = 0; i < 10; i++) {
    textures.push(generateCrackTexture(i));
  }
  return textures;
}
