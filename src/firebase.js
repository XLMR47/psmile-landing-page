// Firebase Configuration for PSMILE Portal de Inteligencia Mental
// ================================================================
// Proyecto: psmile2026 (con Storage habilitado)
// Servicios: Authentication + Firestore + Storage
// Consola: https://console.firebase.google.com/project/psmile2026
// ================================================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAYaph-_WUhLF_wxRUdnu08g-t-Kun54GU",
  authDomain: "psmile2026.firebaseapp.com",
  projectId: "psmile2026",
  storageBucket: "psmile2026.firebasestorage.app",
  messagingSenderId: "38615933881",
  appId: "1:38615933881:web:ea1d3bbc8aa264cf478c68",
  measurementId: "G-VS60H6C3YN"
};

// Evitar inicialización duplicada (Vite HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
