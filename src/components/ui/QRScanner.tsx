import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Camera, AlertCircle } from 'lucide-react';

export function QRScanner() {
  const { toggleQRScanner, addNotification } = useGameStore();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startScanning();
    
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera access error:', err);
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
    // TODO: Implement QR code validation logic
    addNotification({
      type: 'success',
      title: 'QR Code Scanned',
      message: `Scanned code: ${result}`,
    });
    
    // Close scanner after successful scan
    toggleQRScanner();
  };

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">
              QR Code Scanner
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
                Camera Error
              </h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
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
                  className="w-full h-full object-cover"
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
                      <p className="text-sm opacity-75">Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Position the QR code within the frame to scan
                </p>
              </div>

              {/* Manual input fallback */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Or enter sample ID manually:
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Sample ID"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleScanResult('manual-input')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit
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