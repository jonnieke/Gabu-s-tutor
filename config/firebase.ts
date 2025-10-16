import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBqBYxOcIBIx3BLFI6-suErpAx5nxb8TF0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "somaai-gabu.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "somaai-gabu",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "somaai-gabu.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "317429740899",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:317429740899:web:39a02cfe21a88b218a4f56",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-G7D5GBTSQQ"
};

// Check if Firebase is configured with real values (not demo values)
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => 
  value && 
  value !== 'undefined' && 
  !value.includes('demo-') && 
  !value.includes('123456789') && 
  !value.includes('abcdef') &&
  !value.includes('G-XXXXXXXXXX')
);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured - running in offline mode');
}

// Export Firebase services (will be null if not configured)
export { auth, db, storage };

export default app;
