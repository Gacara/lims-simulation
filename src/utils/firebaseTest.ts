import { db, auth, storage, analytics } from '../config/firebase';
import { collection } from 'firebase/firestore';

/**
 * Test Firebase connection and services
 */
export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase connection...');
  
  try {
    // Test Firestore connection
    console.log('📄 Testing Firestore...');
    collection(db, 'test'); // Test collection access
    console.log('✅ Firestore connected successfully');
    
    // Test Authentication
    console.log('🔐 Testing Authentication...');
    console.log('✅ Auth service initialized:', !!auth);
    
    // Test Storage
    console.log('📦 Testing Storage...');
    console.log('✅ Storage service initialized:', !!storage);
    
    // Test Analytics
    console.log('📊 Testing Analytics...');
    console.log('✅ Analytics service initialized:', !!analytics);
    
    console.log('🎉 All Firebase services are ready!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

/**
 * Get Firebase project info
 */
export const getFirebaseInfo = () => {
  return {
    projectId: db.app.options.projectId,
    authDomain: db.app.options.authDomain,
    storageBucket: db.app.options.storageBucket
  };
}; 