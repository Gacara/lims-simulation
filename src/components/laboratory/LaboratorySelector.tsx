import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { LaboratoryService } from '../../services/laboratoryService';
import { 
  Plus, 
  Users, 
  Settings, 
  Copy,
  Check,
  X,
  Building2,
  UserPlus,
  Shield,
  Camera
} from 'lucide-react';
import type { Laboratory } from '../../types';

interface LaboratorySelectorProps {
  onLaboratorySelected: (laboratory: Laboratory) => void;
  currentLaboratory?: Laboratory | null;
}

// Composant pour l'image de prévisualisation du laboratoire
interface LaboratoryPreviewImageProps {
  laboratory: Laboratory;
  className?: string;
}

function LaboratoryPreviewImage({ laboratory, className = '' }: LaboratoryPreviewImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Chercher une image sauvegardée pour ce laboratoire
    const savedImage = localStorage.getItem(`lab-preview-${laboratory.id}`);
    if (savedImage) {
      setImageUrl(savedImage);
    } else {
      // Générer une image placeholder basée sur les caractéristiques du laboratoire
      generatePlaceholderImage();
    }
  }, [laboratory.id]);

  const generatePlaceholderImage = () => {
    // Créer un canvas pour générer une image de placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Gradient de fond basé sur le niveau du laboratoire
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      const hue = (laboratory.level * 30) % 360;
      gradient.addColorStop(0, `hsl(${hue}, 30%, 85%)`);
      gradient.addColorStop(1, `hsl(${hue + 20}, 25%, 75%)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);
      
      // Dessiner des équipements représentés par des rectangles
      ctx.fillStyle = `hsl(${hue}, 40%, 60%)`;
      laboratory.equipment.forEach((_, index) => {
        const x = (index % 3) * 120 + 40;
        const y = Math.floor(index / 3) * 80 + 80;
        ctx.fillRect(x, y, 80, 60);
        ctx.fillStyle = `hsl(${hue}, 20%, 90%)`;
        ctx.fillRect(x + 10, y + 10, 60, 40);
        ctx.fillStyle = `hsl(${hue}, 40%, 60%)`;
      });
      
      // Texte du niveau
      ctx.fillStyle = `hsl(${hue}, 60%, 40%)`;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Niveau ${laboratory.level}`, 200, 40);
      
      // Texte du nombre d'équipements
      ctx.font = '16px sans-serif';
      ctx.fillText(`${laboratory.equipment.length} équipements`, 200, 270);
      
      const imageUrl = canvas.toDataURL('image/png');
      setImageUrl(imageUrl);
      
      // Sauvegarder l'image dans localStorage
      localStorage.setItem(`lab-preview-${laboratory.id}`, imageUrl);
    }
  };

  const captureFromCanvas = () => {
    setIsGenerating(true);
    
    // Dans un vrai projet, on capturerait le canvas 3D ici
    // Pour l'instant, on génère juste une nouvelle image
    setTimeout(() => {
      generatePlaceholderImage();
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className={`relative group ${className}`}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`Aperçu du laboratoire ${laboratory.name}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-latte-100 to-sand-200">
          <div className="text-center">
            <Building2 size={48} className="mx-auto text-latte-400 mb-2" />
            <p className="text-latte-600 text-sm font-medium">Laboratoire {laboratory.level}</p>
            <p className="text-latte-500 text-xs">{laboratory.equipment.length} équipements</p>
          </div>
        </div>
      )}
      
      {/* Bouton pour regénérer l'image */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          captureFromCanvas();
        }}
        className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
        title="Regénérer l'aperçu"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Camera size={16} />
        )}
      </button>
    </div>
  );
}

export function LaboratorySelector({ onLaboratorySelected, currentLaboratory }: LaboratorySelectorProps) {
  const { userProfile } = useUser();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedInviteCode, setCopiedInviteCode] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    if (userProfile) {
      loadUserLaboratories();
    }
  }, [userProfile]);

  const loadUserLaboratories = async () => {
    if (!userProfile) return;
    
    try {
      console.log('=== LOADING USER LABORATORIES ===');
      console.log('userProfile.id:', userProfile.id);
      console.log('userProfile.memberLaboratories:', userProfile.memberLaboratories);
      
      setLoading(true);
      const labs = await LaboratoryService.getUserLaboratories(userProfile.id);
      console.log('Laboratories loaded:', labs);
      console.log('Number of laboratories:', labs.length);
      setLaboratories(labs);
    } catch (err) {
      console.error('Error loading laboratories:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLaboratory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setLoading(true);
      const newLab = await LaboratoryService.createLaboratory(
        userProfile.id,
        userProfile.displayName,
        userProfile.email,
        createForm
      );
      
      await loadUserLaboratories();
      setShowCreateForm(false);
      setCreateForm({ name: '', description: '', isPublic: false });
      onLaboratorySelected(newLab);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLaboratory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !inviteCode.trim()) return;

    try {
      setLoading(true);
      const joinedLab = await LaboratoryService.joinLaboratory(
        inviteCode.trim().toUpperCase(),
        userProfile.id,
        userProfile.displayName,
        userProfile.email
      );
      
      await loadUserLaboratories();
      setShowJoinForm(false);
      setInviteCode('');
      onLaboratorySelected(joinedLab);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'adhésion');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedInviteCode(true);
      setTimeout(() => setCopiedInviteCode(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && laboratories.length === 0) {
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="text-latte-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-latte-600 mx-auto mb-4"></div>
          <p className="font-medium">Chargement des laboratoires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elegant-gradient flex items-center justify-center p-4">
      <div className="bg-sand-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-latte-700 text-sand-50 p-6">
          <h1 className="text-3xl font-bold mb-2">Bienvenue dans LIMS Simulation</h1>
          <p className="text-sand-200">
            {currentLaboratory 
              ? `Laboratoire actuel : ${currentLaboratory.name} • Choisissez un autre laboratoire ou continuez`
              : 'Sélectionnez un laboratoire pour commencer votre simulation'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-b border-sand-200">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 font-medium"
            >
              <Plus size={20} />
              Créer un Laboratoire
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-latte-700 text-latte-700 rounded-lg hover:bg-latte-50 font-medium"
            >
              <UserPlus size={20} />
              Rejoindre un Laboratoire
            </button>
          </div>
        </div>

        {/* Laboratories List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {laboratories.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-latte-400 mb-4" />
              <h3 className="text-lg font-medium text-latte-800 mb-2">
                Aucun laboratoire trouvé
              </h3>
              <p className="text-latte-600">
                Créez votre premier laboratoire ou rejoignez-en un existant
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-latte-800 mb-6">
                Vos Laboratoires ({laboratories.length})
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {laboratories.map((lab) => {
                  const userMember = lab.members.find(m => m.userId === userProfile?.id);
                  const isCurrentLab = currentLaboratory?.id === lab.id;
                  return (
                    <div
                      key={lab.id}
                      className={`group relative bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 ${
                        isCurrentLab 
                          ? 'border-latte-400 ring-4 ring-latte-200 bg-latte-50' 
                          : 'border-transparent hover:border-latte-300'
                      }`}
                      onClick={() => onLaboratorySelected(lab)}
                    >
                      {/* Image de prévisualisation du laboratoire */}
                      <div className="relative h-32 bg-gradient-to-br from-latte-100 to-sand-200 overflow-hidden">
                        <LaboratoryPreviewImage laboratory={lab} className="w-full h-full object-cover" />
                        
                        {/* Badge de statut en haut à droite */}
                        {isCurrentLab && (
                          <div className="absolute top-2 right-2 bg-latte-700 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Actuel
                          </div>
                        )}
                        
                        {/* Badge de rôle en haut à gauche */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userMember?.role || 'member')}`}>
                          {userMember?.role === 'owner' ? '👑 Propriétaire' : 
                           userMember?.role === 'admin' ? '⚡ Admin' : '👤 Membre'}
                        </div>
                      </div>
                      
                      {/* Contenu de la carte */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-latte-800 mb-1 group-hover:text-latte-900">
                              {lab.name}
                            </h3>
                            <p className="text-latte-600 text-sm leading-relaxed mb-3 overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {lab.description || 'Aucune description disponible'}
                            </p>
                          </div>
                          {(userMember?.role === 'owner' || userMember?.permissions.canManageMembers) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLab(lab);
                                setShowInviteModal(true);
                              }}
                              className="p-2 text-latte-600 hover:text-latte-800 hover:bg-sand-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Gérer les invitations"
                            >
                              <Settings size={16} />
                            </button>
                          )}
                        </div>
                        
                        {/* Statistiques du laboratoire */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-sand-50 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Users size={14} className="text-latte-600" />
                              <span className="text-latte-800 font-semibold text-sm">{lab.members.length}</span>
                            </div>
                            <p className="text-latte-600 text-xs">Membre{lab.members.length > 1 ? 's' : ''}</p>
                          </div>
                          <div className="bg-sand-50 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Shield size={14} className="text-latte-600" />
                              <span className="text-latte-800 font-semibold text-sm">{lab.level}</span>
                            </div>
                            <p className="text-latte-600 text-xs">Niveau</p>
                          </div>
                        </div>
                        
                        {/* Bouton d'action */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-latte-500">
                            Créé le {new Date(lab.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-2 text-latte-600 group-hover:text-latte-800 transition-colors">
                            <span className="text-sm font-medium">
                              {isCurrentLab ? 'Continuer' : 'Ouvrir'}
                            </span>
                            <div className="w-5 h-5 rounded-full bg-latte-100 flex items-center justify-center group-hover:bg-latte-200 transition-colors">
                              <span className="text-xs">→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Create Laboratory Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-sand-50 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-bold text-latte-800 mb-4">Créer un Laboratoire</h3>
                <form onSubmit={handleCreateLaboratory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-latte-700 mb-1">
                      Nom du laboratoire
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-latte-500"
                      placeholder="Mon Laboratoire"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-latte-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-latte-500"
                      placeholder="Description du laboratoire..."
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-latte-600 hover:text-latte-800 font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !createForm.name.trim()}
                      className="px-4 py-2 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Join Laboratory Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-sand-50 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-bold text-latte-800 mb-4">Rejoindre un Laboratoire</h3>
                <form onSubmit={handleJoinLaboratory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-latte-700 mb-1">
                      Code d'invitation
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      required
                      maxLength={8}
                      className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-latte-500 font-mono text-center text-lg tracking-wider"
                      placeholder="ABC12345"
                    />
                    <p className="text-xs text-latte-600 mt-1">
                      Entrez le code d'invitation fourni par le propriétaire du laboratoire
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(false)}
                      className="px-4 py-2 text-latte-600 hover:text-latte-800 font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !inviteCode.trim()}
                      className="px-4 py-2 bg-latte-700 text-sand-50 rounded-lg hover:bg-latte-800 disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Connexion...' : 'Rejoindre'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && selectedLab && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-sand-50 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-bold text-latte-800 mb-4">Code d'Invitation</h3>
                <p className="text-latte-600 mb-4">
                  Partagez ce code avec d'autres utilisateurs pour les inviter à rejoindre votre laboratoire.
                </p>
                <div className="bg-sand-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-latte-800 tracking-wider">
                      {selectedLab.inviteCode}
                    </span>
                    <button
                      onClick={() => copyInviteCode(selectedLab.inviteCode || '')}
                      className="p-2 text-latte-600 hover:text-latte-800 hover:bg-sand-200 rounded-lg transition-colors"
                      title="Copier le code"
                    >
                      {copiedInviteCode ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-latte-600 hover:text-latte-800 font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 