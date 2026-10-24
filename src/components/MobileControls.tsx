import React, { useRef } from 'react';
import { MobileActionButtons } from './MobileActionButtons';
import { MobileJoystick } from './MobileJoystick';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onJump: (isJumping: boolean) => void;
  onAttack: () => void;
  onAttackStart?: () => void;
  onAttackEnd?: () => void;
  onPlace: () => void;
  onInteract: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove, onLook, onJump, onAttack, onAttackStart, onAttackEnd, onPlace, onInteract
}) => {
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const touchLookRef = useRef<{ id: number; lastX: number; lastY: number } | null>(null);

  const handleLookTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (touch && !touchLookRef.current) {
      touchLookRef.current = { id: touch.identifier, lastX: touch.clientX, lastY: touch.clientY };
    }
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchLookRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchLookRef.current.id) {
        const deltaX = touch.clientX - touchLookRef.current.lastX;
        const deltaY = touch.clientY - touchLookRef.current.lastY;
        touchLookRef.current.lastX = touch.clientX;
        touchLookRef.current.lastY = touch.clientY;
        onLook(deltaX, deltaY);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchLookRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchLookRef.current.id) {
        touchLookRef.current = null;
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between p-4">
      <MobileJoystick onMove={onMove} />

      <div
        ref={lookAreaRef}
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
        className="flex-1 h-3/4 self-center pointer-events-auto touch-none"
      />

      <MobileActionButtons
        onJump={onJump}
        onAttack={onAttack}
        onAttackStart={onAttackStart}
        onAttackEnd={onAttackEnd}
        onPlace={onPlace}
        onInteract={onInteract}
      />
    </div>
  );
};
