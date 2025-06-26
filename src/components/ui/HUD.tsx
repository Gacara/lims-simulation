import { useGameStore } from '../../stores/gameStore';
import { 
  Beaker, 
  Package, 
  Target, 
  QrCode
} from 'lucide-react';

export function HUD() {
  const { 
    toggleLIMS, 
    toggleInventory, 
    toggleMissions, 
    toggleQRScanner,
    ui,
    player 
  } = useGameStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Player info */}
        <div className="bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-medium">Dr. Scientist</div>
          <div className="text-xs opacity-80">Level 1 • $5,000</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={toggleLIMS}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors ${
              ui.showLIMS 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
            title="Laboratory Information Management System"
          >
            <Beaker size={20} />
          </button>
          
          <button
            onClick={toggleInventory}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors ${
              ui.showInventory 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
            title="Inventory"
          >
            <Package size={20} />
          </button>
          
          <button
            onClick={toggleMissions}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors ${
              ui.showMissions 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
            title="Missions"
          >
            <Target size={20} />
          </button>
          
          <button
            onClick={toggleQRScanner}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors ${
              ui.showQRScanner 
                ? 'bg-blue-500/80 text-white' 
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
            title="QR Code Scanner"
          >
            <QrCode size={20} />
          </button>
        </div>
      </div>

      {/* Bottom controls info */}
      <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-80">Movement:</div>
            <div>WASD / Arrow Keys</div>
          </div>
          <div>
            <div className="opacity-80">Interact:</div>
            <div>E / Space</div>
          </div>
        </div>
      </div>

      {/* Player position debug info (development only) */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-mono">
          <div>X: {player.position.x.toFixed(2)}</div>
          <div>Y: {player.position.y.toFixed(2)}</div>
          <div>Z: {player.position.z.toFixed(2)}</div>
          <div>Moving: {player.isMoving ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}