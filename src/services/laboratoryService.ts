import { 
  collection, 
  doc, 
  setDoc,
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  Laboratory, 
  LaboratoryMember, 
  LaboratoryPermissions
} from '../types';

/**
 * Service pour gérer les laboratoires partagés et les invitations
 */
export class LaboratoryService {
  
  /**
   * Créer un nouveau laboratoire
   */
  static async createLaboratory(
    ownerId: string,
    ownerName: string,
    ownerEmail: string,
    labData: {
      name: string;
      description: string;
      isPublic?: boolean;
    }
  ): Promise<Laboratory> {
    try {
      const labRef = doc(collection(db, 'laboratories'));
      const inviteCode = this.generateInviteCode();
      
      const ownerMember: LaboratoryMember = {
        userId: ownerId,
        displayName: ownerName,
        email: ownerEmail,
        role: 'owner',
        joinedAt: new Date(),
        permissions: {
          canManageMembers: true,
          canManageEquipment: true,
          canManageMissions: true,
          canManageSamples: true,
          canModifyLayout: true
        }
      };

      const laboratory: Omit<Laboratory, 'id' | 'createdAt' | 'updatedAt'> = {
        name: labData.name,
        description: labData.description,
        ownerId,
        members: [ownerMember],
        level: 1,
        layout: {
          width: 20,
          height: 15,
          objects: [
            {
              id: 'basic-bench',
              type: 'furniture',
              position: { x: 5, y: 0, z: 5 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 }
            }
          ]
        },
        equipment: [
          {
            id: 'starter-balance',
            type: 'balance',
            name: 'Balance Analytique Basique',
            brand: 'LabTech',
            model: 'LT-200',
            purchasePrice: 2000,
            maintenanceCost: 50,
            capabilities: [{
              technique: 'pesage',
              matrices: ['solid', 'liquid'],
              detectionLimit: 0.1,
              accuracy: 0.01,
              precision: 0.005,
              analysisTime: 1
            }],
            status: 'operational',
            configuration: {},
            purchasedAt: new Date(),
            lastMaintenance: new Date()
          }
        ],
        isPublic: labData.isPublic || false,
        inviteCode
      };

      await setDoc(labRef, {
        ...laboratory,
        members: laboratory.members.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        ...laboratory,
        id: labRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating laboratory:', error);
      throw error;
    }
  }

  /**
   * Rejoindre un laboratoire avec un code d'invitation
   */
  static async joinLaboratory(
    inviteCode: string,
    userId: string,
    userDisplayName: string,
    userEmail: string
  ): Promise<Laboratory> {
    try {
      // Chercher le laboratoire avec ce code d'invitation
      const labsQuery = query(
        collection(db, 'laboratories'),
        where('inviteCode', '==', inviteCode)
      );
      const labsSnapshot = await getDocs(labsQuery);

      if (labsSnapshot.empty) {
        throw new Error('Code d\'invitation invalide');
      }

      const labDoc = labsSnapshot.docs[0];
      const labData = labDoc.data() as Laboratory;

      // Vérifier si l'utilisateur n'est pas déjà membre
      const isAlreadyMember = labData.members.some(member => member.userId === userId);
      if (isAlreadyMember) {
        throw new Error('Vous êtes déjà membre de ce laboratoire');
      }

      // Créer le nouveau membre
      const newMember: LaboratoryMember = {
        userId,
        displayName: userDisplayName,
        email: userEmail,
        role: 'member',
        joinedAt: new Date(),
        permissions: {
          canManageMembers: false,
          canManageEquipment: false,
          canManageMissions: true,
          canManageSamples: true,
          canModifyLayout: false
        }
      };

      // Ajouter le membre au laboratoire
      await updateDoc(doc(db, 'laboratories', labDoc.id), {
        members: arrayUnion({
          ...newMember,
          joinedAt: Timestamp.fromDate(newMember.joinedAt)
        }),
        updatedAt: serverTimestamp()
      });

      // Retourner le laboratoire mis à jour
      const updatedLab = await this.getLaboratory(labDoc.id);
      if (!updatedLab) {
        throw new Error('Erreur lors de la récupération du laboratoire');
      }

      return updatedLab;
    } catch (error) {
      console.error('Error joining laboratory:', error);
      throw error;
    }
  }

  /**
   * Récupérer un laboratoire par ID
   */
  static async getLaboratory(labId: string): Promise<Laboratory | null> {
    try {
      const labDoc = await getDoc(doc(db, 'laboratories', labId));
      if (labDoc.exists()) {
        const data = labDoc.data();
        return {
          id: labDoc.id,
          ...data,
                       members: data.members.map((member: LaboratoryMember & { joinedAt: any }) => ({
            ...member,
            joinedAt: member.joinedAt.toDate()
          })),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Laboratory;
      }
      return null;
    } catch (error) {
      console.error('Error getting laboratory:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les laboratoires d'un utilisateur
   */
  static async getUserLaboratories(userId: string): Promise<Laboratory[]> {
    try {
      const labsQuery = query(
        collection(db, 'laboratories'),
        where('members', 'array-contains-any', [{ userId }])
      );
      const labsSnapshot = await getDocs(labsQuery);

      const laboratories: Laboratory[] = [];
      for (const labDoc of labsSnapshot.docs) {
        const data = labDoc.data();
        // Vérifier si l'utilisateur est vraiment membre
                 const isMember = data.members.some((member: LaboratoryMember) => member.userId === userId);
        if (isMember) {
          laboratories.push({
            id: labDoc.id,
            ...data,
            members: data.members.map((member: LaboratoryMember & { joinedAt: any }) => ({
              ...member,
              joinedAt: member.joinedAt.toDate()
            })),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Laboratory);
        }
      }

      return laboratories;
    } catch (error) {
      console.error('Error getting user laboratories:', error);
      throw error;
    }
  }

  /**
   * Générer un nouveau code d'invitation
   */
  static async regenerateInviteCode(labId: string, userId: string): Promise<string> {
    try {
      const lab = await this.getLaboratory(labId);
      if (!lab) {
        throw new Error('Laboratoire non trouvé');
      }

      // Vérifier les permissions
      const member = lab.members.find(m => m.userId === userId);
      if (!member || (!member.permissions.canManageMembers && member.role !== 'owner')) {
        throw new Error('Permissions insuffisantes');
      }

      const newInviteCode = this.generateInviteCode();
      await updateDoc(doc(db, 'laboratories', labId), {
        inviteCode: newInviteCode,
        updatedAt: serverTimestamp()
      });

      return newInviteCode;
    } catch (error) {
      console.error('Error regenerating invite code:', error);
      throw error;
    }
  }

  /**
   * Retirer un membre du laboratoire
   */
  static async removeMember(labId: string, memberUserId: string, requestUserId: string): Promise<void> {
    try {
      const lab = await this.getLaboratory(labId);
      if (!lab) {
        throw new Error('Laboratoire non trouvé');
      }

      const requestMember = lab.members.find(m => m.userId === requestUserId);
      const targetMember = lab.members.find(m => m.userId === memberUserId);

      if (!requestMember || !targetMember) {
        throw new Error('Membre non trouvé');
      }

      // Vérifier les permissions
      if (requestMember.role !== 'owner' && !requestMember.permissions.canManageMembers) {
        throw new Error('Permissions insuffisantes');
      }

      // Ne pas permettre de retirer le propriétaire
      if (targetMember.role === 'owner') {
        throw new Error('Impossible de retirer le propriétaire');
      }

      // Retirer le membre
      await updateDoc(doc(db, 'laboratories', labId), {
        members: arrayRemove(targetMember),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les permissions d'un membre
   */
  static async updateMemberPermissions(
    labId: string,
    memberUserId: string,
    newPermissions: LaboratoryPermissions,
    requestUserId: string
  ): Promise<void> {
    try {
      const lab = await this.getLaboratory(labId);
      if (!lab) {
        throw new Error('Laboratoire non trouvé');
      }

      const requestMember = lab.members.find(m => m.userId === requestUserId);
      if (!requestMember || (requestMember.role !== 'owner' && !requestMember.permissions.canManageMembers)) {
        throw new Error('Permissions insuffisantes');
      }

      const updatedMembers = lab.members.map(member => {
        if (member.userId === memberUserId && member.role !== 'owner') {
          return { ...member, permissions: newPermissions };
        }
        return member;
      });

      await updateDoc(doc(db, 'laboratories', labId), {
        members: updatedMembers.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        })),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating member permissions:', error);
      throw error;
    }
  }

  /**
   * Quitter un laboratoire
   */
  static async leaveLaboratory(labId: string, userId: string): Promise<void> {
    try {
      const lab = await this.getLaboratory(labId);
      if (!lab) {
        throw new Error('Laboratoire non trouvé');
      }

      const member = lab.members.find(m => m.userId === userId);
      if (!member) {
        throw new Error('Vous n\'êtes pas membre de ce laboratoire');
      }

      if (member.role === 'owner') {
        throw new Error('Le propriétaire ne peut pas quitter le laboratoire');
      }

      await updateDoc(doc(db, 'laboratories', labId), {
        members: arrayRemove(member),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error leaving laboratory:', error);
      throw error;
    }
  }

  /**
   * Générer un code d'invitation unique
   */
  private static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Vérifier si un utilisateur peut effectuer une action dans un laboratoire
   */
  static async canUserPerformAction(
    labId: string,
    userId: string,
    action: keyof LaboratoryPermissions
  ): Promise<boolean> {
    try {
      const lab = await this.getLaboratory(labId);
      if (!lab) return false;

      const member = lab.members.find(m => m.userId === userId);
      if (!member) return false;

      if (member.role === 'owner') return true;
      
      return member.permissions[action];
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }
} 