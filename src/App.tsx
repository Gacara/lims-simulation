import React, { useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { GameUI } from './components/ui/GameUI';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useGameStore } from './stores/gameStore';
import { useFirebaseConnection } from './hooks/useFirebase';

function App() {
  // Initialize keyboard controls
  useKeyboardControls();
  
  // Initialize game store
  const { addNotification } = useGameStore();
  
  // Test Firebase connection
  const { isConnected, projectInfo, connectionError } = useFirebaseConnection();

  useEffect(() => {
    // Welcome notification
    addNotification({
      type: 'info',
      title: 'Welcome to 3D Lab Manager',
      message: 'Use WASD or arrow keys to move around. Press E to interact with equipment.'
    });
  }, [addNotification]);

  useEffect(() => {
    // Firebase connection status notification
    if (isConnected === true) {
      addNotification({
        type: 'success',
        title: '🔥 Firebase Connected',
        message: `Connected to project: ${projectInfo?.projectId}`
      });
    } else if (isConnected === false) {
      addNotification({
        type: 'error',
        title: '❌ Firebase Connection Failed',
        message: connectionError || 'Unable to connect to Firebase'
      });
    }
  }, [isConnected, projectInfo, connectionError, addNotification]);

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      {/* Firebase Status Indicator */}
      <div className="absolute top-16 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected === true 
            ? 'bg-green-100 text-green-800' 
            : isConnected === false 
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isConnected === true ? '🔥 Firebase Connected' : 
           isConnected === false ? '❌ Firebase Disconnected' : 
           '⏳ Connecting to Firebase...'}
        </div>
      </div>
      
      {/* 3D Scene */}
      <Scene />
      
      {/* UI Overlays */}
      <GameUI />
    </div>
  );
}

export default App;