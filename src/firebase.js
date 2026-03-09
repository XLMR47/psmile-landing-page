// Firebase Configuration for PSMILE Portal de Inteligencia Mental
// ================================================================
// Proyecto: psmile-portal (Plan Spark - 100% Gratuito)
// Servicios: Authentication + Firestore
// ================================================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBiCnZbixWTWdeZmWLvC-f_PhfMk_7Epo0",
    authDomain: "psmile-portal.firebaseapp.com",
    projectId: "psmile-portal",
    storageBucket: "psmile-portal.firebasestorage.app",
    messagingSenderId: "36683243143",
    appId: "1:36683243143:web:e0b721cd378ca90497e222",
    measurementId: "G-J730MJ2L5W"
};

// Evitar inicialización duplicada (Vite HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
