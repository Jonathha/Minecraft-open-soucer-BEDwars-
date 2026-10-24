import { Vector3D } from './types';
import { PredictionConstants } from './predictionConstants';

export function predictNextPosition(
  lastPos: Vector3D,
  lastVelocity: Vector3D,
  currentDt: number,
  serverGrounded: boolean,
  jumpInput: boolean,
  effectiveVelocity: Vector3D,
  isSneaking = false
): { predictedPos: Vector3D; predictedVelY: number } {
  let predictedVelY = lastVelocity.y;

  if (jumpInput && serverGrounded) {
    predictedVelY = PredictionConstants.JUMP_IMPULSE;
  } else if (serverGrounded) {
    predictedVelY = 0;
  } else {
    // Servidor é autoridade absoluta na gravidade: no ar, a velocidade vertical SEMPRE decai pela gravidade
    // Jamais confia na velocidade vertical enviada pelo cliente no ar sem bloco de apoio
    predictedVelY = (lastVelocity ? lastVelocity.y : 0) - PredictionConstants.GRAVITY * currentDt;
    predictedVelY = Math.max(-32.0, predictedVelY); // Terminal velocity
  }

  const maxDist = PredictionConstants.MAX_NORMAL_SPEED * currentDt;
  const clampedVx = Math.max(-PredictionConstants.MAX_NORMAL_SPEED, Math.min(PredictionConstants.MAX_NORMAL_SPEED, effectiveVelocity.x || 0));
  const clampedVz = Math.max(-PredictionConstants.MAX_NORMAL_SPEED, Math.min(PredictionConstants.MAX_NORMAL_SPEED, effectiveVelocity.z || 0));

  return {
    predictedPos: {
      x: lastPos.x + clampedVx * currentDt,
      y: serverGrounded && !jumpInput ? lastPos.y : lastPos.y + predictedVelY * currentDt,
      z: lastPos.z + clampedVz * currentDt
    },
    predictedVelY
  };
}
