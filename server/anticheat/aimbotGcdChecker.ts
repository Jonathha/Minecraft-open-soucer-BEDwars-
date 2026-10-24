import { ServerRotationSample } from './aimbotTypes';

function calculateGcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0.0005) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export function checkRotationGcd(samples: ServerRotationSample[]): { suspicious: boolean; gcdError: number } {
  if (samples.length < 8) return { suspicious: false, gcdError: 0 };

  const deltas: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const d = Math.abs(samples[i].deltaYaw);
    if (d > 0.005 && d < 3.14) deltas.push(d);
  }

  if (deltas.length < 5) return { suspicious: false, gcdError: 0 };

  let currentGcd = deltas[0];
  for (let i = 1; i < deltas.length; i++) {
    currentGcd = calculateGcd(currentGcd, deltas[i]);
  }

  let totalResidual = 0;
  for (const d of deltas) {
    const remainder = currentGcd > 0.0001 ? d % currentGcd : d;
    totalResidual += Math.min(remainder, currentGcd - remainder);
  }

  const avgResidual = totalResidual / deltas.length;
  // Cheats calculating angles through trigonometry show arbitrary floats with no common divisor
  const isSuspicious = currentGcd < 0.0008 && avgResidual > 0.05 && deltas.length >= 6;
  return {
    suspicious: isSuspicious,
    gcdError: Number(avgResidual.toFixed(4)),
  };
}
