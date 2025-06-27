import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { useGameStore } from '../stores/gameStore';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: 'missions' | 'samples' | 'equipment' | 'social' | 'exploration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    experience: number;
    money: number;
    items?: string[];
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-mission',
    name: 'Premier Pas',
    description: 'Complétez votre première mission',
    icon: '🎯',
    progress: 0,
    maxProgress: 1,
    category: 'missions',
    rarity: 'common',
    reward: { experience: 100, money: 500 }
  },
  {
    id: 'mission-master',
    name: 'Maître des Missions',
    description: 'Complétez 10 missions',
    icon: '🏆',
    progress: 0,
    maxProgress: 10,
    category: 'missions',
    rarity: 'rare',
    reward: { experience: 1000, money: 5000 }
  },
  {
    id: 'sample-analyzer',
    name: 'Analyste Expert',
    description: 'Analysez 50 échantillons',
    icon: '🔬',
    progress: 0,
    maxProgress: 50,
    category: 'samples',
    rarity: 'epic',
    reward: { experience: 2000, money: 10000 }
  },
  {
    id: 'equipment-collector',
    name: 'Collectionneur d\'Équipement',
    description: 'Achetez 5 équipements différents',
    icon: '⚙️',
    progress: 0,
    maxProgress: 5,
    category: 'equipment',
    rarity: 'rare',
    reward: { experience: 1500, money: 7500 }
  },
  {
    id: 'lab-explorer',
    name: 'Explorateur de Laboratoire',
    description: 'Visitez toutes les zones du laboratoire',
    icon: '🗺️',
    progress: 0,
    maxProgress: 8,
    category: 'exploration',
    rarity: 'common',
    reward: { experience: 500, money: 2000 }
  }
];

export function useAchievements() {
  const { userProfile, updateStatistics, addExperience } = useUser();
  const { addNotification } = useGameStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  // Initialiser les achievements avec les données utilisateur
  useEffect(() => {
    if (userProfile) {
      const updatedAchievements = ACHIEVEMENTS.map(achievement => {
        let progress = 0;
        
        // Calculer le progrès basé sur les statistiques utilisateur
        switch (achievement.id) {
          case 'first-mission':
          case 'mission-master':
            progress = userProfile.statistics.missionsCompleted;
            break;
          case 'sample-analyzer':
            progress = userProfile.statistics.samplesAnalyzed;
            break;
          case 'equipment-collector':
            progress = userProfile.statistics.equipmentPurchased;
            break;
          case 'lab-explorer':
            // À implémenter avec un système de zones visitées
            progress = 0;
            break;
        }

        const isUnlocked = progress >= achievement.maxProgress;
        
        return {
          ...achievement,
          progress: Math.min(progress, achievement.maxProgress),
          unlockedAt: isUnlocked ? new Date() : undefined
        };
      });

      setAchievements(updatedAchievements);
      setUnlockedAchievements(
        updatedAchievements
          .filter(a => a.unlockedAt)
          .map(a => a.id)
      );
    }
  }, [userProfile]);

  // Vérifier les nouveaux achievements débloqués
  const checkAchievements = async (newStats: Record<string, number>) => {
    if (!userProfile) return;

    const updatedAchievements = achievements.map(achievement => {
      let newProgress = achievement.progress;
      
      switch (achievement.id) {
        case 'first-mission':
        case 'mission-master':
          newProgress = newStats.missionsCompleted || userProfile.statistics.missionsCompleted;
          break;
        case 'sample-analyzer':
          newProgress = newStats.samplesAnalyzed || userProfile.statistics.samplesAnalyzed;
          break;
        case 'equipment-collector':
          newProgress = newStats.equipmentPurchased || userProfile.statistics.equipmentPurchased;
          break;
      }

      const wasUnlocked = unlockedAchievements.includes(achievement.id);
      const isNewlyUnlocked = !wasUnlocked && newProgress >= achievement.maxProgress;

      if (isNewlyUnlocked) {
        // Nouveau achievement débloqué
        unlockAchievement(achievement);
      }

      return {
        ...achievement,
        progress: Math.min(newProgress, achievement.maxProgress),
        unlockedAt: isNewlyUnlocked ? new Date() : achievement.unlockedAt
      };
    });

    setAchievements(updatedAchievements);
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!userProfile || unlockedAchievements.includes(achievement.id)) return;

    // Ajouter à la liste des achievements débloqués
    setUnlockedAchievements(prev => [...prev, achievement.id]);

    // Donner les récompenses
    await addExperience(achievement.reward.experience);
    await updateStatistics({
      // Ajouter l'argent au budget (à implémenter dans le profil utilisateur)
    });

    // Notification de débloquage
    addNotification({
      type: 'success',
      title: '🎉 Achievement Débloqué !',
      message: `${achievement.icon} ${achievement.name}: ${achievement.description}`
    });

    // Notification des récompenses
    addNotification({
      type: 'info',
      title: 'Récompenses Reçues',
      message: `+${achievement.reward.experience} XP, +${achievement.reward.money} €`
    });
  };

  const getAchievementsByCategory = (category: Achievement['category']) => {
    return achievements.filter(a => a.category === category);
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(a => unlockedAchievements.includes(a.id));
  };

  const getTotalAchievements = () => achievements.length;
  const getUnlockedCount = () => unlockedAchievements.length;
  const getCompletionPercentage = () => {
    return getTotalAchievements() > 0 
      ? Math.round((getUnlockedCount() / getTotalAchievements()) * 100)
      : 0;
  };

  return {
    achievements,
    unlockedAchievements,
    checkAchievements,
    unlockAchievement,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getTotalAchievements,
    getUnlockedCount,
    getCompletionPercentage
  };
} 