import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserService, type UserProfile, type UserGameData } from '../services/userService';
import { useGameStore } from '../stores/gameStore';
// Types importés pour la cohérence avec UserGameData - utilisés indirectement

interface UseUserReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveGameData: () => Promise<void>;
  loadGameData: () => Promise<void>;
  updateStatistics: (stats: Partial<UserProfile['statistics']>) => Promise<void>;
  addExperience: (amount: number) => Promise<void>;
  
  // État
  isDataSaved: boolean;
  lastSaveTime: Date | null;
}

export function useUser(): UseUserReturn {
  const { user: firebaseUser, isAuthenticated } = useAuth();
  const gameStore = useGameStore();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataSaved, setIsDataSaved] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Charger ou créer le profil utilisateur quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated && firebaseUser) {
      initializeUser();
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated, firebaseUser]);
  
  // Sauvegarde automatique des données de jeu
  useEffect(() => {
    let saveInterval: NodeJS.Timeout;
    
    if (userProfile?.preferences.autoSave && isAuthenticated) {
      // Sauvegarder toutes les 2 minutes
      saveInterval = setInterval(() => {
        saveGameData();
      }, 120000);
    }
    
    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [userProfile?.preferences.autoSave, isAuthenticated]);
  
  // Marquer les données comme non sauvegardées quand le state du jeu change
  useEffect(() => {
    if (userProfile && isAuthenticated) {
      setIsDataSaved(false);
    }
  }, [
    gameStore.currentLaboratory,
    gameStore.activeMissions,
    gameStore.inventory,
    gameStore.currentSample
  ]);
  
  const initializeUser = async () => {
    if (!firebaseUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Créer ou mettre à jour le profil utilisateur
      const profile = await UserService.createOrUpdateUserProfile(firebaseUser);
      setUserProfile(profile);
      
      // L'utilisateur devra choisir un laboratoire via LaboratorySelector
      // Plus de création automatique de laboratoire
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'initialisation utilisateur');
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    try {
      setError(null);
      await UserService.updateUserProfile(userProfile.id, updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
      throw err;
    }
  };
  
  const saveGameData = async () => {
    if (!userProfile) return;
    
    try {
      setError(null);
      
      const gameData: Omit<UserGameData, 'userId' | 'lastSaved'> = {
        laboratory: gameStore.currentLaboratory,
        missions: gameStore.activeMissions,
        samples: [], // Sera chargé depuis la base de données
        equipment: gameStore.currentLaboratory?.equipment || [],
        gameState: {
          player: gameStore.player,
          inventory: gameStore.inventory,
          currentSample: gameStore.currentSample,
          ui: gameStore.ui
        }
      };
      
      await UserService.saveUserGameData(userProfile.id, gameData);
      setIsDataSaved(true);
      setLastSaveTime(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      throw err;
    }
  };
  
  const loadGameData = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const gameData = await UserService.loadUserGameData(userProfile.id);
      
      if (gameData) {
        // Restaurer l'état du jeu
        if (gameData.laboratory) {
          gameStore.setCurrentLaboratory(gameData.laboratory);
        }
        
        if (gameData.missions?.length > 0) {
          gameStore.setActiveMissions(gameData.missions);
        }
        
        if (gameData.gameState) {
          // Restaurer l'état du joueur
          if (gameData.gameState.player) {
            const player = gameData.gameState.player;
            if (player.position) gameStore.updatePlayerPosition(player.position);
            if (typeof player.rotation === 'number') gameStore.updatePlayerRotation(player.rotation);
          }
          
          // Restaurer l'inventaire
          // Note: Le store actuel n'a pas de méthode pour définir l'inventaire
          // Il faudra l'ajouter si nécessaire
          
          // Restaurer l'échantillon actuel
          if (gameData.gameState.currentSample) {
            gameStore.setCurrentSample(gameData.gameState.currentSample);
          }
        }
        
        setLastSaveTime(gameData.lastSaved);
        setIsDataSaved(true);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateStatistics = async (stats: Partial<UserProfile['statistics']>) => {
    if (!userProfile) return;
    
    try {
      setError(null);
      await UserService.updateUserStatistics(userProfile.id, stats);
      
      // Mettre à jour localement
      setUserProfile(prev => prev ? {
        ...prev,
        statistics: { ...prev.statistics, ...stats }
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des statistiques');
      throw err;
    }
  };
  
  const addExperience = async (amount: number) => {
    if (!userProfile) return;
    
    try {
      setError(null);
      const newExperience = userProfile.experience + amount;
      const newTotalExperience = userProfile.statistics.totalExperience + amount;
      
      // Calculer le nouveau niveau
      const newLevel = await UserService.updateUserLevel(userProfile.id, newExperience);
      
      // Mettre à jour les statistiques
      await updateStatistics({ totalExperience: newTotalExperience });
      
      // Mettre à jour localement
      setUserProfile(prev => prev ? {
        ...prev,
        level: newLevel,
        experience: newExperience,
        statistics: {
          ...prev.statistics,
          totalExperience: newTotalExperience
        }
      } : null);
      
      // Notification si niveau supérieur
      if (newLevel > userProfile.level) {
        gameStore.addNotification({
          type: 'success',
          title: 'Niveau supérieur !',
          message: `Félicitations ! Vous avez atteint le niveau ${newLevel} !`
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout d\'expérience');
      throw err;
    }
  };
  
  return {
    userProfile,
    loading,
    error,
    updateProfile,
    saveGameData,
    loadGameData,
    updateStatistics,
    addExperience,
    isDataSaved,
    lastSaveTime
  };
} 