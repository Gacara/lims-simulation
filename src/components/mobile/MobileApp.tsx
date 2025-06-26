import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { QrCode, User, LogOut, Settings, Camera, CheckCircle } from 'lucide-react';
import { MobileQRScanner } from './MobileQRScanner';

type MobileView = 'menu' | 'scanner' | 'profile' | 'settings';

export function MobileApp() {
  const [currentView, setCurrentView] = useState<MobileView>('menu');
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const renderView = () => {
    switch (currentView) {
      case 'scanner':
        return <MobileQRScanner onBack={() => setCurrentView('menu')} />;
      case 'profile':
        return <ProfileView onBack={() => setCurrentView('menu')} />;
      case 'settings':
        return <SettingsView onBack={() => setCurrentView('menu')} />;
      default:
        return <MenuView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Lab Scanner</h1>
              <p className="text-xs text-gray-500">Mobile Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {renderView()}
      </main>
    </div>
  );
}

// Menu principal
function MenuView({ onNavigate }: { onNavigate: (view: MobileView) => void }) {
  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scanner Mobile</h2>
        <p className="text-gray-600">Scannez les codes QR des échantillons</p>
      </div>

      {/* Action principale */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('scanner')}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scanner QR Code</h3>
            <p className="text-blue-100 text-sm">Pointer l'appareil photo vers le code QR</p>
          </div>
        </button>
      </div>

      {/* Menu secondaire */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('profile')}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center">
            <User size={24} className="text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Profil</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center">
            <Settings size={24} className="text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Paramètres</span>
          </div>
        </button>
      </div>

      {/* Statut de connexion */}
      <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Connecté</p>
            <p className="text-xs text-green-600">Synchronisation active avec le laboratoire</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vue profil
function ProfileView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 font-medium"
      >
        ← Retour
      </button>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Utilisateur</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Nom d'affichage</label>
            <p className="text-gray-900">{user?.displayName || 'Non défini'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">ID Utilisateur</label>
            <p className="text-xs text-gray-600 font-mono">{user?.uid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vue paramètres
function SettingsView({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 font-medium"
      >
        ← Retour
      </button>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-900">Notifications</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-900">Mode sombre</span>
            <input type="checkbox" className="toggle" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-900">Vibrations</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
} 