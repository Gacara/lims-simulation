import React, { useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { GameUI } from './components/ui/GameUI';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useGameStore } from './stores/gameStore';

function App() {
  // Initialize keyboard controls
  useKeyboardControls();
  
  // Initialize game store
  const { addNotification } = useGameStore();

  useEffect(() => {
    // Welcome notification
    addNotification({
      type: 'info',
      title: 'Welcome to 3D Lab Manager',
      message: 'Use WASD or arrow keys to move around. Press E to interact with equipment.'
    });
  }, [addNotification]);

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      {/* 3D Scene */}
      <Scene />
      
      {/* UI Overlays */}
      <GameUI />
    </div>
  );
}

export default App;