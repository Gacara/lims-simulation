import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqbGzrgYMB59lbdQdvtrEzPrKOtRoR7JQ",
  authDomain: "lims-simulation.firebaseapp.com",
  projectId: "lims-simulation",
  storageBucket: "lims-simulation.firebasestorage.app",
  messagingSenderId: "278209641444",
  appId: "1:278209641444:web:706addd879296831fd65f1",
  measurementId: "G-S0YNCHE6ME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development (only if not in production)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔥 Connected to Firebase emulators');
  } catch (error) {
    console.log('Firebase emulators connection failed:', error);
  }
}

export default app;