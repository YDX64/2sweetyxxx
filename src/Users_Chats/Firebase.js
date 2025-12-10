import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "****************",
  authDomain: "******************",
  projectId: "**************",
  storageBucket: "****************",
  messagingSenderId: "*****************",
  appId: "*************************",
  measurementId: "****************"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const database = getDatabase(app);
const messaging = getMessaging(app);

// Export initialized Firebase services
export { db, database, messaging };
