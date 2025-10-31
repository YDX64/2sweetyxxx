import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to",
  authDomain: "sweet-a6718.firebaseapp.com",
  projectId: "sweet-a6718",
  storageBucket: "sweet-a6718.firebasestorage.app",
  messagingSenderId: "487435792097",
  appId: "1:487435792097:web:12907427892d53c82251a0",
  measurementId: "G-EQGMN8DYDP"
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
