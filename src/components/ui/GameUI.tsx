import { useGameStore } from '../../stores/gameStore';
import { LIMSInterface } from './LIMSInterface';
import { MissionPanel } from './MissionPanel';
import { InventoryPanel } from './InventoryPanel';
import { QRScanner } from './QRScanner';
import { NotificationPanel } from './NotificationPanel';
import { HUD } from './HUD';

export function GameUI() {
  const { ui } = useGameStore();

  return (
    <>
      {/* Heads-Up Display */}
      <HUD />

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
    </>
  );
}