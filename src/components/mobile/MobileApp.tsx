import { useState } from 'react';
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
    <div className="min-h-screen bg-elegant-gradient">
      {/* Header */}
      <header className="bg-sand-50/95 backdrop-blur-sm shadow-sm border-b border-sand-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-latte-700 rounded-lg flex items-center justify-center shadow-md">
              <QrCode size={20} className="text-sand-50" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-latte-900">Lab Scanner</h1>
              <p className="text-xs text-latte-600">Mobile Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-latte-900">{user?.displayName || 'Utilisateur'}</p>
              <p className="text-xs text-latte-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-latte-600 hover:text-red-500 transition-colors"
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
        <h2 className="text-2xl font-bold text-latte-900 mb-2">Scanner Mobile</h2>
        <p className="text-latte-700">Scannez les codes QR des échantillons</p>
      </div>

      {/* Action principale */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('scanner')}
          className="w-full bg-gradient-to-r from-latte-600 to-latte-800 text-sand-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-sand-50/20 rounded-full flex items-center justify-center mb-4">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scanner QR Code</h3>
            <p className="text-sand-100 text-sm">Pointer l'appareil photo vers le code QR</p>
          </div>
        </button>
      </div>

      {/* Menu secondaire */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('profile')}
          className="bg-sand-50/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-sand-200"
        >
          <div className="flex flex-col items-center">
            <User size={24} className="text-latte-600 mb-2" />
            <span className="text-sm font-medium text-latte-900">Profil</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="bg-sand-50/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-sand-200"
        >
          <div className="flex flex-col items-center">
            <Settings size={24} className="text-latte-600 mb-2" />
            <span className="text-sm font-medium text-latte-900">Paramètres</span>
          </div>
        </button>
      </div>

      {/* Statut de connexion */}
      <div className="mt-8 p-4 bg-cream-100/80 rounded-xl border border-cream-200">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-cream-700" />
          <div>
            <p className="text-sm font-medium text-cream-900">Connecté</p>
            <p className="text-xs text-cream-700">Synchronisation active avec le laboratoire</p>
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
      
      <div className="bg-sand-50/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-sand-200">
        <h3 className="text-lg font-semibold text-latte-900 mb-4">Profil Utilisateur</h3>
        
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