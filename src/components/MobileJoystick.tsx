import React, { useRef, useState } from 'react';

interface MobileJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({ onMove }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  const handleJoystickTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch || !joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });
    onMove(kx / maxRadius, ky / maxRadius);
  };

  const handleJoystickEnd = () => {
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div className="self-end pb-8 pl-4 pointer-events-auto">
      <div
        ref={joystickRef}
        onTouchStart={handleJoystickTouch}
        onTouchMove={handleJoystickTouch}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        className="w-32 h-32 rounded-full bg-black/40 border-2 border-white/20 relative flex items-center justify-center touch-none"
      >
        <div
          className="w-14 h-14 rounded-full bg-white/60 shadow-lg absolute"
          style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
        />
      </div>
    </div>
  );
};
