import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { LIMSInterface } from './LIMSInterface';
import { MissionPanel } from './MissionPanel';
import { InventoryPanel } from './InventoryPanel';
import { QRScanner } from './QRScanner';
import { NotificationPanel } from './NotificationPanel';
import { HUD } from './HUD';
import { UserProfile } from './UserProfile';

export function GameUI() {
  const { ui } = useGameStore();
  const [showUserProfile, setShowUserProfile] = useState(false);

  return (
    <>
      {/* Heads-Up Display */}
      <HUD onOpenProfile={() => setShowUserProfile(true)} />

      {/* Notification Panel */}
      <NotificationPanel />

      {/* LIMS Interface */}
      {ui.showLIMS && <LIMSInterface />}

      {/* Mission Panel */}
      {ui.showMissions && <MissionPanel />}

      {/* Inventory Panel */}
      {ui.showInventory && <InventoryPanel />}

      {/* QR Code Scanner */}
      {ui.showQRScanner && <QRScanner />}

      {/* User Profile */}
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </>
  );
}