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

// Fonction pour vérifier si l'élément actif est éditable
function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  
  return isInput || isContentEditable;
}

export function useKeyboardControls() {
  const { updateControls } = useControlsStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer les contrôles si l'utilisateur tape dans un input
      if (isEditableElement(document.activeElement)) {
        return;
      }
      
      const control = keyMap[event.code];
      if (control) {
        event.preventDefault();
        updateControls({ [control]: true });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Ignorer les contrôles si l'utilisateur tape dans un input
      if (isEditableElement(document.activeElement)) {
        return;
      }
      
      const control = keyMap[event.code];
      if (control) {
        event.preventDefault();
        updateControls({ [control]: false });
      }
    };

    // Prevent tab key from changing focus when used for inventory
    const handleKeyDownCapture = (event: KeyboardEvent) => {
      // Ne pas intercepter Tab si on est dans un input
      if (event.code === 'Tab' && !isEditableElement(document.activeElement)) {
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