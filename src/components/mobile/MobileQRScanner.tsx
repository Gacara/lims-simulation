import React from 'react';
import { ArrowLeft, Camera } from 'lucide-react';

interface MobileQRScannerProps {
  onBack: () => void;
}

export function MobileQRScanner({ onBack }: MobileQRScannerProps) {
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-latte-700 font-medium"
      >
        <ArrowLeft size={20} />
        Retour
      </button>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-latte-900 mb-2">Scanner QR</h2>
        <p className="text-latte-700">Pointez votre appareil photo vers le code QR</p>
      </div>

      {/* Zone de scan simulée */}
      <div className="bg-sand-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-sand-200 mb-6">
        <div className="aspect-square bg-sand-100 rounded-xl flex items-center justify-center border-2 border-dashed border-latte-400">
          <div className="text-center">
            <Camera size={48} className="mx-auto text-latte-500 mb-4" />
            <p className="text-latte-600 font-medium">Scanner activé</p>
            <p className="text-sm text-latte-500 mt-2">Placez le code QR dans le cadre</p>
          </div>
        </div>
      </div>

      <div className="bg-cream-100/80 rounded-xl p-4 border border-cream-200">
        <h4 className="font-medium text-cream-900 mb-2">Instructions</h4>
        <ul className="text-sm text-cream-700 space-y-1">
          <li>• Maintenez votre appareil stable</li>
          <li>• Assurez-vous que le code QR est bien éclairé</li>
          <li>• Attendez que le scan soit automatiquement détecté</li>
        </ul>
      </div>
    </div>
  );
} 