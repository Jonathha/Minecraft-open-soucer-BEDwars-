import * as THREE from 'three';
import { BedPartType } from './bedTextures';

export function loadAndPaintBedPng(
  type: BedPartType,
  team: 'red' | 'blue',
  ctx: CanvasRenderingContext2D,
  tex: THREE.CanvasTexture
) {
  if (typeof Image === 'undefined') return;

  const pngMap: Record<string, string> = {
    head_top: '/textures/blocks/bed_head_top.png',
    feet_top: '/textures/blocks/bed_feet_top.png',
    head_side_posX: '/textures/blocks/bed_head_side.png',
    head_side_negX: '/textures/blocks/bed_head_side.png',
    feet_side_posX: '/textures/blocks/bed_feet_side.png',
    feet_side_negX: '/textures/blocks/bed_feet_side.png',
    head_end: '/textures/blocks/bed_head_end.png',
    feet_end: '/textures/blocks/bed_feet_end.png',
  };
  const pngPath = pngMap[type];
  if (!pngPath) return;

  const img = new Image();
  img.onload = () => {
    try {
      if (type === 'head_top') {
        const tmp = document.createElement('canvas');
        tmp.width = 16; tmp.height = 16;
        const tctx = tmp.getContext('2d')!;
        tctx.drawImage(img, 0, 0);
        const imgData = tctx.getImageData(0, 0, 16, 16);
        const rotated = ctx.createImageData(16, 16);
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const srcX = team === 'red' ? y : 15 - y;
            const srcY = team === 'red' ? 15 - x : x;
            const srcIdx = (srcY * 16 + srcX) * 4;
            const dstIdx = (y * 16 + x) * 4;
            let r = imgData.data[srcIdx], g = imgData.data[srcIdx + 1], b = imgData.data[srcIdx + 2], a = imgData.data[srcIdx + 3];
            if (team === 'blue' && r > 80 && r > g * 1.35 && r > b * 1.35) {
              const lum = r * 0.5 + g * 0.25 + b * 0.25;
              r = Math.round(lum * 0.18); g = Math.round(lum * 0.38); b = Math.round(lum * 0.88);
            }
            rotated.data[dstIdx] = r; rotated.data[dstIdx + 1] = g; rotated.data[dstIdx + 2] = b; rotated.data[dstIdx + 3] = a;
          }
        }
        ctx.putImageData(rotated, 0, 0);
      } else if (type === 'feet_top') {
        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(img, 0, 0);
        if (team === 'blue') {
          const imgData = ctx.getImageData(0, 0, 16, 16);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            if (r > 80 && r > g * 1.35 && r > b * 1.35) {
              const lum = r * 0.5 + g * 0.25 + b * 0.25;
              imgData.data[i] = Math.round(lum * 0.18); imgData.data[i + 1] = Math.round(lum * 0.38); imgData.data[i + 2] = Math.round(lum * 0.88);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      } else {
        ctx.fillStyle = '#3d2613';
        ctx.fillRect(0, 6, 16, 3);
        const needFlip = (type === 'head_side_posX' || type === 'feet_side_posX') ? (team === 'red') : false;
        if (needFlip) {
          ctx.save(); ctx.translate(16, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, 7, 16, 9, 0, 0, 16, 9); ctx.restore();
        } else {
          ctx.drawImage(img, 0, 7, 16, 9, 0, 0, 16, 9);
        }
        if (team === 'blue') {
          const imgData = ctx.getImageData(0, 0, 16, 9);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            if (r > 80 && r > g * 1.35 && r > b * 1.35) {
              const lum = r * 0.5 + g * 0.25 + b * 0.25;
              imgData.data[i] = Math.round(lum * 0.18); imgData.data[i + 1] = Math.round(lum * 0.38); imgData.data[i + 2] = Math.round(lum * 0.88);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }
      tex.needsUpdate = true;
    } catch {}
  };
  img.src = pngPath;
}
