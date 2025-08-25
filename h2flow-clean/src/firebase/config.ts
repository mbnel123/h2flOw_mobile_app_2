// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8v4eIC6mtQWh8cn_l3R2Tg7uCXjwsfik",
  authDomain: "h2-flow.firebaseapp.com",
  projectId: "h2-flow",
  storageBucket: "h2-flow.firebasestorage.app",
  messagingSenderId: "822614712443",
  appId: "1:822614712443:web:5dd741ea0afec19a09c2de",
  measurementId: "G-E61BHHQ29Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
