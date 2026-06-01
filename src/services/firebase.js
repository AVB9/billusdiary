// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// =================================================================
// THE EMULATOR HIJACK
// =================================================================
const currentHost = window.location.hostname;
const isLocal = currentHost === "localhost" || currentHost === "127.0.0.1" || currentHost.startsWith("192.168.") || currentHost.startsWith("10.");

if (isLocal) {
    connectAuthEmulator(auth, `http://${currentHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, currentHost, 8080);
    console.log(`🛠️ Connected to Local Firebase Emulator via ${currentHost}`);
}

export default app;