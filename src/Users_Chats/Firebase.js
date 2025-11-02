import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "sweet-a6718.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sweet-a6718",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "sweet-a6718.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "487435792097",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:487435792097:web:12907427892d53c82251a0",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-EQGMN8DYDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const database = getDatabase(app);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

// Export initialized Firebase services
export { db, database, messaging, analytics };
