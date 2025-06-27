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

  // State to control showing the lab selector or the game
  const [showLaboratorySelector, setShowLaboratorySelector] = React.useState(true);

  // Debug logs
  console.log('=== APP RENDER DEBUG ===');
  console.log('showLaboratorySelector:', showLaboratorySelector);
  console.log('currentLaboratory:', currentLaboratory);
  console.log('userProfile:', userProfile);
  console.log('user:', user);
  console.log('authLoading:', authLoading);
  console.log('userLoading:', userLoading);
  console.log('isMobile:', isMobile);
  console.log('========================');

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
      
      // Hide laboratory selector and show the game
      console.log('Setting showLaboratorySelector to false');
      setShowLaboratorySelector(false);
      
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

  // Handle back to laboratory selector
  const handleBackToLaboratorySelector = () => {
    console.log('handleBackToLaboratorySelector called - setting showLaboratorySelector to true');
    setShowLaboratorySelector(true);
  };

  // Show loading screen while checking authentication and user data
  if (authLoading || (user && userLoading)) {
    console.log('RENDERING: Loading screen');
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
    console.log('RENDERING: AuthScreen');
    return <AuthScreen />;
  }

  // Show loading screen if user profile is not loaded yet
  if (user && !userProfile) {
    console.log('RENDERING: Loading screen (waiting for userProfile)');
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="text-latte-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-latte-600 mx-auto mb-4"></div>
          <p className="font-medium">Chargement du profil utilisateur...</p>
        </div>
      </div>
    );
  }

  // Show laboratory selector if user hasn't selected a laboratory yet or wants to change
  if (userProfile && showLaboratorySelector) {
    console.log('RENDERING: LaboratorySelector (condition: showLaboratorySelector =', showLaboratorySelector, ')');
    console.log('userProfile exists:', !!userProfile);
    return (
      <LaboratorySelector 
        onLaboratorySelected={handleLaboratorySelected}
        currentLaboratory={currentLaboratory}
      />
    );
  }

  // Show mobile interface on mobile devices
  if (isMobile) {
    console.log('RENDERING: MobileApp');
    return <MobileApp />;
  }

  // Show desktop interface
  console.log('RENDERING: DesktopApp');
  return <DesktopApp 
    isConnected={isConnected} 
    projectInfo={projectInfo} 
    connectionError={connectionError} 
    addNotification={addNotification}
    userProfile={userProfile}
    onBackToLaboratorySelector={handleBackToLaboratorySelector}
  />;
}

// Desktop App Component
function DesktopApp({ 
  isConnected, 
  projectInfo, 
  connectionError, 
  addNotification,
  userProfile,
  onBackToLaboratorySelector
}: {
  isConnected: boolean | null;
  projectInfo: { projectId?: string } | null;
  connectionError: string | null;
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void;
  userProfile: UserProfile | null;
  onBackToLaboratorySelector: () => void;
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
      
      {/* Back to Laboratory Selector Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Changer de laboratoire clicked!');
            onBackToLaboratorySelector();
          }}
          className="px-4 py-2 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 font-medium transition-colors shadow-lg border border-latte-600 cursor-pointer"
        >
          Changer de Laboratoire
        </button>
      </div>
      
      {/* 3D Scene */}
      <Scene />
      
      {/* UI Overlays */}
      <GameUI />
    </div>
  );
}

export default App;