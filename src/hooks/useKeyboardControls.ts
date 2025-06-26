import { useEffect } from 'react';
import { useControlsStore } from '../stores/gameStore';

const keyMap: { [key: string]: keyof import('../types').Controls } = {
  'KeyW': 'forward',
  'ArrowUp': 'forward',
  'KeyS': 'backward', 
  'ArrowDown': 'backward',
  'KeyA': 'left',
  'ArrowLeft': 'left',
  'KeyD': 'right',
  'ArrowRight': 'right',
  'KeyE': 'interact',
  'Space': 'interact',
  'KeyI': 'inventory',
  'Tab': 'inventory',
  'Escape': 'menu',
};

export function useKeyboardControls() {
  const { updateControls } = useControlsStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const control = keyMap[event.code];
      if (control) {
        event.preventDefault();
        updateControls({ [control]: true });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const control = keyMap[event.code];
      if (control) {
        event.preventDefault();
        updateControls({ [control]: false });
      }
    };

    // Prevent tab key from changing focus when used for inventory
    const handleKeyDownCapture = (event: KeyboardEvent) => {
      if (event.code === 'Tab') {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDownCapture, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDownCapture, true);
    };
  }, [updateControls]);
}