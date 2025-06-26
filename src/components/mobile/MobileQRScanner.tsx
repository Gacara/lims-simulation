import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

interface ScanResult {
  success: boolean;
  message: string;
  data?: unknown;
}

interface MobileQRScannerProps {
  onBack: () => void;
}

export function MobileQRScanner({ onBack }: MobileQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isScanning) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: []
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);
    
    scannerRef.current.render(
      (decodedText, decodedResult) => {
        handleScanSuccess(decodedText, decodedResult);
      },
      (error) => {
        // Ignore scan errors (too frequent)
        console.debug('QR scan error:', error);
      }
    );
  };

  const handleScanSuccess = async (decodedText: string, decodedResult: unknown) => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      setIsScanning(false);
    }

    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      
      // Validate QR code structure
      if (qrData.type === 'sample' && qrData.sampleId && qrData.laboratoryId) {
        // Send scan data to Firestore for real-time sync with desktop
        await saveScanToFirestore(qrData);
        
        setScanResult({
          success: true,
          message: `Échantillon scanné: ${qrData.sampleId}`,
          data: qrData
        });
      } else {
        setScanResult({
          success: false,
          message: 'Code QR invalide - pas un échantillon de laboratoire'
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Code QR non reconnu ou corrompu'
      });
    }
  };

  const saveScanToFirestore = async (qrData: unknown) => {
    if (!user) return;

    const scanData = {
      qrData,
      scannedBy: user.uid,
      scannedAt: new Date(),
      deviceType: 'mobile',
      processed: false
    };

    // Save to a scans collection for real-time sync
    const scanId = `scan_${Date.now()}_${user.uid}`;
    await setDoc(doc(db, 'scans', scanId), scanData);
  };

  const startScanning = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Scanner QR</h1>
            <p className="text-sm text-gray-500">Échantillons de laboratoire</p>
          </div>
        </div>
      </div>

      {/* Scanner Content */}
      <div className="p-6">
        {!isScanning && !scanResult && (
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera size={48} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Scanner un échantillon
            </h2>
            <p className="text-gray-600 mb-8">
              Pointez votre caméra vers le code QR de l'échantillon pour l'enregistrer automatiquement dans le système.
            </p>
            <button
              onClick={startScanning}
              className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition-colors"
            >
              Démarrer le scan
            </button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div id="qr-reader" className="w-full"></div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Positionnez le code QR dans le cadre
              </p>
              <button
                onClick={() => setIsScanning(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl ${
              scanResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {scanResult.success ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <AlertCircle size={24} className="text-red-600" />
                )}
                <h3 className={`font-semibold ${
                  scanResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {scanResult.success ? 'Scan réussi !' : 'Erreur de scan'}
                </h3>
              </div>
              <p className={`${
                scanResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {scanResult.message}
              </p>
            </div>

            {scanResult.success && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">Données synchronisées</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Les informations de l'échantillon ont été transmises au système de laboratoire en temps réel.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-mono">
                    {JSON.stringify(scanResult.data, null, 2)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetScanner}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
              >
                Scanner un autre
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-300 transition-colors"
              >
                Retour au menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-700 text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Instructions</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Tenez votre téléphone stable</li>
              <li>• Assurez-vous que l'éclairage est suffisant</li>
              <li>• Le code QR doit être entièrement visible</li>
              <li>• Attendez le bip de confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 