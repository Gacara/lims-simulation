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
        <div className="bg-sand-100/90 backdrop-blur-sm text-latte-800 px-4 py-2 rounded-lg shadow-lg border border-sand-200">
          <div className="text-sm font-medium">Dr. Scientist</div>
          <div className="text-xs text-latte-600">Level 1 • $5,000</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={toggleLIMS}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors shadow-lg border ${
              ui.showLIMS 
                ? 'bg-latte-700 text-sand-50 border-latte-600' 
                : 'bg-sand-100/90 text-latte-800 hover:bg-sand-200/90 border-sand-200'
            }`}
            title="Laboratory Information Management System"
          >
            <Beaker size={20} />
          </button>
          
          <button
            onClick={toggleInventory}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors shadow-lg border ${
              ui.showInventory 
                ? 'bg-latte-700 text-sand-50 border-latte-600' 
                : 'bg-sand-100/90 text-latte-800 hover:bg-sand-200/90 border-sand-200'
            }`}
            title="Inventory"
          >
            <Package size={20} />
          </button>
          
          <button
            onClick={toggleMissions}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors shadow-lg border ${
              ui.showMissions 
                ? 'bg-latte-700 text-sand-50 border-latte-600' 
                : 'bg-sand-100/90 text-latte-800 hover:bg-sand-200/90 border-sand-200'
            }`}
            title="Missions"
          >
            <Target size={20} />
          </button>
          
          <button
            onClick={toggleQRScanner}
            className={`p-3 rounded-lg backdrop-blur-sm transition-colors shadow-lg border ${
              ui.showQRScanner 
                ? 'bg-latte-700 text-sand-50 border-latte-600' 
                : 'bg-sand-100/90 text-latte-800 hover:bg-sand-200/90 border-sand-200'
            }`}
            title="QR Code Scanner"
          >
            <QrCode size={20} />
          </button>
        </div>
      </div>

      {/* Bottom controls info */}
      <div className="absolute bottom-4 left-4 bg-sand-100/90 backdrop-blur-sm text-latte-800 px-4 py-2 rounded-lg text-sm shadow-lg border border-sand-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-latte-600">Movement:</div>
            <div className="font-medium">WASD / Arrow Keys</div>
          </div>
          <div>
            <div className="text-latte-600">Interact:</div>
            <div className="font-medium">E / Space</div>
          </div>
        </div>
      </div>

      {/* Player position debug info (development only) */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-4 right-4 bg-sand-100/90 backdrop-blur-sm text-latte-800 px-3 py-2 rounded-lg text-xs font-mono shadow-lg border border-sand-200">
          <div>X: {player.position.x.toFixed(2)}</div>
          <div>Y: {player.position.y.toFixed(2)}</div>
          <div>Z: {player.position.z.toFixed(2)}</div>
          <div>Moving: {player.isMoving ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}