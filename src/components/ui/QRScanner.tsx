import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Camera, AlertCircle } from 'lucide-react';

export function QRScanner() {
  const { toggleQRScanner, addNotification } = useGameStore();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    startScanning();
    
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      // Configuration optimisée pour mobile et desktop
      const constraints = {
        video: {
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Important pour iOS
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Erreur d\'accès caméra:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (result: string) => {
    if (!result.trim()) return;
    
    addNotification({
      type: 'success',
      title: 'Code QR Scanné',
      message: `Code scanné: ${result}`,
    });
    
    // Fermer le scanner après un scan réussi
    toggleQRScanner();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
    }
  };

  // Simulation de scan pour test (clic sur la vidéo)
  const handleVideoClick = () => {
    if (isScanning) {
      // Pour les tests - générer un ID d'échantillon factice
      const testSampleId = `SAMPLE-${Date.now().toString().slice(-6)}`;
      handleScanResult(testSampleId);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              Scanner QR
            </h2>
          </div>
          <button
            onClick={toggleQRScanner}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Erreur Caméra
              </h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera viewport */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleVideoClick}
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-4 border-2 border-white rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Démarrage caméra...</p>
                    </div>
                  </div>
                )}

                {/* Instructions pour test */}
                {isScanning && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
                    📱 Cliquez sur la vidéo pour simuler un scan (test)
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Positionnez le code QR dans le cadre pour le scanner
                </p>
              </div>

              {/* Manual input fallback */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Ou saisissez l'ID d'échantillon manuellement :
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ID Échantillon"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleManualSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={!manualInput.trim()}
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}