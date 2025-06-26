import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { QRCodeGenerator, sampleQRUtils } from '../utils/qrCodeGenerator';
import type { User, Laboratory, Sample, Mission, Analysis, Equipment } from '../types';

/**
 * Firebase service for managing laboratory data
 */
export class FirebaseService {
  
  // User management
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Laboratory management
  static async createLaboratory(labData: Omit<Laboratory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'laboratories'), {
        ...labData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating laboratory:', error);
      throw error;
    }
  }

  static async getLaboratory(labId: string): Promise<Laboratory | null> {
    try {
      const docSnap = await getDoc(doc(db, 'laboratories', labId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Laboratory;
      }
      return null;
    } catch (error) {
      console.error('Error getting laboratory:', error);
      throw error;
    }
  }

  static async updateLaboratory(labId: string, updates: Partial<Laboratory>): Promise<void> {
    try {
      await updateDoc(doc(db, 'laboratories', labId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating laboratory:', error);
      throw error;
    }
  }

  // Sample management with QR codes
  static async createSampleWithQR(
    sampleData: Omit<Sample, 'id' | 'qrCode' | 'createdAt' | 'updatedAt'>,
    laboratoryId: string
  ): Promise<Sample> {
    try {
      // Generate sample with QR code
      const sample = await sampleQRUtils.createSampleWithQR(sampleData, laboratoryId);
      
      // Upload QR code image to Firebase Storage
      const qrImageRef = ref(storage, `qr-codes/${sample.id}.png`);
      const qrImageBlob = await fetch(sample.qrCode).then(r => r.blob());
      await uploadBytes(qrImageRef, qrImageBlob);
      const qrImageURL = await getDownloadURL(qrImageRef);
      
      // Save sample to Firestore
      const docRef = await addDoc(collection(db, 'samples'), {
        ...sample,
        qrCode: qrImageURL, // Store the Firebase Storage URL
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return {
        ...sample,
        id: docRef.id,
        qrCode: qrImageURL
      };
    } catch (error) {
      console.error('Error creating sample with QR:', error);
      throw error;
    }
  }

  static async getSample(sampleId: string): Promise<Sample | null> {
    try {
      const docSnap = await getDoc(doc(db, 'samples', sampleId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Sample;
      }
      return null;
    } catch (error) {
      console.error('Error getting sample:', error);
      throw error;
    }
  }

  static async getSamplesByLaboratory(laboratoryId: string): Promise<Sample[]> {
    try {
      const q = query(
        collection(db, 'samples'),
        where('laboratoryId', '==', laboratoryId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sample[];
    } catch (error) {
      console.error('Error getting samples by laboratory:', error);
      throw error;
    }
  }

  static async updateSample(sampleId: string, updates: Partial<Sample>): Promise<void> {
    try {
      await updateDoc(doc(db, 'samples', sampleId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating sample:', error);
      throw error;
    }
  }

  // Mission management
  static async createMission(missionData: Omit<Mission, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'missions'), {
        ...missionData,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating mission:', error);
      throw error;
    }
  }

  static async getAvailableMissions(): Promise<Mission[]> {
    try {
      const q = query(
        collection(db, 'missions'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mission[];
    } catch (error) {
      console.error('Error getting available missions:', error);
      throw error;
    }
  }

  static async updateMission(missionId: string, updates: Partial<Mission>): Promise<void> {
    try {
      await updateDoc(doc(db, 'missions', missionId), updates);
    } catch (error) {
      console.error('Error updating mission:', error);
      throw error;
    }
  }

  // Analysis management
  static async createAnalysis(analysisData: Omit<Analysis, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'analyses'), {
        ...analysisData,
        startedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  }

  static async getAnalysesBySample(sampleId: string): Promise<Analysis[]> {
    try {
      const q = query(
        collection(db, 'analyses'),
        where('sampleId', '==', sampleId),
        orderBy('startedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Analysis[];
    } catch (error) {
      console.error('Error getting analyses by sample:', error);
      throw error;
    }
  }

  static async updateAnalysis(analysisId: string, updates: Partial<Analysis>): Promise<void> {
    try {
      await updateDoc(doc(db, 'analyses', analysisId), {
        ...updates,
        ...(updates.status === 'completed' && { completedAt: Timestamp.now() })
      });
    } catch (error) {
      console.error('Error updating analysis:', error);
      throw error;
    }
  }

  // Equipment management
  static async addEquipmentToLaboratory(
    laboratoryId: string, 
    equipment: Omit<Equipment, 'id' | 'purchasedAt' | 'lastMaintenance'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'equipment'), {
        ...equipment,
        laboratoryId,
        purchasedAt: Timestamp.now(),
        lastMaintenance: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  }

  static async getEquipmentByLaboratory(laboratoryId: string): Promise<Equipment[]> {
    try {
      const q = query(
        collection(db, 'equipment'),
        where('laboratoryId', '==', laboratoryId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];
    } catch (error) {
      console.error('Error getting equipment by laboratory:', error);
      throw error;
    }
  }

  // QR Code validation
  static async validateQRCode(qrString: string, laboratoryId: string): Promise<Sample | null> {
    try {
      const sampleId = sampleQRUtils.validateScannedQR(qrString, laboratoryId);
      if (!sampleId) {
        return null;
      }
      
      return await this.getSample(sampleId);
    } catch (error) {
      console.error('Error validating QR code:', error);
      throw error;
    }
  }
}