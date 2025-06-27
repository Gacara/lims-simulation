import React, { useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { GameUI } from './components/ui/GameUI';
import { AuthScreen } from './components/auth/AuthScreen';
import { MobileApp } from './components/mobile/MobileApp';
import { LaboratorySelector } from './components/laboratory/LaboratorySelector';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useAuth } from './hooks/useAuth';
import { useUser } from './hooks/useUser';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { useGameStore } from './stores/gameStore';
import { useFirebaseConnection } from './hooks/useFirebase';
import { UserService } from './services/userService';
import type { GameNotification, Laboratory } from './types';
import type { UserProfile } from './services/userService';

function App() {
  // Authentication and device detection
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: userLoading } = useUser();
  const { currentLaboratory, setCurrentLaboratory } = useGameStore();
  const { isMobile } = useDeviceDetection();
  
  // Initialize keyboard controls (desktop only)
  useKeyboardControls();
  
  // Initialize game store
  const { addNotification } = useGameStore();
  
  // Test Firebase connection
  const { isConnected, projectInfo, connectionError } = useFirebaseConnection();

  // Handle laboratory selection
  const handleLaboratorySelected = async (laboratory: Laboratory) => {
    if (!userProfile) return;
    
    try {
      // Set as current laboratory
             await UserService.setCurrentLaboratory(userProfile.id, laboratory.id);
      setCurrentLaboratory(laboratory);
      
      // Add to user's laboratory list if not already there
      if (!userProfile.memberLaboratories.includes(laboratory.id)) {
                 await UserService.addUserToLaboratory(userProfile.id, laboratory.id);
      }
      
      addNotification({
        type: 'success',
        title: 'Laboratoire sélectionné',
        message: `Bienvenue dans ${laboratory.name} !`
      });
    } catch (error) {
      console.error('Erreur lors de la sélection du laboratoire:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sélectionner le laboratoire'
      });
    }
  };

  // Show loading screen while checking authentication and user data
  if (authLoading || (user && userLoading)) {
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="text-latte-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-latte-600 mx-auto mb-4"></div>
          <p className="font-medium">
            {authLoading ? 'Connexion...' : 'Chargement du profil...'}
          </p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Show laboratory selector if user hasn't selected a laboratory yet
  if (userProfile && !currentLaboratory) {
    return <LaboratorySelector onLaboratorySelected={handleLaboratorySelected} />;
  }

  // Show mobile interface on mobile devices
  if (isMobile) {
    return <MobileApp />;
  }

  // Show desktop interface
  return <DesktopApp 
    isConnected={isConnected} 
    projectInfo={projectInfo} 
    connectionError={connectionError} 
    addNotification={addNotification}
    userProfile={userProfile}
  />;
}

// Desktop App Component
function DesktopApp({ 
  isConnected, 
  projectInfo, 
  connectionError, 
  addNotification,
  userProfile
}: {
  isConnected: boolean | null;
  projectInfo: { projectId?: string } | null;
  connectionError: string | null;
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void;
  userProfile: UserProfile | null;
}) {

  useEffect(() => {
    // Welcome notification with user name
    if (userProfile) {
      addNotification({
        type: 'info',
        title: `Bienvenue ${userProfile.displayName} !`,
        message: 'Utilisez WASD ou les flèches pour vous déplacer. Appuyez sur E pour interagir avec les équipements.'
      });
    }
  }, [addNotification, userProfile]);

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
    <div className="w-screen h-screen bg-luxury-gradient relative overflow-hidden">
      {/* Firebase Status Indicator */}
      <div className="absolute top-20 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
          isConnected === true 
            ? 'bg-cream-100 text-cream-800 border border-cream-200' 
            : isConnected === false 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-sand-100 text-sand-800 border border-sand-200'
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