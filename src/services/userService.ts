import { 
  collection, 
  doc, 
  setDoc,
  getDoc, 
  updateDoc,
  query,
  getDocs,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  User as FirebaseUser 
} from 'firebase/auth';
import type { 
  User, 
  Laboratory, 
  Mission, 
  Sample, 
  Equipment,
  GameState
} from '../types';

export interface UserProfile extends Omit<User, 'createdAt' | 'lastLogin'> {
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
    autoSave: boolean;
  };
  statistics: {
    missionsCompleted: number;
    samplesAnalyzed: number;
    totalExperience: number;
    totalPlayTime: number; // en minutes
    equipmentPurchased: number;
  };
}

export interface UserGameData {
  userId: string;
  laboratory: Laboratory | null;
  missions: Mission[];
  samples: Sample[];
  equipment: Equipment[];
  gameState: Partial<GameState>;
  lastSaved: Date;
}

/**
 * Service pour gérer les comptes utilisateurs et la sauvegarde de leurs données
 */
export class UserService {
  
  /**
   * Créer ou mettre à jour le profil utilisateur après inscription/connexion
   */
  static async createOrUpdateUserProfile(
    firebaseUser: FirebaseUser,
    additionalData?: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      console.log('=== UserService.createOrUpdateUserProfile START ===');
      console.log('firebaseUser.uid:', firebaseUser.uid);
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      console.log('userRef created:', userRef.path);
      
      console.log('Checking if user document exists...');
      const userSnap = await getDoc(userRef);
      console.log('getDoc completed, exists:', userSnap.exists());
      
      const now = new Date();
      
      if (!userSnap.exists()) {
        console.log('User does not exist, creating new profile...');
        // Créer un nouveau profil utilisateur
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
          currentLaboratoryId: '', // Sera sélectionné par l'utilisateur
          memberLaboratories: [], // Laboratoires auxquels l'utilisateur appartient
          level: 1,
          experience: 0,
          budget: 10000, // Budget de départ
          createdAt: now,
          lastLogin: now,
          preferences: {
            language: 'fr',
            theme: 'light',
            notifications: true,
            autoSave: true
          },
          statistics: {
            missionsCompleted: 0,
            samplesAnalyzed: 0,
            totalExperience: 0,
            totalPlayTime: 0,
            equipmentPurchased: 0
          },
          ...additionalData
        };
        
        console.log('New profile data:', newProfile);
        console.log('Setting document...');
        
        await setDoc(userRef, {
          ...newProfile,
          createdAt: Timestamp.fromDate(newProfile.createdAt),
          lastLogin: Timestamp.fromDate(newProfile.lastLogin)
        });
        
        console.log('Document created successfully');
        console.log('=== UserService.createOrUpdateUserProfile END (NEW USER) ===');
        return newProfile;
      } else {
        console.log('User exists, updating last login...');
        // Mettre à jour la dernière connexion
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
        
        const userData = userSnap.data();
        const profile = {
          id: userSnap.id,
          ...userData,
          createdAt: userData.createdAt.toDate(),
          lastLogin: now
        } as UserProfile;
        
        console.log('Existing profile:', profile);
        console.log('=== UserService.createOrUpdateUserProfile END (EXISTING USER) ===');
        return profile;
      }
    } catch (error) {
      console.error('=== ERROR in UserService.createOrUpdateUserProfile ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }
  
  /**
   * Récupérer le profil utilisateur
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          id: userSnap.id,
          ...userData,
          createdAt: userData.createdAt.toDate(),
          lastLogin: userData.lastLogin.toDate()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Exclure les champs de date qui ne doivent pas être mis à jour directement
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, lastLogin, ...updateData } = updates;
      
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Sauvegarder les données de jeu de l'utilisateur
   */
  static async saveUserGameData(userId: string, gameData: Omit<UserGameData, 'userId' | 'lastSaved'>): Promise<void> {
    try {
      const gameDataRef = doc(db, 'userGameData', userId);
      
      await setDoc(gameDataRef, {
        userId,
        ...gameData,
        lastSaved: serverTimestamp()
      }, { merge: true });
      
    } catch (error) {
      console.error('Error saving user game data:', error);
      throw error;
    }
  }
  
  /**
   * Charger les données de jeu de l'utilisateur
   */
  static async loadUserGameData(userId: string): Promise<UserGameData | null> {
    try {
      const gameDataRef = doc(db, 'userGameData', userId);
      const gameDataSnap = await getDoc(gameDataRef);
      
      if (gameDataSnap.exists()) {
        const data = gameDataSnap.data();
        return {
          ...data,
          lastSaved: data.lastSaved.toDate()
        } as UserGameData;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user game data:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour le laboratoire actuel de l'utilisateur
   */
  static async setCurrentLaboratory(userId: string, laboratoryId: string): Promise<void> {
    try {
      await this.updateUserProfile(userId, { 
        currentLaboratoryId: laboratoryId 
      });
    } catch (error) {
      console.error('Error setting current laboratory:', error);
      throw error;
    }
  }
  
  /**
   * Ajouter un laboratoire à la liste des laboratoires de l'utilisateur
   */
  static async addUserToLaboratory(userId: string, laboratoryId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        memberLaboratories: arrayUnion(laboratoryId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding user to laboratory:', error);
      throw error;
    }
  }
  
  /**
   * Retirer un laboratoire de la liste des laboratoires de l'utilisateur
   */
  static async removeUserFromLaboratory(userId: string, laboratoryId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        memberLaboratories: arrayRemove(laboratoryId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing user from laboratory:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour les statistiques utilisateur
   */
  static async updateUserStatistics(
    userId: string, 
    stats: Partial<UserProfile['statistics']>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentData = userSnap.data() as UserProfile;
        const updatedStats = {
          ...currentData.statistics,
          ...stats
        };
        
        await updateDoc(userRef, {
          statistics: updatedStats,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user statistics:', error);
      throw error;
    }
  }
  
  /**
   * Calculer et mettre à jour le niveau utilisateur basé sur l'expérience
   */
  static async updateUserLevel(userId: string, newExperience: number): Promise<number> {
    try {
      // Formule simple pour le niveau : niveau = floor(sqrt(experience/100)) + 1
      const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;
      
      await this.updateUserProfile(userId, {
        level: newLevel,
        experience: newExperience
      });
      
      return newLevel;
    } catch (error) {
      console.error('Error updating user level:', error);
      throw error;
    }
  }
  
  /**
   * Obtenir le classement des utilisateurs par expérience
   */
  static async getUserLeaderboard(limit: number = 10): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        lastLogin: doc.data().lastLogin.toDate()
      })) as UserProfile[];
      
      // Trier par expérience et prendre les premiers
      return users
        .sort((a, b) => b.experience - a.experience)
        .slice(0, limit);
      
    } catch (error) {
      console.error('Error getting user leaderboard:', error);
      throw error;
    }
  }
} 