import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { 
  User, 
  Settings, 
  Trophy, 
  Clock, 
  Save, 
  Download,
  Star,
  TrendingUp,
  Database,
  X
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { 
    userProfile, 
    loading, 
    error, 
    updateProfile,
    saveGameData,
    loadGameData,
    isDataSaved,
    lastSaveTime
  } = useUser();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userProfile?.displayName || '',
    preferences: userProfile?.preferences || {
      language: 'fr',
      theme: 'light' as const,
      notifications: true,
      autoSave: true
    }
  });

  if (!isOpen || !userProfile) return null;

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: editForm.displayName,
        preferences: editForm.preferences
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  const handleSaveGame = async () => {
    try {
      await saveGameData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du jeu:', error);
    }
  };

  const handleLoadGame = async () => {
    try {
      await loadGameData();
    } catch (error) {
      console.error('Erreur lors du chargement du jeu:', error);
    }
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getExperienceProgress = () => {
    const currentLevelExp = Math.pow(userProfile.level - 1, 2) * 100;
    const nextLevelExp = Math.pow(userProfile.level, 2) * 100;
    const progress = ((userProfile.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-sand-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-latte-700 text-sand-50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sand-200/20 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userProfile.displayName}</h2>
              <p className="text-sand-200 text-sm">Niveau {userProfile.level}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sand-200/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-sand-200">
          {[
            { id: 'profile', label: 'Profil', icon: User },
            { id: 'stats', label: 'Statistiques', icon: Trophy },
            { id: 'settings', label: 'Paramètres', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
                             onClick={() => setActiveTab(id as 'profile' | 'stats' | 'settings')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
                activeTab === id
                  ? 'text-latte-700 border-b-2 border-latte-700 bg-sand-100/50'
                  : 'text-latte-600 hover:text-latte-800 hover:bg-sand-100/30'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Profil Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="bg-sand-100/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-latte-800">Informations</h3>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) {
                        setEditForm({
                          displayName: userProfile.displayName,
                          preferences: userProfile.preferences
                        });
                      }
                    }}
                    className="text-latte-600 hover:text-latte-800 text-sm font-medium"
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-latte-700 mb-1">
                        Nom d'affichage
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          displayName: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-latte-500"
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-latte-600">Email:</span>
                      <span className="font-medium">{userProfile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-latte-600">Inscrit le:</span>
                      <span className="font-medium">
                        {userProfile.createdAt.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-latte-600">Budget:</span>
                      <span className="font-medium text-green-600">
                        {userProfile.budget.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progression du niveau */}
              <div className="bg-sand-100/50 rounded-lg p-4">
                <h3 className="font-semibold text-latte-800 mb-3">Progression</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-latte-600">Niveau {userProfile.level}</span>
                    <span className="font-medium">{userProfile.experience} XP</span>
                  </div>
                  <div className="w-full bg-sand-200 rounded-full h-3">
                    <div
                      className="bg-latte-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getExperienceProgress()}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-latte-600">
                    <Star size={16} />
                    <span>
                      {Math.pow(userProfile.level, 2) * 100 - userProfile.experience} XP 
                      jusqu'au niveau {userProfile.level + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sauvegarde */}
              <div className="bg-sand-100/50 rounded-lg p-4">
                <h3 className="font-semibold text-latte-800 mb-3">Sauvegarde</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-latte-600">État:</span>
                    <span className={`font-medium ${isDataSaved ? 'text-green-600' : 'text-orange-600'}`}>
                      {isDataSaved ? 'Sauvegardé' : 'Non sauvegardé'}
                    </span>
                  </div>
                  {lastSaveTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-latte-600">Dernière sauvegarde:</span>
                      <span className="font-medium text-sm">
                        {lastSaveTime.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveGame}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      <Save size={16} />
                      Sauvegarder
                    </button>
                    <button
                      onClick={handleLoadGame}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      <Download size={16} />
                      Charger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sand-100/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="text-latte-600" size={20} />
                    <span className="font-medium text-latte-800">Missions</span>
                  </div>
                  <div className="text-2xl font-bold text-latte-900">
                    {userProfile.statistics.missionsCompleted}
                  </div>
                  <div className="text-sm text-latte-600">complétées</div>
                </div>

                <div className="bg-sand-100/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="text-latte-600" size={20} />
                    <span className="font-medium text-latte-800">Échantillons</span>
                  </div>
                  <div className="text-2xl font-bold text-latte-900">
                    {userProfile.statistics.samplesAnalyzed}
                  </div>
                  <div className="text-sm text-latte-600">analysés</div>
                </div>

                <div className="bg-sand-100/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-latte-600" size={20} />
                    <span className="font-medium text-latte-800">Expérience</span>
                  </div>
                  <div className="text-2xl font-bold text-latte-900">
                    {userProfile.statistics.totalExperience}
                  </div>
                  <div className="text-sm text-latte-600">points totaux</div>
                </div>

                <div className="bg-sand-100/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-latte-600" size={20} />
                    <span className="font-medium text-latte-800">Temps de jeu</span>
                  </div>
                  <div className="text-2xl font-bold text-latte-900">
                    {formatPlayTime(userProfile.statistics.totalPlayTime)}
                  </div>
                  <div className="text-sm text-latte-600">au total</div>
                </div>
              </div>
            </div>
          )}

          {/* Paramètres Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-sand-100/50 rounded-lg p-4">
                <h3 className="font-semibold text-latte-800 mb-4">Préférences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-latte-700 font-medium">Sauvegarde automatique</label>
                    <input
                      type="checkbox"
                      checked={editForm.preferences.autoSave}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          autoSave: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-latte-600 rounded focus:ring-latte-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-latte-700 font-medium">Notifications</label>
                    <input
                      type="checkbox"
                      checked={editForm.preferences.notifications}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-latte-600 rounded focus:ring-latte-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-latte-700 font-medium">Thème</label>
                    <select
                      value={editForm.preferences.theme}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          theme: e.target.value as 'light' | 'dark'
                        }
                      }))}
                      className="px-3 py-1 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-latte-500"
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 