import * as THREE from 'three';

let cachedSteveTexture: THREE.Texture | null = null;

/**
 * Loads the official 64x64 Steve skin texture downloaded from
 * the official Minecraft assets repository. Configures nearest-neighbor
 * filtering for crisp pixel art fidelity.
 */
export function getOfficialSteveTexture(): THREE.Texture {
  if (cachedSteveTexture) {
    return cachedSteveTexture;
  }

  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/entity/steve.png');
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  cachedSteveTexture = texture;
  return cachedSteveTexture;
}

/**
 * Clones the base texture with a specific UV offset and repeat window
 * corresponding to a 64x64 Minecraft skin mapping.
 */
export function createFaceTexture(
  baseTex: THREE.Texture,
  u: number,
  v: number,
  w: number,
  h: number
): THREE.Texture {
  const tex = baseTex.clone();
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  // Convert 64x64 pixel coordinates to UV space (0 to 1)
  tex.offset.set(u / 64, (64 - v - h) / 64);
  tex.repeat.set(w / 64, h / 64);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
