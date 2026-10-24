import { useEffect, RefObject } from 'react';
import { GameEngine } from '../game/gameEngine';

interface GameInputOptions {
  engineRef: RefObject<GameEngine | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  activeShop: 'item_shop' | 'upgrade_shop' | null;
  setActiveShop: (shop: 'item_shop' | 'upgrade_shop' | null) => void;
  setSelectedSlot: (slot: number) => void;
}

export function useGameInput({
  engineRef,
  canvasRef,
  activeShop,
  setActiveShop,
  setSelectedSlot,
}: GameInputOptions) {
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const { code, key } = e;
      const k = key.toLowerCase();
      const p = engine.player;

      if (code === 'ShiftLeft' || code === 'ShiftRight' || k === 'shift' || e.shiftKey) {
        p.keys.sneak = true;
      }

      if (code === 'KeyW' || k === 'w' || code === 'ArrowUp') p.keys.forward = true;
      if (code === 'KeyS' || k === 's' || code === 'ArrowDown') p.keys.backward = true;
      if (code === 'KeyA' || k === 'a' || code === 'ArrowLeft') p.keys.left = true;
      if (code === 'KeyD' || k === 'd' || code === 'ArrowRight') p.keys.right = true;
      if (code === 'Space' || k === ' ') p.keys.jump = true;

      if (code === 'KeyE' || k === 'e') {
        if (!e.repeat) {
          if (activeShop) setActiveShop(null);
          else if (engine.testSimulator.autoSneakBridgeOnE) {
            engine.testSimulator.handleSmartEPlace(engine);
          } else {
            engine.interaction.handlePlaceBlock();
          }
        }
      } else if (code === 'KeyL' || k === 'l') {
        p.isHoldingLKey = true;
        if (engine.aimbot.aimbotEnabled) {
          engine.aimbot.triggerAimbot(engine, true);
        } else {
          engine.testSimulator.setLKeyState(true);
        }
      } else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(k)) {
        const idx = parseInt(k, 10) - 1;
        engine.selectedSlot = idx;
        setSelectedSlot(idx);
      } else if (k === '0') {
        engine.selectedSlot = 0;
        setSelectedSlot(0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const { code, key } = e;
      const k = key.toLowerCase();
      const p = engine.player;

      if (code === 'KeyW' || k === 'w' || code === 'ArrowUp') p.keys.forward = false;
      else if (code === 'KeyS' || k === 's' || code === 'ArrowDown') p.keys.backward = false;
      else if (code === 'KeyA' || k === 'a' || code === 'ArrowLeft') p.keys.left = false;
      else if (code === 'KeyD' || k === 'd' || code === 'ArrowRight') p.keys.right = false;
      else if (code === 'Space' || k === ' ') p.keys.jump = false;
      else if (code === 'ShiftLeft' || code === 'ShiftRight' || k === 'shift') {
        if (!e.shiftKey) {
          p.keys.sneak = false;
        }
      }
      else if (code === 'KeyL' || k === 'l') {
        engine.testSimulator.setLKeyState(false);
        p.isHoldingLKey = false;
      }
    };

    let isMouseDown = false;
    const handleWinMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      if (e.shiftKey) engine.player.keys.sneak = true;
      const isTargetCanvas = e.target === canvasRef.current || document.pointerLockElement === canvasRef.current;
      if (!activeShop && isTargetCanvas) {
        if (e.button === 0) {
          if (engine.aimbot.aimbotEnabled) {
            engine.aimbot.triggerAimbot(engine, false);
          }
          engine.interaction.startBreak();
        }
        if (e.button === 2) engine.interaction.startPlace();
      }
    };
    const handleWinMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
      if (e.button === 0) engine.interaction.stopBreak();
      if (e.button === 2) engine.interaction.stopPlace();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.shiftKey) engine.player.keys.sneak = true;
      if (document.pointerLockElement === canvasRef.current || isMouseDown) {
        engine.player.handleMouseMove(e.movementX, e.movementY);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (activeShop) return;
      const delta = Math.sign(e.deltaY);
      if (delta !== 0) {
        const next = (engine.selectedSlot + (delta > 0 ? 1 : -1) + 9) % 9;
        engine.selectedSlot = next;
        setSelectedSlot(next);
      }
    };

    const handleWindowBlur = () => {
      const p = engine.player;
      p.keys.forward = false;
      p.keys.backward = false;
      p.keys.left = false;
      p.keys.right = false;
      p.keys.jump = false;
      p.keys.sneak = false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleWinMouseDown);
    window.addEventListener('mouseup', handleWinMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleWinMouseDown);
      window.removeEventListener('mouseup', handleWinMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [engineRef, canvasRef, activeShop, setActiveShop, setSelectedSlot]);
}
