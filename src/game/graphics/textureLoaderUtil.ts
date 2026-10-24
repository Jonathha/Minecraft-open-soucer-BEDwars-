import * as THREE from 'three';

export const textureCache = new Map<string, THREE.Texture>();

export function loadBlockTexture(path: string, fallbackDraw: (ctx: CanvasRenderingContext2D) => void): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  try {
    fallbackDraw(ctx);
  } catch {}

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;

  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.onload = () => {
      try {
        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(img, 0, 0);
        tex.needsUpdate = true;
      } catch {}
    };
    img.src = path;
  }

  return tex;
}

export function createPixelTexture(draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function getNoise(baseColor: [number, number, number], variance: number) {
  return createPixelTexture((ctx) => {
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const delta = (Math.random() * 2 - 1) * variance;
        const r = Math.min(255, Math.max(0, Math.round(baseColor[0] + delta)));
        const g = Math.min(255, Math.max(0, Math.round(baseColor[1] + delta)));
        const b = Math.min(255, Math.max(0, Math.round(baseColor[2] + delta)));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

export function getGrassSideTexture() {
  return createPixelTexture((ctx) => {
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 4; y < 16; y++) {
        if (Math.random() > 0.6) {
          ctx.fillStyle = Math.random() > 0.5 ? '#704c32' : '#9b7150';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.fillStyle = '#4fa135';
    for (let x = 0; x < 16; x++) {
      const drop = (x % 2 === 0 ? 3 : 4) + (Math.random() > 0.5 ? 1 : 0);
      ctx.fillRect(x, 0, 1, drop);
    }
  });
}

export function getBrickTexture() {
  return createPixelTexture((ctx) => {
    ctx.fillStyle = '#bfa590';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#9b3d32';
    ctx.fillRect(0, 1, 7, 3); ctx.fillRect(8, 1, 7, 3);
    ctx.fillRect(0, 5, 3, 3); ctx.fillRect(4, 5, 7, 3); ctx.fillRect(12, 5, 3, 3);
    ctx.fillRect(0, 9, 7, 3); ctx.fillRect(8, 9, 7, 3);
    ctx.fillRect(0, 13, 3, 3); ctx.fillRect(4, 13, 7, 3); ctx.fillRect(12, 13, 3, 3);
  });
}
