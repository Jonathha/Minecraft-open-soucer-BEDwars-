import * as THREE from 'three';
import { textureCache } from './textureLoaderUtil';
import { loadAndPaintBedPng } from './bedTexturePainter';

export type BedPartType =
  | 'head_top'
  | 'feet_top'
  | 'head_side_posX'
  | 'head_side_negX'
  | 'feet_side_posX'
  | 'feet_side_negX'
  | 'head_end'
  | 'feet_end';

export function drawBedPartFallback(ctx: CanvasRenderingContext2D, type: BedPartType, team: 'red' | 'blue') {
  const blanketMain = team === 'red' ? '#b82c2c' : '#2563eb';
  const blanketDark = team === 'red' ? '#8f1d1d' : '#1d4ed8';
  const blanketLight = team === 'red' ? '#d33838' : '#3b82f6';
  const pillowWhite = '#f8fafc';
  const pillowShade = '#cbd5e1';
  const woodPlank = '#8c6832';
  const woodLeg = '#5a3a22';
  const woodRecess = '#3d2613';

  if (type === 'head_top') {
    if (team === 'red') {
      ctx.fillStyle = blanketMain; ctx.fillRect(0, 0, 16, 8);
      ctx.fillStyle = blanketLight; ctx.fillRect(2, 2, 12, 1);
      ctx.fillStyle = blanketDark; ctx.fillRect(0, 7, 16, 1);
      ctx.fillStyle = pillowWhite; ctx.fillRect(0, 8, 16, 8);
      ctx.fillStyle = pillowShade; ctx.fillRect(0, 8, 16, 1); ctx.fillRect(0, 15, 16, 1);
    } else {
      ctx.fillStyle = pillowWhite; ctx.fillRect(0, 0, 16, 8);
      ctx.fillStyle = pillowShade; ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 7, 16, 1);
      ctx.fillStyle = blanketMain; ctx.fillRect(0, 8, 16, 8);
      ctx.fillStyle = blanketLight; ctx.fillRect(2, 10, 12, 1);
      ctx.fillStyle = blanketDark; ctx.fillRect(0, 8, 16, 1);
    }
  } else if (type === 'feet_top') {
    ctx.fillStyle = blanketMain; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = blanketDark; ctx.fillRect(0, 15, 16, 1);
    ctx.fillStyle = blanketLight; ctx.fillRect(2, 4, 12, 1);
  } else if (type === 'head_side_posX') {
    ctx.fillStyle = pillowWhite; ctx.fillRect(0, 0, 8, 3);
    ctx.fillStyle = blanketMain; ctx.fillRect(8, 0, 8, 3);
    ctx.fillStyle = woodPlank; ctx.fillRect(0, 3, 16, 3);
    ctx.fillStyle = woodLeg; ctx.fillRect(0, 6, 3, 3);
    ctx.fillStyle = woodRecess; ctx.fillRect(3, 6, 13, 3);
  } else if (type === 'head_side_negX') {
    ctx.fillStyle = blanketMain; ctx.fillRect(0, 0, 8, 3);
    ctx.fillStyle = pillowWhite; ctx.fillRect(8, 0, 8, 3);
    ctx.fillStyle = woodPlank; ctx.fillRect(0, 3, 16, 3);
    ctx.fillStyle = woodRecess; ctx.fillRect(0, 6, 13, 3);
    ctx.fillStyle = woodLeg; ctx.fillRect(13, 6, 3, 3);
  } else if (type === 'feet_side_posX') {
    ctx.fillStyle = blanketMain; ctx.fillRect(0, 0, 16, 3);
    ctx.fillStyle = woodPlank; ctx.fillRect(0, 3, 16, 3);
    ctx.fillStyle = woodRecess; ctx.fillRect(0, 6, 13, 3);
    ctx.fillStyle = woodLeg; ctx.fillRect(13, 6, 3, 3);
  } else if (type === 'feet_side_negX') {
    ctx.fillStyle = blanketMain; ctx.fillRect(0, 0, 16, 3);
    ctx.fillStyle = woodPlank; ctx.fillRect(0, 3, 16, 3);
    ctx.fillStyle = woodLeg; ctx.fillRect(0, 6, 3, 3);
    ctx.fillStyle = woodRecess; ctx.fillRect(3, 6, 13, 3);
  } else if (type === 'head_end' || type === 'feet_end') {
    ctx.fillStyle = type === 'head_end' ? pillowWhite : blanketMain; ctx.fillRect(0, 0, 16, 3);
    ctx.fillStyle = woodPlank; ctx.fillRect(0, 3, 16, 3);
    ctx.fillStyle = woodLeg; ctx.fillRect(0, 6, 3, 3); ctx.fillRect(13, 6, 3, 3);
    ctx.fillStyle = woodRecess; ctx.fillRect(3, 6, 10, 3);
  }
}

export function createBedPartTexture(type: BedPartType, team: 'red' | 'blue'): THREE.Texture {
  const cacheKey = `bed_part_${type}_${team}`;
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const isTop = type === 'head_top' || type === 'feet_top';
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = isTop ? 16 : 9;
  const ctx = canvas.getContext('2d')!;

  drawBedPartFallback(ctx, type, team);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;

  loadAndPaintBedPng(type, team, ctx, tex);

  textureCache.set(cacheKey, tex);
  return tex;
}
