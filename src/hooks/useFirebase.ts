import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  onSnapshot,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { testFirebaseConnection, getFirebaseInfo } from '../utils/firebaseTest';
import type { User, Laboratory, Sample, Mission, Analysis } from '../types';

// Hook to test Firebase connection status
export function useFirebaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [projectInfo, setProjectInfo] = useState<{ projectId?: string; authDomain?: string; storageBucket?: string } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await testFirebaseConnection();
        setIsConnected(connected);
        
        if (connected) {
          const info = getFirebaseInfo();
          setProjectInfo(info);
          console.log('🔥 Firebase project info:', info);
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionError(error instanceof Error ? error.message : 'Unknown error');
        console.error('🔥 Firebase connection failed:', error);
      }
    };

    testConnection();
  }, []);

  return { isConnected, projectInfo, connectionError };
}

// Generic Firestore hook for CRUD operations
export function useFirestore<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add document');
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    }
  };

  const getById = async (id: string): Promise<T | null> => {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get document');
      throw err;
    }
  };

  const getAll = async (constraints?: QueryConstraint[]) => {
    try {
      setLoading(true);
      const q = constraints 
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName);
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      setData(items);
      setError(null);
      return items;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  const subscribe = (constraints?: QueryConstraint[]) => {
    const q = constraints 
      ? query(collection(db, collectionName), ...constraints)
      : collection(db, collectionName);

    return onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    getById,
    getAll,
    subscribe,
  };
}

// Specific hooks for each data type
export const useUsers = () => useFirestore<User>('users');
export const useLaboratories = () => useFirestore<Laboratory>('laboratories');
export const useSamples = () => useFirestore<Sample>('samples');
export const useMissions = () => useFirestore<Mission>('missions');
export const useAnalyses = () => useFirestore<Analysis>('analyses');